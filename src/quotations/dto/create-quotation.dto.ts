import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEnum, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PriceType } from "src/common/enums/price-type.enum";

class QuotationProductDto {
    @IsNumber()
    @ApiProperty({ description: 'Id del producto', example: 1 })
    productId: number;

    @IsNumber()
    @ApiProperty({ description: 'Cantidad del producto', example: 2 })
    quantity: number;
}

export class CreateQuotationDto {
    @IsDate()
    @ApiProperty({ description: 'Fecha de la cotización', example: '2025-02-19T00:00:00.000Z' })
    date: Date;

    @IsNumber()
    @ApiProperty({ description: 'Id del cliente', example: 1 })
    customerId: number;

    @IsNumber()
    @ApiProperty({ description: 'Id del usuario', example: 1 })
    userId: number;

    @IsEnum(PriceType)
    @ApiProperty({ enum: PriceType, description: 'Tipo de precio a aplicar' })
    priceType: PriceType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationProductDto)
    @ApiProperty({ type: [QuotationProductDto], description: 'Lista de productos con cantidades' })
    products: QuotationProductDto[];
}
