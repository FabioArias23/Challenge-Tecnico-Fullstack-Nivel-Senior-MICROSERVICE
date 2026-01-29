/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateProductDto, ProductDetailsDto } from '../dto/product.dto';
import { Category } from '../../../database/entities/category.entity';
import { Product } from 'src/database/entities/product.entity';
import { errorMessages } from 'src/errors/custom';
import { validate } from 'class-validator';
import { successObject } from 'src/common/helper/success-response.interceptor';
import { InjectQueue } from '@nestjs/bullmq'; // <--- Importamos
import { Queue } from 'bullmq'; // <--- Importamos 
import { ProductVariation } from 'src/database/entities/productVariation.entity';
@Injectable()
export class ProductService {
  [x: string]: any;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    // Inyectamos la cola definida en el modulo
    @InjectQueue('catalog-queue') private readonly catalogQueue: Queue,
  ) {}

  async getProduct(productId: number) {
    const product = await this.entityManager.findOne(Product, {
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException(errorMessages.product.notFound);

    return product;
  }
async getAllProducts(): Promise<Product[]> {
  return await this.entityManager.find(Product, {
    // Quitamos el where: { isActive: true } para poder ver los productos recién creados
    order: { createdAt: 'DESC' }
  });
}
async createProduct(data: CreateProductDto, merchantId: number) {
  const category = await this.entityManager.findOne(Category, {
    where: { id: data.categoryId },
  });
  if (!category) throw new NotFoundException(errorMessages.category.notFound);

  // 1. Crear el producto con los nuevos campos
  const product = this.entityManager.create(Product, {
    ...data,
    merchantId,
  });
  const savedProduct = await this.entityManager.save(product);

  // 2. CREAR VARIACIÓN POR DEFECTO (VITAL PARA EL CUADRO DE STOCK)
  // Usamos el nombre de la entidad en string si no tienes el repositorio inyectado
  const defaultVariation = this.entityManager.create(ProductVariation, {
    productId: savedProduct.id,
    sizeCode: 'NA',
    colorName: 'NA',
  });
  await this.entityManager.save(defaultVariation);

  // 3. Emitir evento a BullMQ
  await this.catalogQueue.add('product.created', {
    productId: savedProduct.id,
  });

  return savedProduct;
}
  async addProductDetails(
    productId: number,
    body: ProductDetailsDto,
    merchantId: number,
  ) {
    const result = await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set({
        ...body,
      })
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id'])
      .execute();
    if (result.affected < 1)
      throw new NotFoundException(errorMessages.product.notFound);
    return await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set({ ...body })
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id'])
      .execute().then(res => res.raw[0]);
  }
  async activateProduct(productId: number, merchantId: number) {
    if (!(await this.validate(productId)))
      throw new ConflictException(errorMessages.product.notFulfilled);

    return await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set({ isActive: true })
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id', 'isActive'])
      .execute().then(res => res.raw[0]);
  }

  async validate(productId: number) {
     const product = await this.entityManager.findOne(Product, { where: { id: productId } });
    if (!product) throw new NotFoundException(errorMessages.product.notFound);
    const errors = await validate(product);
    return errors.length === 0;
  }

  async deleteProduct(productId: number, merchantId: number) {
    const result = await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where('id = :productId', { productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .execute();

    if (result.affected < 1)
      throw new NotFoundException(errorMessages.product.notFound);

    // Si se borró con éxito, avisamos al inventario para que limpie
    await this.catalogQueue.add('product.deleted', {
      productId: productId,
    });
    // ------------------------------------

    return successObject;
  }
}