import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StateCashRegister } from 'src/common/enums/cash-register-state.enum';

export class OpenCashRegisterDto {
@ApiProperty({
        description: 'Efectivo inicial en caja',
        example: 40.00,
        type: Number,
        minimum: 0,
      })
  @IsNumber()
  @IsNotEmpty()
  initialCash: number; // Efectivo inicial en caja

@ApiProperty({
  description: 'Estatus de la caja',
  example: StateCashRegister.OPEN,
  enum: StateCashRegister,
})
@IsString()
@IsNotEmpty()
state: StateCashRegister; // Estado de la caja (Abierto, Cerrado)
}
