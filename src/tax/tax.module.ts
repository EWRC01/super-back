import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

@Module({
    imports: [TypeOrmModule.forFeature([Sale, SoldProduct])],
    controllers: [TaxController],
    providers: [TaxService]
})
export class TaxModule {}
