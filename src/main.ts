import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS
  app.enableCors({
    origin: true, // Cho phép tất cả origins, hoặc chỉ định cụ thể: ['http://localhost:3000', 'http://localhost:5173']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Bật validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Tăng giới hạn kích thước body cho file upload (5MB)
  app.use((req, res, next) => {
    if (req.url.includes('/avatar')) {
      req.headers['content-type'] = 'multipart/form-data';
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
