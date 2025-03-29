// src/discounts/dto/apply-discount.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({
    example: 1,
    description: 'ID del descuento a aplicar',
    required: true
  })
  @IsNotEmpty()
  @IsNumber()
  discountId: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de productos a los que aplicar el descuento (opcional)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}