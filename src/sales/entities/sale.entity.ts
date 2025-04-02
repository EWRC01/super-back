import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  totalWithIVA: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  totalWithoutIVA: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  totalIVA: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: false })
  paid: number;
  
  @Column({ type: 'decimal', precision: 9, scale: 2 })
  totalDiscount: number; // <-- Nuevo campo

  @ManyToOne(() => Customer, (customer) => customer.sales, {nullable: true})
  @JoinColumn({ name: 'customerId' })
  customer?: Customer | null;

  @ManyToOne(() => User, (user) => user.sales, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SoldProduct, (soldProduct) => soldProduct.sale, {onDelete: 'CASCADE'})
  products: SoldProduct[];
}