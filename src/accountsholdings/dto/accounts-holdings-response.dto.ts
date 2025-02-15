import { ApiProperty } from '@nestjs/swagger';

export class AccountsHoldingsResponseDto {
  @ApiProperty({ example: 5000, description: 'Monto total en cuentas' })
  totalBalance: number;
}
