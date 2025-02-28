import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsPositive, Min } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 1, description: 'ID del usuario asociado al empleado' })
  @IsNumber()
  @IsPositive()
  userId: number;

  @ApiProperty({ example: 'Desarrollador', description: 'Puesto del empleado' })
  @IsString()
  position: string;

  @ApiProperty({ example: 1200.50, description: 'Salario del empleado' })
  @IsNumber()
  @Min(0)
  salary: number;
}
