import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity'; // Asegúrate de importar la entidad User

@Entity()
export class CashRegister {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  cashInHand: number; // Efectivo actual en caja (ingresado manualmente)

  @Column('decimal', { precision: 10, scale: 2 })
  totalSales: number; // Total de ventas del día

  @Column('decimal', { precision: 10, scale: 2 })
  totalPayments: number; // Total de pagos del día

  @Column('decimal', { precision: 10, scale: 2 })
  expectedCash: number; // Efectivo esperado en caja (calculado como totalSales)

  @Column('decimal', { precision: 10, scale: 2 })
  discrepancy: number; // Diferencia entre cashInHand y expectedCash

  @ManyToOne(() => User, (user) => user.cashRegisters)
  user: User; // Usuario que realizó el corte de caja
}