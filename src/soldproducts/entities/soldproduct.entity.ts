// src/sold-products/entities/sold-product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sold_products')
export class SoldProduct {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'bigint', unsigned: true, nullable: false })
  productId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: false })
  referenceId: number;

  @Column({ type: 'enum', enum: ['holding', 'account', 'sale', 'quotation'], nullable: false })
  type: string;
}