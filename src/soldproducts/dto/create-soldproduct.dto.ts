import { IsArray, ValidateNested, IsNotEmpty, IsDecimal, IsInt, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from 'src/common/enums/price-type.enum';
import { OperationType } from 'src/common/enums/operation-type.enum';

class AppliedDiscountDto {
  @ApiProperty({
    description: 'ID del descuento a aplicar',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  discountId: number;

  @ApiProperty({
    description: 'Cantidad a la que aplica el descuento (opcional)',
    example: 2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  quantity?: number;
}

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
    description: 'ID de la venta',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  saleId: number;

  @ApiProperty({
    description: 'ID del producto vendido',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Tipo de precio a utilizar (sale, wholesale, tourist)',
    example: PriceType.SALE,
    enum: PriceType,
  })
  @IsNotEmpty()
  @IsEnum(PriceType, {
    message: 'El tipo de precio debe ser uno de: sale, wholesale, tourist',
  })
  priceType: PriceType;

  @ApiProperty({
    description: 'Tipo de operación (holding, account, sale, quotation)',
    example: 'sale',
    enum: OperationType,
  })
  @IsNotEmpty()
  @IsEnum(OperationType, {
    message: 'El tipo debe ser uno de: holding, account, sale, quotation',
  })
  type: string;

  @ApiProperty({
    description: 'Descuentos a aplicar (opcional)',
    type: [AppliedDiscountDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppliedDiscountDto)
  appliedDiscounts?: AppliedDiscountDto[];
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