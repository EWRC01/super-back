// src/damaged-products/dto/approve-replacement.dto.ts
import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveReplacementDto {
  @ApiProperty({
    description: 'Cantidad de productos aprobados para reposición',
    example: 3,
    minimum: 1,
    type: Number
  })
  @IsInt()
  @IsPositive()
  approvedQuantity: number;
}