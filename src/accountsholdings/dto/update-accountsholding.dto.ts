// src/accounts-holdings/dto/update-accountsholding.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { CreateAccountsholdingDto } from './create-accountsholding.dto';

class ProductDetailDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({
    description: 'Precio del producto',
    example: 50.75,
    type: Number,
  })
  @IsOptional()
  price?: number;
}

export class UpdateAccountsholdingDto {
  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty({
    description: 'Tipo de transacción',
    example: OperationType.ACCOUNT,
    enum: OperationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType)
  type?: OperationType;

  @ApiProperty({
    description: 'ID del cliente asociado a la transacción',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiProperty({
    description: 'ID del usuario que registró la transacción',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: 'Lista de productos en la cuenta por cobrar',
    type: [ProductDetailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailDto)
  products?: ProductDetailDto[];
}
