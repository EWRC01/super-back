// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username del usuario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nombre completo del usuario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    example: '22577777',
    description: 'Teléfono del usuario',
    required: true,
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  @Length(9)
  phone: string;

  @ApiProperty({
    example: 'secretpassword',
    description: 'Contraseña del usuario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;
}