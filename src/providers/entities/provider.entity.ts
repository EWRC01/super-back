import { Brand } from "src/brands/entities/brand.entity";
import { Order } from "src/orders/entities/order.entity";
import { Column, Entity, OneToMany, OrderedBulkOperation, PrimaryGeneratedColumn } from "typeorm";

@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false})
    name: string;

    @Column({ type:'varchar', length: 100, nullable: false})
    taxId: string;

    @Column({ type: 'varchar', length: 100, nullable: true})
    address: string;

    @Column({ type: 'varchar', length: 10, nullable: false})
    phone: string;

    @OneToMany(() => Brand, (brand) => brand.provider)
    brands: Brand[];

    @OneToMany(() => Order, (order) => order.provider)
    orders: Order[];
}
