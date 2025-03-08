// src/accounts-holdings/dto/create-accountsholding.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { PriceType } from 'src/common/enums/price-type.enum';
import { AccountHoldingStatus } from 'src/common/enums/accounts-holdings-status.enum';

class ProductDetailDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @ApiProperty({
    description: 'Precio del producto',
    example: PriceType.SALE,
    type: Number,
  })
  @IsNotEmpty()
  @IsString()
  priceType: string;
}

export class CreateAccountsholdingDto {
  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Tipo de transacción',
    example: OperationType.ACCOUNT,
    enum: OperationType,
  })
  @IsNotEmpty()
  @IsEnum(OperationType)
  type: OperationType;

  @ApiProperty({
    description: 'Estado de la cuenta',
    example: AccountHoldingStatus.PENDING,
    enum: AccountHoldingStatus
  })
  @IsNotEmpty()
  @IsEnum(AccountHoldingStatus)
  status: AccountHoldingStatus;

  @ApiProperty({
    description: 'ID del cliente asociado a la transacción',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @ApiProperty({
    description: 'ID del usuario que registró la transacción',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Lista de productos en la cuenta por cobrar',
    type: [ProductDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailDto)
  products: ProductDetailDto[];
}
