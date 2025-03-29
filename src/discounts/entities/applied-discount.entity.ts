// src/discounts/entities/applied-discount.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Discount } from './discount.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';

@Entity('applied_discounts')
export class AppliedDiscount {
  @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Discount )
  @JoinColumn({ name: 'discountId' })
  discount: Discount;

  @Column({ type: 'bigint', unsigned: true })
  discountId: number;

  @ManyToOne(() => SoldProduct, soldProduct => soldProduct.appliedDiscounts )
  @JoinColumn({ name: 'soldProductId' })
  soldProduct: SoldProduct;

  @Column({ type: 'bigint', unsigned: true })
  soldProductId: number;
}