import { Module } from '@nestjs/common';
import { PrintService } from './print.service';
import { PrintController } from './print.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), ConfigModule.forRoot()],
  controllers: [PrintController],
  providers: [PrintService],
})
export class PrintModule {}
