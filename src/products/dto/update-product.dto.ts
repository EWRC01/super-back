import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateProductDto {

      @ApiProperty({
        description: 'Código único del producto',
        example: 'PROD123',
      })
      @IsString()
      code?: string;
    
      @ApiProperty({
        description: 'Nombre del producto',
        example: 'Laptop Gamer',
      })
      @IsString()
      name?: string;
    
      @ApiProperty({
        description: 'Precio de compra del producto',
        example: 1200,
      })
      @IsNumber()
      purchasePrice?: number;
    
      @ApiProperty({
        description: 'Precio de venta del producto',
        example: 1500,
      })
      @IsNumber()
      salePrice?: number;
    
      @ApiProperty({
        description: 'Precio de turista del producto',
        example: 1500,
      })
      @IsNumber()
      touristPrice?: number;
    
      @ApiProperty({
        description: 'Cantidad de stock disponible',
        example: 50,
      })
      @IsNumber()
      stock?: number;
    
      @ApiPropertyOptional({
        description: 'Indica si el producto está disponible para venta al por mayor',
        example: true,
      })
      @IsOptional()
      @IsBoolean()
      wholesaleSale?: boolean;
    
      @ApiPropertyOptional({
        description: 'Precio del producto en venta al por mayor',
        example: 1300,
      })
      @IsOptional()
      @IsNumber()
      wholesalePrice?: number;
    
      @ApiPropertyOptional({
        description: 'Cantidad mínima para aplicar el precio al por mayor',
        example: 10,
      })
      @IsOptional()
      @IsNumber()
      wholesaleQuantity?: number;
    
      @ApiProperty({
        description: 'ID de la marca asociada al producto',
        example: 1,
      })
      @IsNumber()
      brandId?: number;
    
      @ApiProperty({
        description: 'ID de la categoría asociada al producto',
        example: 2,
      })
      @IsNumber()
      categoryId?: number;
}
