// Polyfill for crypto in production
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

process.on('unhandledRejection', (reason) => {
  console.error('[startup] UnhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[startup] UncaughtException', err);
});

async function bootstrap() {
  try {
    console.log('===== BOOTSTRAP FUNCTION STARTED =====');
    console.log('===== THIS IS OUR CUSTOM CODE =====');
    
    // Early env visibility before NestFactory.create
    const envDbUrl = process.env.DATABASE_URL;
    if (envDbUrl) {
      try {
        const u = new URL(envDbUrl);
        console.log(`[startup] (pre-create) DATABASE_URL host=${u.host} db=${u.pathname.replace('/', '')}`);
      } catch {
        console.log('[startup] (pre-create) DATABASE_URL present but unparsable');
      }
    } else {
      console.log('[startup] (pre-create) DATABASE_URL is NOT set');
    }

    console.log('[bootstrap] About to call NestFactory.create');
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
      rawBody: true,
    });
    console.log('[bootstrap] NestFactory.create completed - app object exists:', !!app);
    console.log('[bootstrap] App type:', typeof app);

    app.enableCors({ origin: true, credentials: true });
    console.log('[bootstrap] CORS enabled');
    
    // Increase body size limit for file uploads
    app.use(require('express').json({ limit: '50mb' }));
    app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
    console.log('[bootstrap] Body parsers configured');
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log('[bootstrap] Global pipes configured');
    // Throttler guard is registered globally in AppModule via APP_GUARD

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    console.log(`[bootstrap] Port configured: ${port}`);
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const u = new URL(dbUrl);
        console.log(`[bootstrap] DATABASE_URL host=${u.host} db=${u.pathname.replace('/', '')}`);
      } catch {
        console.log('[bootstrap] DATABASE_URL present but unparsable');
      }
    } else {
      console.log('[bootstrap] DATABASE_URL is NOT set');
    }
    console.log(`[bootstrap] About to listen on 0.0.0.0:${port}`);
    await app.listen(port, '0.0.0.0');
    console.log(`[bootstrap] Listening on 0.0.0.0:${port}`);
    console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('[bootstrap] ERROR in bootstrap function:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('[bootstrap] Fatal error during startup:', error);
  process.exit(1);
});
