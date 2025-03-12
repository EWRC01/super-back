import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor que realiza el pedido' })
  @IsNotEmpty({ message: 'El ID del proveedor no puede estar vacío' })
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  @Min(1, { message: 'El ID del proveedor debe ser un número positivo' })
  providerId: number;

  @ApiProperty({ example: '2024-08-15', description: 'Fecha del pedido en formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha del pedido no puede estar vacía' })
  @IsDateString({}, { message: 'La fecha del pedido debe ser una fecha válida' })
  orderDate: Date;

  @ApiProperty({ example: 'INV-12345', description: 'Número de factura del pedido' })
  @IsNotEmpty({ message: 'El número de factura no puede estar vacío' })
  @IsString({ message: 'El número de factura debe ser una cadena de texto' })
  invoiceNumber: string;
}