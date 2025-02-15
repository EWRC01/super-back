import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class FilterAccountsHoldingsDto {
  @ApiProperty({ example: '2024-02-01', description: 'Fecha de inicio', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-02-15', description: 'Fecha de fin', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
