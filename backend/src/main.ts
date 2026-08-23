import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { EntityNotFoundFilter } from './common/entity-not-found/entity-not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //entity not found filter
  app.useGlobalFilters(new EntityNotFoundFilter());

  //cookie parser
  app.use(cookieParser());
  //validation pipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  //cors
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
