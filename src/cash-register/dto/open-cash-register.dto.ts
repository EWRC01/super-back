import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenCashRegisterDto {
@ApiProperty({
        description: 'Efectivo inicial en caja',
        example: 40.00,
        type: Number,
        minimum: 0,
      })
  @IsNumber()
  @IsNotEmpty()
  initialCash: number; // Efectivo inicial en caja
}
