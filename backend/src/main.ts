import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/** Origens liberadas quando `CORS_ORIGINS` não está definido em desenvolvimento. */
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3005",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3005",
];

/**
 * Origens permitidas no CORS, definidas em `CORS_ORIGINS` (separadas por vírgula).
 * Em desenvolvimento, sem a variável, libera apenas o frontend local; em produção,
 * sem a variável, nenhuma origem de navegador é liberada (o padrão é negar).
 */
function allowedOrigins(): string[] {
  const configured = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) return configured;

  if (process.env.NODE_ENV === "production") {
    new Logger("CORS").warn("CORS_ORIGINS não definido: nenhuma origem de navegador será liberada.");
    return [];
  }

  return DEV_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({ origin: allowedOrigins(), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}/api`);
}
void bootstrap();
