import { Injectable } from '@nestjs/common';
import { CreateSoldproductDto } from './dto/create-soldproduct.dto';
import { UpdateSoldproductDto } from './dto/update-soldproduct.dto';

@Injectable()
export class SoldproductsService {
  create(createSoldproductDto: CreateSoldproductDto) {
    return 'This action adds a new soldproduct';
  }

  findAll() {
    return `This action returns all soldproducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} soldproduct`;
  }

  update(id: number, updateSoldproductDto: UpdateSoldproductDto) {
    return `This action updates a #${id} soldproduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} soldproduct`;
  }
}
