import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import serverless from 'serverless-http';

let serverPromise: Promise<any> | undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

export default async function handler(req: any, res: any) {
  if (!serverPromise) {
    serverPromise = bootstrap();
  }

  try {
    const server = await serverPromise;
    return server(req, res);
  } catch (error) {
    serverPromise = undefined;
    console.error('NestJS bootstrap failed:', error);
    res.statusCode = 500;
    return res.end('Application failed to start');
  }
}