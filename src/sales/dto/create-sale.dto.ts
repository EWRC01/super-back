import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsDate, IsPositive } from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({ example: '2024-02-15T12:30:00Z', description: 'Fecha de la venta' })
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ example: 100.5, description: 'Total de la venta' })
  @IsNumber()
  @IsPositive()
  total: number;

  @ApiProperty({ example: 50.25, description: 'Monto pagado' })
  @IsNumber()
  @IsPositive()
  paid: number;

  @ApiProperty({ example: 1, description: 'ID del cliente' })
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 2, description: 'ID del usuario que realizó la venta' })
  @IsNumber()
  userId: number;
}
