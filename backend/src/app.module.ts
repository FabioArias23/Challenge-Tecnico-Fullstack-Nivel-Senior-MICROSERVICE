/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './database/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import * as Joi from 'joi'; // Cambio: Importación más robusta

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        // VITAL: Validar el puerto que Render inyecta para el servidor web
        PORT: Joi.number().default(3000),
        
        // Base de Datos (Supabase)
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(6543),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        
        // Redis (Upstash)
        REDIS_URL: Joi.string().required(),
        
        // Seguridad
        JWT_SECRET: Joi.string().required(),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
          // OBLIGATORIO PARA UPSTASH EN RENDER (TLS)
          tls: { rejectUnauthorized: false }
        },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({ 
        useClass: TypeOrmConfigService 
    }),
    
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}