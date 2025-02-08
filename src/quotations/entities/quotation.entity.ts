// src/quotations/entities/quotation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  total: number;

  @ManyToOne(() => Customer, (customer) => customer.quotations)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.quotations)
  @JoinColumn({ name: 'userId' })
  user: User;
}