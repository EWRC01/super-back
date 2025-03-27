// src/brands/entities/brand.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Provider } from 'src/providers/entities/provider.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  brandName: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @ManyToOne(() => Provider, (provider) => provider.brands, {nullable: false})
  @JoinColumn({name: 'providerId'})
  provider: Provider;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}