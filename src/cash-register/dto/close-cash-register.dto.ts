import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseCashRegisterDto {
  @ApiProperty({
    description: 'Efectivo actual en caja',
    example: 1500.00,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  cashInHand: number; // Efectivo actual en caja
}