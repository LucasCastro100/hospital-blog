import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ControlDisplayDto, CreateDisplayDto, DisplayHeartbeatDto, UpdateDisplayDto } from "./dto/display.dto";
import { DisplaysService } from "./displays.service";

@Controller("displays")
export class PublicDisplaysController {
  constructor(private readonly displaysService: DisplaysService) {}

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.displaysService.findBySlug(slug);
  }

  /** Estado atual da tela — a TV consulta em intervalos curtos para obedecer o controle remoto. */
  @Get(":slug/state")
  getState(@Param("slug") slug: string) {
    return this.displaysService.getState(slug);
  }

  /** A TV informa qual conteúdo está exibindo, mantendo o controle remoto em sincronia. */
  @Post(":slug/heartbeat")
  @HttpCode(200)
  heartbeat(@Param("slug") slug: string, @Body() dto: DisplayHeartbeatDto) {
    return this.displaysService.heartbeat(slug, dto.postId);
  }
}

@Controller("admin/displays")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
export class AdminDisplaysController {
  constructor(private readonly displaysService: DisplaysService) {}

  @Get()
  findAll() {
    return this.displaysService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.displaysService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateDisplayDto) {
    return this.displaysService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateDisplayDto) {
    return this.displaysService.update(id, dto);
  }

  /** Comandos do controle remoto (celular). */
  @Post(":id/control")
  @HttpCode(200)
  control(@Param("id") id: string, @Body() dto: ControlDisplayDto) {
    return this.displaysService.control(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.displaysService.remove(id);
  }
}
