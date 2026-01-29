/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { Category } from '../../database/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../../database/entities/user.entity';
import { Product } from 'src/database/entities/product.entity';
import { BullModule } from '@nestjs/bullmq'; 
@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Category]), UserModule,
 // Registramos la cola donde vamos a publicar mensajes
    BullModule.registerQueue({
      name: 'catalog-queue',
    }),],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
