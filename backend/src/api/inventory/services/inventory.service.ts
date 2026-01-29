/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariation)
    private readonly variationRepo: Repository<ProductVariation>,
  ) {}
  
  /**
   * Maneja el evento 'product.created'.
   * Intenta inicializar stock si existen variaciones, o simula la accion.
   */
  async getAllInventory(): Promise<Inventory[]> {
  // Retorna todos los registros de inventario
  return await this.inventoryRepo.find({
    order: { updatedAt: 'DESC' }
  });
}
  async createInitialStock(productId: number) {
    // 1. Buscamos si el producto ya tiene variaciones (ej. si se crearon en la misma transaccion)
    const variations = await this.variationRepo.find({
      where: { productId },
    });

    const countryCode = 'EG'; // Hardcodeado por reglas de negocio actuales

    // CASO A: El producto se creo pero aon no tiene Talla/Color definido.
    if (variations.length === 0) {
      this.logger.log(
        `[LOGIC] El producto ID ${productId} no tiene variaciones aún. No se puede crear registro en tabla 'Inventory' por restricción de FK.`,
      );
      this.logger.log(`[SIMULATION] Se reserva espacio lógico de inventario para Producto ${productId}.`);
      return;
    }
    
    // CASO B: (Edge Case) El producto ya tiene variaciones, creamos stock en 0 para cada una.
   const inventoryEntities = variations.map((variation) => {
  return this.inventoryRepo.create({
    productVariationId: variation.id,
    countryCode: countryCode,
    quantity: Math.floor(Math.random() * 100) + 1, // <--- Cantidad aleatoria entre 1 y 100
  });
});

    await this.inventoryRepo.save(inventoryEntities);
    this.logger.log(`✅ Stock inicial (0) creado para ${variations.length} variaciones del producto ${productId}.`);
  }

  /*
    Maneja el evento 'product.deleted'.
    Elimina todo registro de inventario asociado a las variaciones de ese producto.
   */
  async deleteStockForProduct(productId: number) {
    // Usamos QueryBuilder para hacer un DELETE con Subquery, es mas eficiente que buscar y borrar uno por uno.
    // SQL Equivalente: DELETE FROM inventory WHERE productVariationId IN (SELECT id FROM product_variation WHERE productId = X)
    
    const variations = await this.variationRepo.find({ where: { productId }, select: ['id'] });
    
    if (variations.length === 0) {
        this.logger.log(`No hay stock que limpiar para el producto ${productId}`);
        return;
    }

    const variationIds = variations.map(v => v.id);

    const result = await this.inventoryRepo
      .createQueryBuilder()
      .delete()
      .from(Inventory)
      .where('productVariationId IN (:...ids)', { ids: variationIds })
      .execute();

    this.logger.log(`🗑️ Eliminados ${result.affected} registros de inventario para el producto ${productId}.`);
  }

  // --- Metodos de Lectura (Frontend) ---

  async getStockByProduct(productId: number) {
    // Buscamos todas las variaciones de un producto
    const variations = await this.variationRepo.find({
      where: { productId },
      relations: ['product'], // Opcional, si necesitas datos del padre
    });

    if (!variations.length) {
      return { productId, totalStock: 0, breakdown: [], message: 'No variations found' };
    }

    const variationIds = variations.map((v) => v.id);

    // Buscamos el stock de esas variaciones
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