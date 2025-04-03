import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Product } from '../../products/entities/product.entity';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { AppliedDiscount } from 'src/discounts/entities/applied-discount.entity';
import { PriceType } from 'src/common/enums/price-type.enum';

@Entity('sold_products')
export class SoldProduct {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  price: number; // Precio FINAL (con descuentos aplicados) - Mantenemos este campo

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  originalPrice: number; // Nuevo: Precio SIN descuentos

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, default: 0 })
  discountAmount: number; // Monto total descontado

  @Column({ type: 'varchar', length: 100, nullable: true })
  discountDescription: string; // Descripción del descuento aplicado

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  priceWithouthIVA: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false }) 
  iva: number;

  @Column({ type: 'bigint', unsigned: true, nullable: false })
  productId: number;

  @Column({ type: 'enum', enum: PriceType, nullable: false })
  priceType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  saleId: number;

  @Column({ type: 'enum', enum: OperationType, nullable: false })
  type: string;

  @ManyToOne(() => Sale, (sale) => sale.products, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'saleId' })
  sale?: Sale;

  @ManyToOne(() => Product, (product) => product.soldProducts, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => AppliedDiscount, applied => applied.soldProduct)
  appliedDiscounts: AppliedDiscount[];
}