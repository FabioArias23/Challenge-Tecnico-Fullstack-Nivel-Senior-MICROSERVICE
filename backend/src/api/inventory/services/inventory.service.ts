/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariation)
    private readonly variationRepo: Repository<ProductVariation>,
  ) {}

  // Este método será llamado por el EVENTO mas adelante
  async createInitialStock(variationId: number, quantity: number = 0) {
    // Simulamos que el stock es para 'Egypt' por defecto según las entidades actuales
    const countryCode = 'EG'; 

    const inventory = this.inventoryRepo.create({
      productVariationId: variationId,
      countryCode: countryCode,
      quantity: quantity,
    });

    return this.inventoryRepo.save(inventory);
  }

  // Método para que el Frontend consulte stock
  async getStockByProduct(productId: number) {
    // Buscamos todas las variaciones de un producto y sumamos su stock
    const variations = await this.variationRepo.find({
      where: { productId },
      relations: ['product'],
    });

    if (!variations.length) {
      return { productId, totalStock: 0, breakdown: [] };
    }

    const variationIds = variations.map(v => v.id);
    
    const stockItems = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .where('inventory.productVariationId IN (:...ids)', { ids: variationIds })
      .getMany();

    const totalStock = stockItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      productId,
      totalStock,
      breakdown: stockItems,
    };
  }
}