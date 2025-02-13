// src/sold-products/dto/create-sold-products.dto.ts
import { IsArray, ValidateNested, IsNotEmpty, IsDecimal, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateSoldProductDto {
  @ApiProperty({
    description: 'Cantidad del producto vendido',
    example: 5,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto vendido',
    example: 19.99,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  price: number;

  @ApiProperty({
    description: 'ID del producto vendido',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'ID de referencia (puede ser el ID de una venta, pedido, etc.)',
    example: 123,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  referenceId: number;

  @ApiProperty({
    description: 'Tipo de operación (holding, account, sale, quotation)',
    example: 'sale',
    enum: ['holding', 'account', 'sale', 'quotation'],
  })
  @IsNotEmpty()
  @IsEnum(['holding', 'account', 'sale', 'quotation'], {
    message: 'El tipo debe ser uno de: holding, account, sale, quotation',
  })
  type: string;
}

export class CreateSoldProductsDto {
  @ApiProperty({
    description: 'Lista de productos vendidos',
    type: [CreateSoldProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSoldProductDto)
  products: CreateSoldProductDto[];
}