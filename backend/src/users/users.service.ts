import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

const safeUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: safeUser, orderBy: { createdAt: "asc" } });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException("Este e-mail já está cadastrado");

    const { password, ...data } = dto;
    return this.prisma.user.create({
      data: { ...data, passwordHash: await hash(password, 10) },
      select: safeUser,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { password, ...data } = dto;
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await hash(password, 10) } : {}),
      },
      select: safeUser,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: "Usuário removido" };
  }

  private async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }
}
