import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsInt, 
  IsPositive, 
  IsOptional, 
  Length, 
  IsNumber, 
  Min, 
  IsBoolean, 
  ValidateNested, 
  IsArray 
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderDetailProductDto {
  @ApiPropertyOptional({ example: 5, description: 'ID del producto existente' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @ApiPropertyOptional({ example: 'PROD123', description: 'Código del nuevo producto' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Laptop Gamer', description: 'Nombre del nuevo producto' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ example: 1200, description: 'Precio de compra' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Precio de venta' })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({ example: 1400, description: 'Precio turista' })
  @IsOptional()
  @IsNumber()
  touristPrice?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la marca' })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID de la categoría' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({ example: 10, description: 'Cantidad del producto' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 0, description: 'Stock reservado' })
  @IsOptional()
  @IsInt()
  reservedStock?: number;

  @ApiPropertyOptional({ example: true, description: 'Venta al por mayor' })
  @IsOptional()
  @IsBoolean()
  wholesaleSale?: boolean;

  @ApiPropertyOptional({ example: 1300, description: 'Precio al por mayor' })
  @IsOptional()
  @IsNumber()
  wholesalePrice?: number;

  @ApiPropertyOptional({ example: 10, description: 'Cantidad mínima para venta al por mayor' })
  @IsOptional()
  @IsInt()
  wholesaleQuantity?: number;
}

export class CreateOrderDetailDto {
  @ApiProperty({ example: 'INV-12345', description: 'Número de factura' })
  @IsString()
  @Length(1, 50)
  invoiceNumber: string;

  @ApiProperty({ 
    type: [CreateOrderDetailProductDto],
    example: [
      {
        productId: 3,
        quantity: 10
      },
      {
        code: "PROD-001",
        name: "Nuevo Producto",
        purchasePrice: 100,
        salePrice: 150,
        touristPrice: 140,
        quantity: 5,
        brandId: 1,
        categoryId: 2
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailProductDto)
  products: CreateOrderDetailProductDto[];
}