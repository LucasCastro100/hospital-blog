import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminPostsController, PublicPostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [PrismaModule],
  controllers: [PublicPostsController, AdminPostsController],
  providers: [PostsService],
})
export class PostsModule {}
