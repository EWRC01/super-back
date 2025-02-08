import { PartialType } from '@nestjs/mapped-types';
import { CreateSoldproductDto } from './create-soldproduct.dto';

export class UpdateSoldproductDto extends PartialType(CreateSoldproductDto) {}
