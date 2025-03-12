import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Provider } from 'src/providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Provider])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
