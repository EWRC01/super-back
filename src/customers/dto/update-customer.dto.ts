// src/customers/dto/update-customer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
  name?: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+56912345678',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @Matches(/^\+?\d{7,15}$/, {
    message: 'El teléfono debe ser un número válido.',
  })
  phone?: string;
}