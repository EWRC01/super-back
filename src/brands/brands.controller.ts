import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva marca' })
  @ApiResponse({ status: 201, description: 'Marca creada exitosamente', type: Brand })
  create(@Body() createBrandDto: CreateBrandDto): Promise<Brand> {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas', type: [Brand] })
  findAll(): Promise<Brand[]> {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @ApiResponse({ status: 200, description: 'Marca encontrada', type: Brand })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  findOne(@Param('id') id: number): Promise<Brand> {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una marca' })
  @ApiResponse({ status: 200, description: 'Marca actualizada', type: Brand })
  update(@Param('id') id: number, @Body() updateBrandDto: UpdateBrandDto): Promise<Brand> {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una marca' })
  @ApiResponse({ status: 200, description: 'Marca eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  remove(@Param('id') id: number): Promise<void> {
    return this.brandsService.remove(id);
  }
}
