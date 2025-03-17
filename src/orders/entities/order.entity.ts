import { OrderDetail } from "src/orderdetails/entities/orderdetail.entity";
import { Provider } from "src/providers/entities/provider.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Provider, (provider) => provider.orders, {nullable: false})
    @JoinColumn({ name: 'providerId'})
    provider: Provider;

    @Column({type: 'date', nullable: false})
    orderDate: Date;

    @Column({ type: 'varchar', length: 50, nullable: false, unique: true})
    invoiceNumber: string

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    orderDetails: OrderDetail[]
}
