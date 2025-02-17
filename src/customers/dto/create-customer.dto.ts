// src/customers/dto/create-customer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
    type: String,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '79889008',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @Min(8)
  @Max(20)
  @Matches(/^\+?\d{7,15}$/, {
    message: 'El teléfono debe ser un número válido.',
  })
  phone?: string;
}