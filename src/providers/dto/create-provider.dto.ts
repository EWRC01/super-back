import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches, IsBoolean } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ example: 'Distribuidora El Salvador', description: 'Nombre del proveedor' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({ example: '0614-010190-102-1', description: 'Número de identificación tributaria (NIT)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{6}-\d{3}-\d{1}$/, { message: 'El NIT debe tener el formato ####-######-###-#' })
  taxId: string;

  @ApiProperty({ example: 'San Salvador, El Salvador', description: 'Dirección del proveedor' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 255)
  address: string;

  @ApiProperty({ example: true, description: 'El proveedor esta activo', default: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ example: '2222-3333', description: 'Teléfono del proveedor' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, { message: 'El teléfono debe tener el formato ####-####' })
  phone: string;
}
