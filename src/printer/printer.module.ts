import { Module } from '@nestjs/common';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [PrinterController],
  providers: [PrinterService],
})
export class PrinterModule {}
