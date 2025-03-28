// src/damaged-products/entities/damaged-product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('damaged_products')
export class DamagedProduct {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  dateReported: Date;

  @Column({ type: 'boolean', default: false })
  replaced: boolean;

  @Column({ type: 'datetime', nullable: true })
  dateReplaced: Date;

  @Column({ type: 'int', nullable: true })
  replacedQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  replacementRequested: boolean;

  @Column({ type: 'boolean', default: false })
  replacementApproved: boolean;

  @ManyToOne(() => Product, (product) => product.damagedProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Brand, (brand) => brand.damagedProducts, { eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;
}