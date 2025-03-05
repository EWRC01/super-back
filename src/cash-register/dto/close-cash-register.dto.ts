import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StateCashRegister } from 'src/common/enums/cash-register-state.enum';

export class CloseCashRegisterDto {
  @ApiProperty({
    description: 'Efectivo actual en caja',
    example: 1500.00,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  cashInHand: number; // Efectivo actual en caja

  @ApiProperty({
    description: 'Estatus de la caja',
    example: StateCashRegister.OPEN,
    enum: StateCashRegister,
  })
  @IsString()
  @IsNotEmpty()
  state: StateCashRegister; // Estado de la caja (Abierto, Cerrado)
}