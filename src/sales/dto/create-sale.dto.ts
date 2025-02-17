import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsDate, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SoldProductDto {
  @ApiProperty({ example: 1, description: 'ID del producto vendido' })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2, description: 'Cantidad vendida del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 10.5, description: 'Precio unitario del producto' })
  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: '2024-02-15T12:30:00Z', description: 'Fecha de la venta' })
  @IsDate()
  @IsNotEmpty()
  date: Date;

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

  @ApiProperty({
    type: [SoldProductDto],
    description: 'Lista de productos vendidos en la venta',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoldProductDto)
  products: SoldProductDto[];
}