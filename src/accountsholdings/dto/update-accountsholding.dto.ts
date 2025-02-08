import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountsholdingDto } from './create-accountsholding.dto';

export class UpdateAccountsholdingDto extends PartialType(CreateAccountsholdingDto) {}
