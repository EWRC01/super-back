// src/sold-products/sold-products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SoldProduct } from './entities/soldproduct.entity';
import { CreateSoldProductsDto } from './dto/create-soldproduct.dto';

@Injectable()
export class SoldProductsService {
  constructor(
    @InjectRepository(SoldProduct)
    private readonly soldProductRepository: Repository<SoldProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // 1. Obtener productos vendidos por ID y tipo
  async getSoldProductsByIdAndType(id: number, type: string): Promise<any[]> {
    const products = await this.soldProductRepository
      .createQueryBuilder('soldProduct')
      .leftJoinAndSelect(Product, 'product', 'product.id = soldProduct.productId')
      .select([
        'soldProduct.quantity',
        'soldProduct.price',
        'product.name',
        'product.purchasePrice',
        'product.id',
      ])
      .where('soldProduct.referenceId = :id AND soldProduct.type = :type', { id, type })
      .getRawMany();

    if (!products.length) {
      throw new NotFoundException(
        `No se encontraron productos vendidos para el ID de referencia ${id} y tipo ${type}.`,
      );
    }

    return products;
  }

  // 2. Registrar productos vendidos
  async registerSoldProducts(createSoldProductsDto: CreateSoldProductsDto): Promise<number[]> {
    const { products } = createSoldProductsDto;
    const results = [];

    for (const product of products) {
      // Verificar si el producto existe
      const existingProduct = await this.productRepository.findOne({
        where: { id: product.productId },
      });

      if (!existingProduct) {
        throw new NotFoundException(
          `El producto con ID ${product.productId} no existe.`,
        );
      }

      // Crear el registro de producto vendido
      const soldProduct = this.soldProductRepository.create({
        quantity: product.quantity,
        price: product.price,
        productId: product.productId,
        referenceId: product.referenceId,
        type: product.type,
      });

      await this.soldProductRepository.save(soldProduct);
      results.push(1);
    }

    return results;
  }

  // 3. Obtener productos más vendidos
  async getTopSoldProducts(limit: number): Promise<any[]> {
    const topProducts = await this.soldProductRepository
      .createQueryBuilder('soldProduct')
      .innerJoin(Product, 'product', 'product.id = soldProduct.productId')
      .select([
        'SUM(soldProduct.quantity * soldProduct.price) AS total',
        'SUM(soldProduct.quantity) AS units',
        'product.name',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('soldProduct.productId')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();

    if (!topProducts.length) {
      throw new NotFoundException('No se encontraron productos vendidos.');
    }

    return topProducts;
  }

  // 4. Obtener totales por marca
  async getSalesTotalsByBrand(): Promise<any[]> {
    const totals = await this.brandRepository
      .createQueryBuilder('brand')
      .innerJoin('brand.products', 'product')
      .innerJoin(SoldProduct, 'soldProduct', 'soldProduct.productId = product.id')
      .select([
        'brand.brandName AS brandName',
        'SUM(soldProduct.price * soldProduct.quantity) AS totalSales',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('brand.id')
      .getRawMany();

    if (!totals.length) {
      throw new NotFoundException('No se encontraron ventas por marca.');
    }

    return totals;
  }

  // 5. Obtener totales por categoría
  async getSalesTotalsByCategory(): Promise<any[]> {
    const totals = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.products', 'product')
      .innerJoin(SoldProduct, 'soldProduct', 'soldProduct.productId = product.id')
      .select([
        'category.categoryName AS categoryName',
        'SUM(soldProduct.price * soldProduct.quantity) AS totalSales',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('category.id')
      .getRawMany();

    if (!totals.length) {
      throw new NotFoundException('No se encontraron ventas por categoría.');
    }

    return totals;
  }

  // 6. Obtener el producto más vendido por marca
  async getTopSoldProductByBrand(): Promise<any[]> {
    const topProducts = await this.brandRepository
      .createQueryBuilder('brand')
      .innerJoin('brand.products', 'product')
      .innerJoin(SoldProduct, 'soldProduct', 'soldProduct.productId = product.id')
      .select([
        'brand.brandName AS brandName',
        'product.name AS productName',
        'SUM(soldProduct.quantity) AS totalUnitsSold',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('brand.id, product.id')
      .orderBy('totalUnitsSold', 'DESC')
      .getRawMany();

    if (!topProducts.length) {
      throw new NotFoundException('No se encontraron productos vendidos por marca.');
    }

    return topProducts;
  }

  // 7. Obtener el producto más vendido por categoría
  async getTopSoldProductByCategory(): Promise<any[]> {
    const topProducts = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.products', 'product')
      .innerJoin(SoldProduct, 'soldProduct', 'soldProduct.productId = product.id')
      .select([
        'category.categoryName AS categoryName',
        'product.name AS productName',
        'SUM(soldProduct.quantity) AS totalUnitsSold',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('category.id, product.id')
      .orderBy('totalUnitsSold', 'DESC')
      .getRawMany();

    if (!topProducts.length) {
      throw new NotFoundException('No se encontraron productos vendidos por categoría.');
    }

    return topProducts;
  }
}