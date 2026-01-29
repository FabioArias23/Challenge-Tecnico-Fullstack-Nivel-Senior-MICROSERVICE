/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryService } from './services/inventory.service';
import { InventoryProcessor } from './inventory.processor'; // <--- Importamos

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, ProductVariation]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, 
    InventoryProcessor // Registramos el processor como provider (importante )

  ],
  exports: [InventoryService], // Exportamos el servicio para usarlo en otros lados si hiciera falta
})
export class InventoryModule {}