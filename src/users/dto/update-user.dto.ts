// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsPhoneNumber, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'johndoe_updated',
    description: 'Username del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
  username?: string;

  @ApiProperty({
    example: 'John Doe Updated',
    description: 'Nombre completo del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;

  @ApiProperty({
    example: '22577777',
    description: 'Teléfono del usuario',
    required: false,
  })
  @IsPhoneNumber()
  @Length(9)
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'newsecretpassword',
    description: 'Contraseña del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(8, 100)
  password?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true, description: 'Indica si el usuario es administrador', required: false })
  isAdmin?: boolean;

}