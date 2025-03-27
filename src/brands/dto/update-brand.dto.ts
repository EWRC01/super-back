import { IsString, Length, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto  {
      @ApiPropertyOptional({ example: 'Nike', description: 'El nombre de la marca' })
      @IsString({ message: 'El nombre de la marca debe ser una cadena de texto' })
      @Length(1, 50, { message: 'El nombre de la marca debe tener entre 1 y 50 caracteres' })
      brandName?: string;
    
      @ApiPropertyOptional({ example: 1, description: 'ID del proveedor asociado a la marca' })
      @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
      providerId?: number;

      @ApiPropertyOptional({ example: true, description: 'Indica si el proveedor esta activo' })
      @IsBoolean()
      isActive?: boolean;
}
