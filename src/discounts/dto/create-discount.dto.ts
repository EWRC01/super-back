// src/discounts/dto/create-discount.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDate, IsBoolean, IsString, IsEnum, IsOptional } from 'class-validator';
import { DiscountType } from '../../common/enums/discount-type.enum';

export class CreateDiscountDto {
  @ApiProperty({
    example: 'Descuento de Verano',
    description: 'Nombre del descuento',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Tipo de descuento',
    required: true
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({
    example: 15,
    description: 'Valor del descuento (porcentaje o monto fijo según el tipo)',
    required: true
  })
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad mínima requerida para aplicar el descuento (opcional)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del producto al que aplica el descuento (opcional)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría a la que aplica el descuento (opcional)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    example: '2023-06-01T00:00:00Z',
    description: 'Fecha de inicio del descuento',
    required: true
  })
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @ApiProperty({
    example: '2023-08-31T23:59:59Z',
    description: 'Fecha de fin del descuento',
    required: true
  })
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @ApiProperty({
    example: true,
    description: 'Indica si el descuento está activo',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}