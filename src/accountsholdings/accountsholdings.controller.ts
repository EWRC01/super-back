import { Controller, Post, Body, Param, Get, NotFoundException, BadRequestException, Put, Query } from '@nestjs/common';
import { AccountsHoldingsService } from './accountsholdings.service';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Payment } from 'src/payments/entities/payment.entity';
import { CreatePaymentDto } from 'src/payments/dto/create-payment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Accounts-Holdings')
@Controller('accountsholdings')
export class AccountsHoldingsController {
  constructor(private readonly accountsHoldingsService: AccountsHoldingsService) {}

  // Crear una cuenta por cobrar o apartado (holding)
  @Post()
  @ApiOperation({ summary: 'Crear una cuenta por cobrar o apartado (holding)' })
  @ApiBody({ type: CreateAccountsholdingDto })
  @ApiResponse({
    status: 201,
    description: 'La cuenta por cobrar o apartado ha sido creada con éxito',
    type: AccountsHoldings,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente o usuario no encontrados',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente o uno o más productos no encontrados',
  })
  async create(@Body() createDto: CreateAccountsholdingDto): Promise<AccountsHoldings> {
    return this.accountsHoldingsService.create(createDto);
  }

  // Obtener todas las cuentas por cobrar o apartados
  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas por cobrar o apartados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las cuentas por cobrar o apartados',
    type: [AccountsHoldings],
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.accountsHoldingsService.findAll(paginationDto);
  }

  // Obtener una cuenta por cobrar o apartado por su ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta por cobrar o apartado por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar' })
  @ApiResponse({
    status: 200,
    description: 'Cuenta por cobrar encontrada',
    type: AccountsHoldings,
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
  })
  async findOne(@Param('id') id: number): Promise<AccountsHoldings> {
    return this.accountsHoldingsService.findOne(id);
  }

  // Cancelar una reserva (apartado)
  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva (apartado)' })
  @ApiParam({ name: 'id', description: 'ID de la cuenta por cobrar o apartado (holding)' })
  @ApiResponse({
    status: 200,
    description: 'La reserva ha sido cancelada correctamente',
    type: AccountsHoldings,
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'La cuenta no es un apartado o ya ha sido cancelada',
  })
  async cancelReservation(@Param('id') id: number): Promise<AccountsHoldings> {
    return this.accountsHoldingsService.cancelReservation(id);
  }
}
