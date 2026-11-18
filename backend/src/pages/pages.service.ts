import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePageDto, UpdatePageDto } from "./dto/page.dto";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  }

  async findById(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException("Página não encontrada");
    return page;
  }

  async findPublishedBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({ where: { slug, published: true } });
    if (!page) throw new NotFoundException("Página não encontrada");
    return page;
  }

  create(dto: CreatePageDto) {
    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: slugify(dto.slug?.trim() || dto.title),
        published: dto.published ?? true,
        blocks: (dto.blocks ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findById(id);
    const data: Prisma.PageUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = slugify(dto.slug);
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.blocks !== undefined) data.blocks = dto.blocks as unknown as Prisma.InputJsonValue;
    return this.prisma.page.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.page.delete({ where: { id } });
  }
}
