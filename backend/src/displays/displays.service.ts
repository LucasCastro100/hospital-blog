import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PostStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  ControlDisplayDto,
  CreateDisplayDto,
  DisplayControlAction,
  UpdateDisplayDto,
} from "./dto/display.dto";

const displaySelect = {
  id: true,
  name: true,
  slug: true,
  active: true,
  paused: true,
  pinnedPostId: true,
  currentPostId: true,
  intervalMs: true,
  createdAt: true,
  updatedAt: true,
  posts: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      order: true,
      status: true,
    },
  },
};

/** Estado consumido pela TV (polling) e pelo controle no celular. */
const stateSelect = {
  id: true,
  name: true,
  slug: true,
  active: true,
  paused: true,
  pinnedPostId: true,
  currentPostId: true,
  intervalMs: true,
  stateVersion: true,
  posts: {
    where: { status: PostStatus.PUBLISHED },
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      order: true,
    },
  },
};

const publishedPostIds = {
  where: { status: PostStatus.PUBLISHED },
  orderBy: { order: "asc" as const },
  select: { id: true },
};

/** Janela em que um heartbeat da TV é ignorado após um comando do celular. */
const COMMAND_GRACE_MS = 6000;

@Injectable()
export class DisplaysService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.displayScreen.findMany({
      orderBy: { name: "asc" },
      select: displaySelect,
    });
  }

  async findById(id: string) {
    const display = await this.prisma.displayScreen.findUnique({
      where: { id },
      select: displaySelect,
    });
    if (!display) throw new NotFoundException("Tela de exibição não encontrada");
    return display;
  }

  async findBySlug(slug: string) {
    const display = await this.prisma.displayScreen.findFirst({
      where: { slug, active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        posts: {
          where: { status: PostStatus.PUBLISHED },
          orderBy: { order: "asc" as const },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            coverImage: true,
            order: true,
            status: true,
            publishedAt: true,
            author: { select: { name: true } },
            blocks: { orderBy: { order: "asc" as const } },
          },
        },
      },
    });
    if (!display) throw new NotFoundException("Tela de exibição não encontrada");
    return display;
  }

  async getState(slug: string) {
    const display = await this.prisma.displayScreen.findFirst({
      where: { slug, active: true },
      select: stateSelect,
    });
    if (!display) throw new NotFoundException("Tela de exibição não encontrada");
    return display;
  }

  async create(dto: CreateDisplayDto) {
    await this.ensureSlugAvailable(dto.slug);
    await this.ensurePostsExist(dto.postIds ?? []);

    return this.prisma.displayScreen.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        active: dto.active ?? true,
        posts: { connect: (dto.postIds ?? []).map((id) => ({ id })) },
      },
      select: displaySelect,
    });
  }

  async update(id: string, dto: UpdateDisplayDto) {
    await this.findById(id);
    if (dto.slug) await this.ensureSlugAvailable(dto.slug, id);
    if (dto.postIds) await this.ensurePostsExist(dto.postIds);

    return this.prisma.displayScreen.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        active: dto.active,
        ...(dto.postIds
          ? { posts: { set: dto.postIds.map((postId) => ({ id: postId })) } }
          : {}),
      },
      select: displaySelect,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.displayScreen.delete({ where: { id } });
    return { message: "Tela de exibição removida" };
  }

  /** Aplica um comando vindo do controle remoto (celular). */
  async control(id: string, dto: ControlDisplayDto) {
    const display = await this.prisma.displayScreen.findUnique({
      where: { id },
      select: {
        id: true,
        paused: true,
        pinnedPostId: true,
        currentPostId: true,
        intervalMs: true,
        posts: publishedPostIds,
      },
    });
    if (!display) throw new NotFoundException("Tela de exibição não encontrada");

    const postIds = display.posts.map((post) => post.id);
    const data: Prisma.DisplayScreenUpdateInput = {
      stateVersion: { increment: 1 },
      lastCommandAt: new Date(),
    };

    switch (dto.action) {
      case DisplayControlAction.PAUSE:
        data.paused = true;
        break;
      case DisplayControlAction.RESUME:
        data.paused = false;
        break;
      case DisplayControlAction.NEXT:
        data.currentPostId = this.step(postIds, display.currentPostId, 1);
        break;
      case DisplayControlAction.PREV:
        data.currentPostId = this.step(postIds, display.currentPostId, -1);
        break;
      case DisplayControlAction.GOTO:
        data.currentPostId = this.requirePost(postIds, dto.postId);
        break;
      case DisplayControlAction.PIN:
        data.pinnedPostId = this.requirePost(postIds, dto.postId);
        data.currentPostId = data.pinnedPostId;
        break;
      case DisplayControlAction.UNPIN:
        data.pinnedPostId = null;
        break;
      case DisplayControlAction.INTERVAL:
        data.intervalMs = dto.intervalMs ?? null;
        break;
    }

    await this.prisma.displayScreen.update({ where: { id }, data });
    return this.getStateById(id);
  }

  /** A TV avisa qual conteúdo está exibindo para manter o celular em sincronia. */
  async heartbeat(slug: string, postId: string) {
    const display = await this.prisma.displayScreen.findFirst({
      where: { slug, active: true },
      select: {
        id: true,
        paused: true,
        pinnedPostId: true,
        currentPostId: true,
        lastCommandAt: true,
        posts: publishedPostIds,
      },
    });
    if (!display) throw new NotFoundException("Tela de exibição não encontrada");

    const recentCommand =
      display.lastCommandAt !== null &&
      Date.now() - display.lastCommandAt.getTime() < COMMAND_GRACE_MS;
    const alreadyInSync = display.currentPostId === postId;
    const belongsToScreen = display.posts.some((post) => post.id === postId);

    if (
      display.paused ||
      display.pinnedPostId ||
      recentCommand ||
      alreadyInSync ||
      !belongsToScreen
    ) {
      return { ok: true };
    }

    await this.prisma.displayScreen.update({
      where: { id: display.id },
      data: { currentPostId: postId },
    });
    return { ok: true };
  }

  private getStateById(id: string) {
    return this.prisma.displayScreen.findUniqueOrThrow({
      where: { id },
      select: stateSelect,
    });
  }

  private step(postIds: string[], currentPostId: string | null, delta: 1 | -1) {
    if (postIds.length === 0) return null;
    const index = currentPostId ? postIds.indexOf(currentPostId) : -1;
    if (index === -1) return delta > 0 ? postIds[0] : postIds[postIds.length - 1];
    return postIds[(index + delta + postIds.length) % postIds.length];
  }

  private requirePost(postIds: string[], postId?: string) {
    if (!postId) throw new BadRequestException("Informe o conteúdo");
    if (!postIds.includes(postId)) {
      throw new BadRequestException("Este conteúdo não está na tela ou não está publicado");
    }
    return postId;
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: string) {
    const existing = await this.prisma.displayScreen.findUnique({ where: { slug } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException("Já existe uma tela com este slug");
    }
  }

  private async ensurePostsExist(postIds: string[]) {
    const count = await this.prisma.post.count({ where: { id: { in: postIds } } });
    if (count !== postIds.length) {
      throw new NotFoundException("Um dos conteúdos selecionados não existe");
    }
  }
}
