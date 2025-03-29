// src/discounts/entities/discount.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AppliedDiscount } from './applied-discount.entity';
import { DiscountType } from 'src/common/enums/discount-type.enum';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DiscountType })
  type: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true, type: 'int', unsigned: true })
  minQuantity?: number;

  @Column({ nullable: true, type: 'bigint', unsigned: true })
  productId?: number;

  @Column({ nullable: true, type: 'bigint', unsigned: true })
  categoryId?: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => AppliedDiscount, applied => applied.discount)
  appliedDiscounts: AppliedDiscount[];
}