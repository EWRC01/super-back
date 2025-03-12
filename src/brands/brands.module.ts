import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Provider } from 'src/providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Provider])],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
