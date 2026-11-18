import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DisplaysModule } from "./displays/displays.module";
import { PagesModule } from "./pages/pages.module";
import { PostsModule } from "./posts/posts.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SettingsModule } from "./settings/settings.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DisplaysModule,
    UsersModule,
    PostsModule,
    PagesModule,
    SettingsModule,
  ],
})
export class AppModule {}
