import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Sale } from 'src/sales/entities/sale.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Sale])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
