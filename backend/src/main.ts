import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Transcendence')
    .setDescription('The Transcendence API')
    .setVersion('1.0')
    .addTag('transcendence')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  app.use(cookieParser())

  // Disable X-Powered-By express
  app.getHttpAdapter().getInstance().disable('X-Powered-By');

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

bootstrap();
