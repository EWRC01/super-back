// src/sold-products/dto/update-sold-product.dto.ts
import { IsOptional, IsDecimal, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSoldProductDto {
  @ApiProperty({
    description: 'Cantidad del producto vendido (opcional)',
    example: 10,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  quantity?: number;

  @ApiProperty({
    description: 'Precio unitario del producto vendido (opcional)',
    example: 25.99,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  price?: number;

  @ApiProperty({
    description: 'ID de la venta (opcional)',
    example: 1,
    type: Number,
    required: false,
  })
  saleId?: number;

  @ApiProperty({
    description: 'ID del producto vendido (opcional)',
    example: 2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({
    description: 'ID de referencia (opcional)',
    example: 456,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  referenceId?: number;

  @ApiProperty({
    description: 'Tipo de operación (opcional)',
    example: 'account',
    enum: ['holding', 'account', 'sale', 'quotation'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['holding', 'account', 'sale', 'quotation'], {
    message: 'El tipo debe ser uno de: holding, account, sale, quotation',
  })
  type?: string;
}