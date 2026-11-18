import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.active || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("E-mail ou senha incorretos");
    }

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };

    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: this.config.get<string>("JWT_SECRET"),
        expiresIn: (this.config.get<string>("JWT_EXPIRES_IN") ?? "8h") as never,
      }),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
