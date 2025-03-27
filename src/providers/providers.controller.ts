import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providerService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El NIT ya está registrado' })
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores' })
  async findAll() {
    return this.providerService.findAll();
  }

  @Get('findDelete/')
  @ApiOperation({ summary: 'Obtener todos los proveedores Eliminados' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores Eliminados' })
  async findAllDeleted() {
    return this.providerService.findAllDeleted();
  }

  @Get('/total-providers')
  @ApiOperation({ summary: 'Obtener el numero total de proveedores' })
  @ApiResponse({ status: 200, description: 'Numero total de proveedores' })
  async getTotalProviders() {
    return this.providerService.findTotalProviders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado correctamente' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado correctamente' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.remove(id);
  }

  @Post('activate/:id')
  @ApiOperation({ summary: 'Activar un proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor activado exitosamente' })
  @ApiResponse({ status: 403, description: 'El proveedor no se encontro' })
  async activate(@Param('id') id: number) {
    return this.providerService.active(id);
  }
}
