// src/damaged-products/dto/report-damaged-product.dto.ts
import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportDamagedProductDto {
  @ApiProperty({
    description: 'ID del producto dañado',
    example: 123,
    minimum: 1,
    type: Number
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    description: 'Cantidad de unidades dañadas',
    example: 2,
    minimum: 1,
    type: Number
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Notas adicionales sobre el daño',
    example: 'Paquetes mojados durante el transporte',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  notes?: string;
}