// src/users/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'newsecretpassword',
    description: 'Nueva contraseña',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  newPassword: string;
}