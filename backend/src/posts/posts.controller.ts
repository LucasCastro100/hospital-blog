import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { AuthenticatedUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePostDto, ReorderDto, UpdatePostDto } from "./dto/post.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findPublished() {
    return this.postsService.findPublished();
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.postsService.findBySlug(slug);
  }
}

@Controller("admin/posts")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.postsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.create(dto, user.userId);
  }

  @Patch("reorder")
  reorder(@Body() dto: ReorderDto) {
    return this.postsService.reorder(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.postsService.remove(id);
  }
}
