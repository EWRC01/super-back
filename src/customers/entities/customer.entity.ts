// src/customers/entities/customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @OneToMany(() => Sale, (sale) => sale.customer, {onDelete: 'CASCADE'})
  sales: Sale[];

  @OneToMany(() => Quotation, (quotation) => quotation.customer, {onDelete: 'CASCADE'})
  quotations: Quotation[];
}