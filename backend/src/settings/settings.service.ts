import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.siteSetting.upsert({
      where: { id: "main" },
      create: {},
      update: {},
    });
  }

  update(dto: UpdateSettingsDto) {
    return this.prisma.siteSetting.upsert({
      where: { id: "main" },
      create: dto,
      update: dto,
    });
  }
}
