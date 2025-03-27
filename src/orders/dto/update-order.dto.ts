import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class UpdateOrderDto {
    @ApiPropertyOptional({ example: '2024-08-16', description: 'Nueva fecha del pedido', required: false })
    @IsDateString({}, { message: 'La fecha del pedido debe ser una fecha válida' })
    orderDate?: Date;
  
    @ApiPropertyOptional({ example: 'INV-54321', description: 'Nuevo número de factura', required: false })
    @IsString({ message: 'El número de factura debe ser una cadena de texto' })
    invoiceNumber?: string;

    @ApiPropertyOptional({ example: true, description: 'Estatus del pedido', default: true })
    @IsBoolean({message: 'Debe ser un valor booleano'})
    isActive?: boolean;
  }