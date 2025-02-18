import { IsArray, ValidateNested, IsNotEmpty, IsDecimal, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriceType } from 'src/common/enums/price-type.enum';// Importa el enum desde CreateSaleDto
import { OperationType } from 'src/common/enums/operation-type.enum';

class CreateSoldProductDto {
  @ApiProperty({
    description: 'Cantidad del producto vendido',
    example: 5,
    type: Number,
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantity: number;

  @ApiProperty({
    description: 'ID de la venta',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  saleId: number;

  @ApiProperty({
    description: 'ID del producto vendido',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Tipo de precio a utilizar (sale, wholesale, tourist)',
    example: PriceType.SALE,
    enum: PriceType,
  })
  @IsNotEmpty()
  @IsEnum(PriceType, {
    message: 'El tipo de precio debe ser uno de: sale, wholesale, tourist',
  })
  priceType: PriceType;

  @ApiProperty({
    description: 'ID de referencia (puede ser el ID de una venta, pedido, etc.)',
    example: 123,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  referenceId: number;

  @ApiProperty({
    description: 'Tipo de operación (holding, account, sale, quotation)',
    example: 'sale',
    enum: OperationType,
  })
  @IsNotEmpty()
  @IsEnum(OperationType, {
    message: 'El tipo debe ser uno de: holding, account, sale, quotation',
  })
  type: string;
}

export class CreateSoldProductsDto {
  @ApiProperty({
    description: 'Lista de productos vendidos',
    type: [CreateSoldProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSoldProductDto)
  products: CreateSoldProductDto[];
}