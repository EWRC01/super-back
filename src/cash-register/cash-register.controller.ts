import { Controller, Post, Body, Param, Get, ParseIntPipe } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { CashRegister } from './entities/cash-register.entity';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';

@ApiTags('Cash-Register')
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}
  
  @Post('open/:userId')
  @ApiOperation({ summary: 'Abrir caja', description: 'Registra la apertura de caja con un monto inicial.' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID del usuario que abre la caja' })
  @ApiResponse({ status: 201, description: 'Caja abierta exitosamente', type: CashRegister })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async openCashRegister(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() openCashRegisterDto: OpenCashRegisterDto,
  ): Promise<CashRegister> {
    return this.cashRegisterService.openCashRegister(userId, openCashRegisterDto);
  }

  @Post('close/:userId')
  @ApiOperation({ summary: 'Cerrar caja para un usuario' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID del usuario que cierra la caja' })
  @ApiBody({ 
    type: CloseCashRegisterDto,
    description: 'Datos necesarios para cerrar la caja, incluyendo el efectivo disponible en mano (cashInHand)'
  })
  @ApiResponse({
    status: 201,
    description: 'Caja cerrada exitosamente',
    type: CashRegister,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados',
  })
  async closeCashRegister(
    @Param('userId') userId: number,
    @Body() closeCashRegisterDto: CloseCashRegisterDto,
  ): Promise<CashRegister> {
    return this.cashRegisterService.closeCashRegister(userId, closeCashRegisterDto.cashInHand);
  }

  @Get('historial')
  @ApiOperation({ summary: 'Obtener el historial de cajas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cajas cerradas',
    type: [CashRegister],
  })
  async find(): Promise<CashRegister[]> {
    return this.cashRegisterService.find();
  }
}
