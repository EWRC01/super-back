import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Order, (order) => order.orderDetails, { nullable: false })
  @JoinColumn({ name: 'invoiceNumber', referencedColumnName: 'invoiceNumber' })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  purchasePrice: number; // Precio de compra

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  calculatedTax: number; // IVA calculado
}
