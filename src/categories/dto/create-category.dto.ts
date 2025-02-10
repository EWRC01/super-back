import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica', description: 'El nombre de la categoría' })
  @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío' })
  @IsString({ message: 'El nombre de la categoría debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El nombre de la categoría debe tener entre 1 y 50 caracteres' })
  categoryName: string;
}
