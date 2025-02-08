// src/users/dto/login-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username del usuario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'secretpassword',
    description: 'Contraseña del usuario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(9)
  password: string;
}