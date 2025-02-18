// src/sold-products/dto/update-sold-product.dto.ts
import { IsOptional, IsDecimal, IsInt, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from 'src/common/enums/price-type.enum';
import { OperationType } from 'src/common/enums/operation-type.enum';

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
      description: 'Tipo de precio',
      example: 'sale',
      enum: PriceType,
    })
    @IsNotEmpty()
    @IsString()
    priceType?: string;

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
    enum: OperationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType, {
    message: 'El tipo debe ser uno de: holding, account, sale, quotation',
  })
  type?: string;
}