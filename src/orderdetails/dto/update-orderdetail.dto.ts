import { PartialType } from '@nestjs/swagger';
import { CreateOrderdetailDto } from './create-orderdetail.dto';

export class UpdateOrderdetailDto extends PartialType(CreateOrderdetailDto) {}
