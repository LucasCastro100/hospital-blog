import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminDisplaysController, PublicDisplaysController } from "./displays.controller";
import { DisplaysService } from "./displays.service";

@Module({
  imports: [PrismaModule],
  controllers: [PublicDisplaysController, AdminDisplaysController],
  providers: [DisplaysService],
})
export class DisplaysModule {}
