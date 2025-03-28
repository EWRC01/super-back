// src/damaged-products/damaged-products.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DamagedProduct } from './entities/damaged-product.entity';
import { Product } from '../products/entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class DamagedProductsService {
  constructor(
    @InjectRepository(DamagedProduct)
    private readonly damagedProductRepository: Repository<DamagedProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async find() {
    return await this.damagedProductRepository.find({
      relations: ['product', 'brand', 'brand.provider']
    });
  }

  async reportDamagedProduct(
    productId: number,
    quantity: number,
    notes?: string,
  ): Promise<DamagedProduct> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['brand', 'brand.provider'],
    });

    if (!product) {
      throw new HttpException(
        'Producto no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (product.stock < quantity) {
      throw new HttpException(
        'No hay suficiente stock para reportar como dañado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Actualizar SOLO el stock normal (eliminamos la línea que modifica damagedStock)
    product.stock -= quantity;
    await this.productRepository.save(product);

    // Crear el registro de producto dañado
    const damagedProduct = this.damagedProductRepository.create({
      product,
      brand: product.brand,
      quantity,
      notes,
      replaced: false // Asegurar que se marca como no repuesto inicialmente
    });

    return this.damagedProductRepository.save(damagedProduct);
  }

  async requestReplacement(damagedProductId: number): Promise<DamagedProduct> {
    const damagedProduct = await this.damagedProductRepository.findOne({
      where: { id: damagedProductId },
      relations: ['brand', 'brand.provider'],
    });

    if (!damagedProduct) {
      throw new HttpException(
        'Registro de producto dañado no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verificar si el producto ya está marcado como repuesto
    if (damagedProduct.replaced) {
      throw new HttpException(
        'Este producto ya fue repuesto',
        HttpStatus.BAD_REQUEST,
      );
    }

    damagedProduct.replacementRequested = true;
    return this.damagedProductRepository.save(damagedProduct);
  }

  async approveReplacement(
    damagedProductId: number,
    approvedQuantity: number,
  ): Promise<DamagedProduct> {
    const damagedProduct = await this.damagedProductRepository.findOne({
      where: { id: damagedProductId },
      relations: ['product', 'brand', 'brand.provider'],
    });

    if (!damagedProduct) {
      throw new HttpException(
        'Registro de producto dañado no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (approvedQuantity > damagedProduct.quantity) {
      throw new HttpException(
        'La cantidad aprobada no puede exceder la cantidad dañada',
        HttpStatus.BAD_REQUEST,
      );
    }

    damagedProduct.replacementApproved = true;
    damagedProduct.replacedQuantity = approvedQuantity;
    return this.damagedProductRepository.save(damagedProduct);
  }

  async processReplacement(
    damagedProductId: number,
    actualReplacedQuantity: number,
  ): Promise<{ damagedProduct: DamagedProduct; product: Product }> {
    const damagedProduct = await this.damagedProductRepository.findOne({
      where: { id: damagedProductId },
      relations: ['product', 'brand', 'brand.provider'],
    });

    if (!damagedProduct) {
      throw new HttpException(
        'Registro de producto dañado no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!damagedProduct.replacementApproved) {
      throw new HttpException(
        'La reposición debe ser aprobada primero',
        HttpStatus.CONFLICT,
      );
    }

    if (actualReplacedQuantity > (damagedProduct.replacedQuantity || 0)) {
      throw new HttpException(
        'La cantidad repuesta no puede exceder la cantidad aprobada',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Actualizar el registro
    damagedProduct.replaced = true;
    damagedProduct.replacedQuantity = actualReplacedQuantity;
    damagedProduct.dateReplaced = new Date();

    // Actualizar SOLO el stock normal (eliminamos la línea que modifica damagedStock)
    const product = damagedProduct.product;
    product.stock += actualReplacedQuantity;

    await this.productRepository.save(product);
    const updatedDamagedProduct = await this.damagedProductRepository.save(
      damagedProduct,
    );

    return {
      damagedProduct: updatedDamagedProduct,
      product,
    };
  }

  async getDamagedStock(productId: number): Promise<number> {
    const result = await this.damagedProductRepository
      .createQueryBuilder('damaged')
      .select('SUM(damaged.quantity)', 'totalDamaged')
      .where('damaged.productId = :productId', { productId })
      .andWhere('damaged.replaced = false')
      .getRawOne();

    return parseInt(result.totalDamaged) || 0;
  }

  async getLossStatistics(providerId?: number): Promise<{
    totalLoss: number;
    replacedLoss: number;
    netLoss: number;
    byBrand: Array<{
      brandId: number;
      brandName: string;
      totalLoss: number;
      replacedLoss: number;
    }>;
  }> {
    let query = this.damagedProductRepository
      .createQueryBuilder('damaged')
      .leftJoinAndSelect('damaged.brand', 'brand')
      .leftJoinAndSelect('brand.provider', 'provider')
      .leftJoinAndSelect('damaged.product', 'product');

    if (providerId) {
      query = query.where('provider.id = :providerId', { providerId });
    }

    const allDamaged = await query.getMany();

    let totalLoss = 0;
    let replacedLoss = 0;
    const brandMap = new Map<number, { brandName: string; total: number; replaced: number }>();

    for (const item of allDamaged) {
      const itemLoss = item.quantity * item.product.purchasePrice;
      totalLoss += itemLoss;

      // Estadísticas por marca
      if (!brandMap.has(item.brand.id)) {
        brandMap.set(item.brand.id, {
          brandName: item.brand.brandName,
          total: 0,
          replaced: 0,
        });
      }
      const brandStats = brandMap.get(item.brand.id);
      brandStats.total += itemLoss;

      if (item.replaced && item.replacedQuantity) {
        const itemReplaced = item.replacedQuantity * item.product.purchasePrice;
        replacedLoss += itemReplaced;
        brandStats.replaced += itemReplaced;
      }
    }

    return {
      totalLoss,
      replacedLoss,
      netLoss: totalLoss - replacedLoss,
      byBrand: Array.from(brandMap.entries()).map(([brandId, stats]) => ({
        brandId,
        brandName: stats.brandName,
        totalLoss: stats.total,
        replacedLoss: stats.replaced,
      })),
    };
  }

  async getDamagedProductsByPeriod(
    productId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<DamagedProduct[]> {
    return this.damagedProductRepository.find({
      where: {
        product: { id: productId },
        dateReported: Between(startDate, endDate),
      },
      relations: ['brand', 'brand.provider'],
    });
  }
}