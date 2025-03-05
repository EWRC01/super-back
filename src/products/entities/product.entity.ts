// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { SoldProduct } from '../../soldproducts/entities/soldproduct.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: false })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  salePrice: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false})
  touristPrice: number;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @Column({type: 'int', nullable: false})
  reservedStock: number;

  @Column({ type: 'boolean', nullable: true })
  wholesaleSale: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  wholesalePrice: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  wholesaleQuantity: number;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => SoldProduct, (soldProduct) => soldProduct.product)
  soldProducts: SoldProduct[];
}