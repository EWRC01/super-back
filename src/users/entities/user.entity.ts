// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { CashRegister } from 'src/cash-register/entities/cash-register.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false})
  password: string;

  @Column({type: 'boolean', default: false, nullable: false})
  isAdmin: boolean;

  @OneToMany(() => Sale, (sale) => sale.user, {onDelete: 'CASCADE'})
  sales: Sale[];

  @OneToMany(() => Quotation, (quotation) => quotation.user, {onDelete: 'CASCADE'})
  quotations: Quotation[];

  @OneToMany(() => CashRegister, (cashRegister) => cashRegister.user)
  cashRegisters: CashRegister[];
}