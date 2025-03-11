import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProviderDto } from './create-provider.dto';
import { IsOptional, Matches } from 'class-validator';

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
  @ApiProperty({ example: '0614-010190-102-1', description: 'Número de identificación tributaria (NIT)', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{6}-\d{3}-\d{1}$/, { message: 'El NIT debe tener el formato ####-######-###-#' })
  taxId?: string;
}
