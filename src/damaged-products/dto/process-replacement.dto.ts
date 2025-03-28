// src/damaged-products/dto/process-replacement.dto.ts
import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessReplacementDto {
  @ApiProperty({
    description: 'Cantidad real de productos repuestos por el proveedor',
    example: 3,
    minimum: 1,
    type: Number
  })
  @IsInt()
  @IsPositive()
  actualReplacedQuantity: number;
}