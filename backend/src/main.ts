/* eslint-disable prettier/prettier */
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS Dinámico
  // En producción permitimos el dominio del frontend, en desarrollo localhost
  app.enableCors({
    origin: true, // Esto permite cualquier origen que envíe las credenciales correctas, ideal para la demo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Global Prefix
  app.setGlobalPrefix('api');

  // 3. Pipes de Validación
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 4. Puerto dinámico para Railway
  // Railway inyecta automáticamente la variable PORT. 
  // Escuchamos en '0.0.0.0' para que Railway pueda mapear el tráfico externo.
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); 
  
  logger.log(`🚀 API activa en el puerto: ${port}`);
  logger.log(`🔗 Prefijo global: /api`);
}

bootstrap();