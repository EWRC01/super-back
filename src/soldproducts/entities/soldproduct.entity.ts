import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Product } from '../../products/entities/product.entity';

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

  @Column({ type: 'enum', enum: ['sale', 'account', 'holding', 'quotation'], nullable: false })
  type: string;

  @ManyToOne(() => Sale, (sale) => sale.products)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @ManyToOne(() => Product, (product) => product.soldProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;
}