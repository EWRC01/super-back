// src/accounts-holdings/entities/accounts-holdings.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('accounts_holdings')
export class AccountsHoldings {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  total: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  paid: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  toPay: number;

  @Column({ type: 'enum', enum: ['holding', 'account'], nullable: false })
  type: string;

  @ManyToOne(() => Customer, (customer) => customer.accountsHoldings)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.accountsHoldings)
  @JoinColumn({ name: 'userId' })
  user: User;
}