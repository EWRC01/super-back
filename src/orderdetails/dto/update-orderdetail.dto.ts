import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional, IsNumber } from 'class-validator';

export class UpdateOrderDetailDto {
  @ApiPropertyOptional({ example: 15, description: 'Nueva cantidad del producto' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiPropertyOptional({ example: 1250.50, description: 'Nuevo precio de compra unitario' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;
}