import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike', description: 'El nombre de la marca' })
  @IsNotEmpty({ message: 'El nombre de la marca no puede estar vacío' })
  @IsString({ message: 'El nombre de la marca debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El nombre de la marca debe tener entre 1 y 50 caracteres' })
  brandName: string;
}
