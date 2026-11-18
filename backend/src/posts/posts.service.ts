import { Injectable, NotFoundException } from "@nestjs/common";
import { PostStatus, Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, ReorderDto, UpdatePostDto } from "./dto/post.dto";

const postSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImage: true,
  status: true,
  order: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { name: true } },
  blocks: { orderBy: { order: "asc" as const } },
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { order: "asc" },
      select: postSelect,
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED },
      select: postSelect,
    });
    if (!post) throw new NotFoundException("Conteúdo não encontrado");
    return post;
  }

  findAll() {
    return this.prisma.post.findMany({ orderBy: { order: "asc" }, select: postSelect });
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, select: postSelect });
    if (!post) throw new NotFoundException("Conteúdo não encontrado");
    return post;
  }

  async create(dto: CreatePostDto, authorId: string) {
    const status = dto.status ?? PostStatus.DRAFT;
    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug: `${slugify(dto.title) || "conteudo"}-${randomBytes(3).toString("hex")}`,
        summary: dto.summary,
        coverImage: dto.coverImage,
        status,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
        order: (await this.prisma.post.count()) + 1,
        authorId,
        blocks: {
          create: (dto.blocks ?? []).map((block, index) => ({
            type: block.type,
            content: block.content as Prisma.InputJsonValue,
            order: block.order ?? index,
          })),
        },
      },
      select: postSelect,
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.findById(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.blocks) await tx.block.deleteMany({ where: { postId: id } });
      return tx.post.update({
        where: { id },
        data: {
          title: dto.title,
          summary: dto.summary,
          coverImage: dto.coverImage,
          status: dto.status,
          publishedAt:
            dto.status === PostStatus.PUBLISHED
              ? (existing.publishedAt ?? new Date())
              : dto.status
                ? null
                : undefined,
          ...(dto.blocks
            ? {
                blocks: {
                  create: dto.blocks.map((block, index) => ({
                    type: block.type,
                    content: block.content as Prisma.InputJsonValue,
                    order: block.order ?? index,
                  })),
                },
              }
            : {}),
        },
        select: postSelect,
      });
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.post.delete({ where: { id } });
    return { message: "Conteúdo removido" };
  }

  async reorder(dto: ReorderDto) {
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.post.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    return { message: "Ordem atualizada" };
  }
}
