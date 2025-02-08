import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SoldproductsService } from './soldproducts.service';
import { CreateSoldproductDto } from './dto/create-soldproduct.dto';
import { UpdateSoldproductDto } from './dto/update-soldproduct.dto';

@Controller('soldproducts')
export class SoldproductsController {
  constructor(private readonly soldproductsService: SoldproductsService) {}

  @Post()
  create(@Body() createSoldproductDto: CreateSoldproductDto) {
    return this.soldproductsService.create(createSoldproductDto);
  }

  @Get()
  findAll() {
    return this.soldproductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldproductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoldproductDto: UpdateSoldproductDto) {
    return this.soldproductsService.update(+id, updateSoldproductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soldproductsService.remove(+id);
  }
}
