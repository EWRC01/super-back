import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateEmployeePaymentDto {
  @ApiProperty({ example: 1, description: 'ID del empleado que recibirá el pago' })
  @IsNumber()
  @IsPositive()
  employeeId: number;

  @ApiProperty({ example: 500.75, description: 'Monto del pago' })
  @IsNumber()
  @Min(0)
  amount: number;
}
