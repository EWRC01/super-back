// src/accounts-holdings/entities/accounts-holdings.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { Product } from 'src/products/entities/product.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';

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

  @Column({ type: 'enum', enum: OperationType , nullable: false })
  type: string;

  @ManyToOne(() => Customer, (customer) => customer.accountsHoldings)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.accountsHoldings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SoldProduct, (soldProduct) => soldProduct.accountHolding, {cascade: true})
  soldProducts: SoldProduct[];

  @OneToMany(() => Payment, (payment) => payment.accountHolding, {cascade: false})
  payments: Payment[];
}