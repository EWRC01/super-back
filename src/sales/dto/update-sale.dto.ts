import { IsDate, IsDecimal, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSaleDto {
  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ required: false })
  @IsDecimal()
  @IsOptional()
  paid?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  userId?: number;
}