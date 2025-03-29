import { IsOptional, IsDecimal, IsInt, IsEnum, IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from 'src/common/enums/price-type.enum';
import { OperationType } from 'src/common/enums/operation-type.enum';

class UpdateAppliedDiscountDto {
  @ApiProperty({
    description: 'ID del descuento a aplicar',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  discountId?: number;

  @ApiProperty({
    description: 'Cantidad a la que aplica el descuento',
    example: 2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  quantity?: number;
}

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
  @IsOptional()
  @IsInt()
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
    description: 'Tipo de precio (opcional)',
    example: 'sale',
    enum: PriceType,
    required: false,
  })
  @IsOptional()
  @IsEnum(PriceType, {
    message: 'El tipo de precio debe ser uno de: sale, wholesale, tourist',
  })
  priceType?: PriceType;

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
  type?: OperationType;

  @ApiProperty({
    description: 'Descuentos a aplicar (opcional)',
    type: [UpdateAppliedDiscountDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAppliedDiscountDto)
  appliedDiscounts?: UpdateAppliedDiscountDto[];
}