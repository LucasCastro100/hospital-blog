import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePageDto, UpdatePageDto } from "./dto/page.dto";
import { PagesService } from "./pages.service";

@Controller("pages")
export class PublicPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(":slug")
  findPublishedBySlug(@Param("slug") slug: string) {
    return this.pagesService.findPublishedBySlug(slug);
  }
}

@Controller("admin/pages")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.pagesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pagesService.remove(id);
  }
}
