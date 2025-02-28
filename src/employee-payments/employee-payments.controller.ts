import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EmployeePaymentsService } from './employee-payments.service';
import { CreateEmployeePaymentDto } from './dto/create-employee-payment.dto';

@ApiTags('Employee-Payments')
@Controller('employee-payments')
export class EmployeePaymentsController {
  constructor(private readonly paymentsService: EmployeePaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Realizar un pago a un empleado' })
  @ApiResponse({ status: 201, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El pago no puede ser mayor al salario' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  payEmployee(@Body() createPaymentDto: CreateEmployeePaymentDto) {
    return this.paymentsService.payEmployee(createPaymentDto);
  }

  @Get(':employeeId')
  @ApiOperation({ summary: 'Obtener pagos de un empleado con filtros opcionales' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Número de mes (1-12) para filtrar los pagos' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Año para filtrar los pagos' })
  @ApiResponse({ status: 200, description: 'Lista de pagos del empleado y sumatoria total' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  getPayments(
    @Param('employeeId') employeeId: number,
    @Query('month') month?: number,
    @Query('year') year?: number
  ) {
    return this.paymentsService.getPayments(employeeId, month, year);
  }
}
