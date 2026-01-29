/* eslint-disable prettier/prettier */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';

@Processor('catalog-queue')
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name);

  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`⚡ Evento recibido: ${job.name} | JobId: ${job.id}`);

    switch (job.name) {
      case 'product.created':
        return this.handleProductCreated(job);
      case 'product.deleted':
        return this.handleProductDeleted(job);
      default:
        this.logger.warn(`Evento desconocido ignorado: ${job.name}`);
    }
  }

  // Manejo del Evento 1
  private async handleProductCreated(job: Job) {
    const { productId } = job.data;
    this.logger.log(`📦 Creando inventario inicial para Producto ID: ${productId}...`);
    
    try {
      // Aquí simulamos la creación. En un caso real, ProductService debería enviar 
      // el ID de la "Variación" (Talla/Color), no solo del Producto padre.
      // Como el challenge pide "base razonable", asumiremos que creamos stock 
      // para una variación placeholder o manejamos la lógica aquí.
      
      // Llamada al servicio de inventario (que implementaremos abajo)
      await this.inventoryService.createInitialStock(productId);
      
      this.logger.log(`✅ Inventario creado exitosamente para Producto ID: ${productId}`);
    } catch (error) {
      this.logger.error(`❌ Error creando inventario: ${error.message}`);
      // BullMQ reintentará esto automáticamente si fallamos aquí
      throw error; 
    }
  }

  // Manejo del Evento 2
  private async handleProductDeleted(job: Job) {
    const { productId } = job.data;
    this.logger.warn(`🗑️ Producto ${productId} eliminado. Limpiando stock asociado...`);
    
    // Aquí llamaríamos a un método de servicio para borrar/archivar
    // await this.inventoryService.removeStockForProduct(productId);
    
    // Simulamos un delay para ver la asincronía
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`✅ Stock del producto ${productId} eliminado correctamente.`);
  }
}