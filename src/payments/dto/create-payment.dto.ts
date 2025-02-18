// src/payments/dto/create-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Monto del pago',
    example: 100.0,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal()
  amount: number;

  @ApiProperty({
    description: 'Fecha del pago',
    example: '2023-10-01T12:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'ID de la cuenta por cobrar',
    example: 1,
    type: Number,
  })
  accountHoldingId: number;
}
