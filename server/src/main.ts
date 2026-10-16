import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export const configureApp = (app: INestApplication) => {
  app.setGlobalPrefix("api");
  app.enableCors({ origin: "http://localhost:5173" });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
};

if (require.main === module) {
  void bootstrap();
}
