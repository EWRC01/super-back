import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsDate, IsPositive, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from 'src/common/enums/price-type.enum';


class SoldProductDto {
  @ApiProperty({ example: 1, description: 'ID del producto vendido' })
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2, description: 'Cantidad vendida del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;

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
}

export class CreateSaleDto {
  @ApiProperty({ example: '2024-02-15T12:30:00Z', description: 'Fecha de la venta' })
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ example: 50.25, description: 'Monto pagado' })
  @IsNumber()
  @IsPositive()
  paid: number;

  @ApiProperty({ example: 1, description: 'ID del cliente' })
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 2, description: 'ID del usuario que realizó la venta' })
  @IsNumber()
  userId: number;

  @ApiProperty({
    type: [SoldProductDto],
    description: 'Lista de productos vendidos en la venta',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoldProductDto)
  products: SoldProductDto[];
}