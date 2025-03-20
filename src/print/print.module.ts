import { Module } from '@nestjs/common';
import { PrintService } from './print.service';
import { PrintController } from './print.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [PrintController],
  providers: [PrintService],
})
export class PrintModule {}
