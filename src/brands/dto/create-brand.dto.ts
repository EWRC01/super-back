import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsNumber } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike', description: 'El nombre de la marca' })
  @IsNotEmpty({ message: 'El nombre de la marca no puede estar vacío' })
  @IsString({ message: 'El nombre de la marca debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El nombre de la marca debe tener entre 1 y 50 caracteres' })
  brandName: string;

  @ApiProperty({ example: 1, description: 'ID del proveedor asociado a la marca' })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  providerId: number;
}
