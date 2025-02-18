import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  amount: number; // Monto del abono

  @Column({unsigned:true,  nullable: false }) // Asegúrate de que no sea nullable
  accountHoldingId: number;

  @ManyToOne(() => AccountsHoldings, (accountHolding) => accountHolding.payments, {cascade: false})
  @JoinColumn({ name: 'accountHoldingId' })
  accountHolding: AccountsHoldings; // Relación con la cuenta
}