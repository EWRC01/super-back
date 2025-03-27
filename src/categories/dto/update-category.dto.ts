import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCategoryDto  {
      @ApiPropertyOptional({ example: 'Electrónica', description: 'El nombre de la categoría' })
      @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío' })
      @IsString({ message: 'El nombre de la categoría debe ser una cadena de texto' })
      @Length(1, 50, { message: 'El nombre de la categoría debe tener entre 1 y 50 caracteres' })
      categoryName?: string;
    
      @ApiPropertyOptional({ example: true, description: 'Estatus de la marca', default: true })
      @IsBoolean()
      isActive?: boolean;
}
