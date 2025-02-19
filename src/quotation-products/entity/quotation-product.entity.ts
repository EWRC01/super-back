import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Quotation } from "src/quotations/entities/quotation.entity";
import { Product } from "src/products/entities/product.entity";
import { PriceType } from "src/common/enums/price-type.enum";

@Entity()
export class QuotationProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Quotation, (quotation) => quotation.quotationProducts, {onDelete: 'CASCADE'})
    quotation: Quotation;

    @ManyToOne(() => Product, { eager: true })
    product: Product;

    @Column({ type: "enum", enum: PriceType })
    priceType: PriceType;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: "int" })
    quantity: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    subtotal: number;
}
