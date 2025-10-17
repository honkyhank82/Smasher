// Polyfill for crypto in production
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  app.enableCors({ origin: true, credentials: true });
  
  // Increase body size limit for file uploads
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Throttler guard is registered globally in AppModule via APP_GUARD

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
}
bootstrap();
