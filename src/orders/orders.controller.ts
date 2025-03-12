import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente', type: Order })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos', type: [Order] })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del pedido', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pedido' })
  @ApiResponse({ status: 200, description: 'Pedido actualizado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido' })
  @ApiResponse({ status: 200, description: 'Pedido eliminado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
