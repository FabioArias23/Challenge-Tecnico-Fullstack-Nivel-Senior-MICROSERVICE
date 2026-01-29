/* eslint-disable prettier/prettier */
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
//import { Auth } from 'src/api/auth/guards/auth.decorator';
// Importamos Auth para proteger la ruta, aunque sea de lectura (opcional según regla de negocio)

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:id')
  async getProductStock(@Param('id', ParseIntPipe) productId: number) {
    return this.inventoryService.getStockByProduct(productId);
  }
@Get()
async getAllInventory() {
  const inventory = await this.inventoryService.getAllInventory();
  // ANTES: return { message: '...', data: inventory }; -> Causaba doble anidación
  // AHORA:
  return inventory; 
}
}
