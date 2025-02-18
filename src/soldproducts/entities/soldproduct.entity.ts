import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Product } from '../../products/entities/product.entity';
import { OperationType } from 'src/common/enums/operation-type.enum';

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

  @Column({ type: 'enum', enum: OperationType, nullable: false })
  priceType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: false })
  saleId: number;

  @Column({ type: 'enum', enum: OperationType, nullable: false })
  type: string;

  @ManyToOne(() => Sale, (sale) => sale.products, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @ManyToOne(() => Product, (product) => product.soldProducts, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'productId' })
  product: Product;
}