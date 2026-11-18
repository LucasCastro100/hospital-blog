import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PostStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDisplayDto, UpdateDisplayDto } from "./dto/display.dto";

const displaySelect = {
  id: true,
  name: true,
  slug: true,
  active: true,
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
