import { ApiProperty } from '@nestjs/swagger';

export class QuotationResponseDto {
  @ApiProperty({ example: 10, description: 'Número total de cotizaciones en el período' })
  totalQuotations: number;

  @ApiProperty({ example: 1000, description: 'Monto total de las cotizaciones' })
  totalAmount: number;
}
