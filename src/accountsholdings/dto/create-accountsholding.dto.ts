// src/accounts-holdings/dto/create-accountsholding.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountsholdingDto {
  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Monto total de la transacción',
    example: 1000.50,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  total: number;

  @ApiProperty({
    description: 'Cantidad que ya ha sido pagada',
    example: 500.25,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  paid: number;

  @ApiProperty({
    description: 'Cantidad que falta por pagar',
    example: 500.25,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  toPay: number;

  @ApiProperty({
    description: 'Tipo de transacción (holding o account)',
    example: 'holding',
    enum: ['holding', 'account'],
  })
  @IsNotEmpty()
  @IsEnum(['holding', 'account'])
  type: string;

  @ApiProperty({
    description: 'ID del cliente asociado a la transacción',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  customerId: number; // Este campo es para relacionar con el Customer

  @ApiProperty({
    description: 'ID del usuario asociado a la transacción (opcional)',
    example: 1,
    type: Number,
    required: false,
  })
  @IsNotEmpty()
  @IsInt()
  userId: number; // Este campo es opcional para relacionar con el User
}