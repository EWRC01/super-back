import { ApiProperty } from '@nestjs/swagger';

export class SalesResponseDto {
  @ApiProperty({ example: 5, description: 'Total de ventas en el período' })
  totalSales: number;

  @ApiProperty({ example: 500, description: 'Monto total de ventas' })
  totalAmount: number;
}
