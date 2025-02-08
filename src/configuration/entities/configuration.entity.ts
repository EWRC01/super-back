// src/configuration/entities/configuration.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('configuration')
export class Configuration {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  logo: string;
}