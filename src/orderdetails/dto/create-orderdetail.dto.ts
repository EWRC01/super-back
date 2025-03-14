import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive, IsOptional, Length, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateOrderDetailDto {
  @ApiProperty({ example: 'INV-202403', description: 'Número de factura de la orden' })
  @IsString()
  @Length(1, 50)
  invoiceNumber: string;

  @ApiPropertyOptional({ example: 5, description: 'ID del producto (si el producto ya existe)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @ApiPropertyOptional({ example: 'PROD123', description: 'Código del producto' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Laptop Gamer', description: 'Nombre del producto' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ example: 1200, description: 'Precio de compra del producto' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Precio de venta del producto' })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Precio de turista del producto' })
  @IsOptional()
  @IsNumber()
  touristPrice?: number;

  @ApiPropertyOptional({ example: 50, description: 'Cantidad de stock disponible' })
  @IsOptional()
  @IsInt()
  stock?: number;

  @ApiPropertyOptional({ example: 0, description: 'Cantidad de stock reservado' })
  @IsOptional()
  @IsInt()
  reservedStock?: number;

  @ApiPropertyOptional({ example: true, description: 'Indica si el producto está disponible para venta al por mayor' })
  @IsOptional()
  @IsBoolean()
  wholesaleSale?: boolean;

  @ApiPropertyOptional({ example: 1300, description: 'Precio del producto en venta al por mayor' })
  @IsOptional()
  @IsNumber()
  wholesalePrice?: number;

  @ApiPropertyOptional({ example: 10, description: 'Cantidad mínima para aplicar el precio al por mayor' })
  @IsOptional()
  @IsInt()
  wholesaleQuantity?: number;

  @ApiProperty({ example: 1, description: 'ID de la marca asociada al producto' })
  @IsInt()
  brandId: number;

  @ApiProperty({ example: 2, description: 'ID de la categoría asociada al producto' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 10, description: 'Cantidad del producto en la orden' })
  @IsInt()
  @IsPositive()
  quantity: number;
}
