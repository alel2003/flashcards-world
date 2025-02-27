import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { DESCRIPTION_API_PROJECT, NAME_API_PROJECT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'warn', 'error']
  });
  
  const configService = app.get(ConfigService);

  // documentation with Swagger
  const config = new DocumentBuilder()
    .setTitle(NAME_API_PROJECT)
    .setDescription(DESCRIPTION_API_PROJECT)
    .setVersion('1.0')
    .build();

  // enable CORS
  app.enableCors({
    origin: ['*'],
    credentials: true
  });

  // enable cookie parser
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  // Swagger
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.getOrThrow<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();