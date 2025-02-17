import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountsholdingDto } from './create-accountsholding.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDate, IsDecimal, IsInt, IsEnum, IsOptional } from 'class-validator';

export class UpdateAccountsholdingDto {
      @ApiProperty({
        description: 'Fecha de la transacción',
        example: '2023-10-01T00:00:00.000Z',
        type: Date,
      })
      @IsOptional()
      @IsDate()
      date?: Date;
    
      @ApiProperty({
        description: 'Monto total de la transacción',
        example: 1000.50,
        type: Number,
      })
      @IsOptional()
      @IsDecimal({ decimal_digits: '2' })
      total?: number;
    
      @ApiProperty({
        description: 'Cantidad que ya ha sido pagada',
        example: 500.25,
        type: Number,
      })
      @IsOptional()
      @IsDecimal({ decimal_digits: '2' })
      paid?: number;
    
      @ApiProperty({
        description: 'Cantidad que falta por pagar',
        example: 500.25,
        type: Number,
      })
      @IsOptional()
      @IsDecimal({ decimal_digits: '2' })
      toPay?: number;
    
      @ApiProperty({
        description: 'Tipo de transacción (holding o account)',
        example: 'holding',
        enum: ['holding', 'account'],
      })
      @IsOptional()
      @IsEnum(['holding', 'account'])
      type?: string;
    
      @ApiProperty({
        description: 'ID del cliente asociado a la transacción',
        example: 1,
        type: Number,
      })
      @IsOptional()
      @IsInt()
      customerId?: number; // Este campo es para relacionar con el Customer
    
      @ApiProperty({
        description: 'ID del usuario asociado a la transacción (opcional)',
        example: 1,
        type: Number,
        required: false,
      })
      @IsOptional()
      @IsInt()
      userId?: number; // Este campo es opcional para relacionar con el User
}
