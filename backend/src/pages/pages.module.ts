import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminPagesController, PublicPagesController } from "./pages.controller";
import { PagesService } from "./pages.service";

@Module({
  imports: [PrismaModule],
  controllers: [PublicPagesController, AdminPagesController],
  providers: [PagesService],
})
export class PagesModule {}
