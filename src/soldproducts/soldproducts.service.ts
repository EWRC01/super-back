// src/sold-products/sold-products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SoldProduct } from './entities/soldproduct.entity';
import { CreateSoldProductsDto } from './dto/create-soldproduct.dto';
import { PriceType } from 'src/common/enums/price-type.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Discount } from 'src/discounts/entities/discount.entity';
import { DiscountType } from 'src/common/enums/discount-type.enum';
import { AppliedDiscount } from 'src/discounts/entities/applied-discount.entity';

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
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(AppliedDiscount)
    private readonly appliedDiscountRepository: Repository<AppliedDiscount>,
  ) {}

  // 0. Obtener todos los productos vendidos
  async find(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;
    const [data, total] = await this.soldProductRepository.findAndCount({
      take: Number(limit),
      skip: Number((page - 1)) * Number(limit),
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // 1. Obtener productos vendidos por ID y tipo
  async getSoldProductsByIdAndType(id: number, type: string): Promise<any[]> {
    const products = await this.soldProductRepository
      .createQueryBuilder('soldProduct')
      .leftJoinAndSelect(Product, 'product', 'product.id = soldProduct.productId')
      .select([
        'soldProduct.quantity',
        'soldProduct.price',
        'soldProduct.priceWithouthIVA',
        'soldProduct.iva',
        'product.name',
        'product.purchasePrice',
        'product.id',
      ])
      .where('soldProduct.id = :id AND soldProduct.type = :type', { id, type })
      .getRawMany();

    if (!products.length) {
      throw new NotFoundException(
        `No se encontraron productos vendidos para el ID de referencia ${id} y tipo ${type}.`,
      );
    }

    return products;
  }


// 2. Registrar productos vendidos con descuentos opcionales
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

    // Calcular el precio según el tipo de precio (priceType)
    const unitPrice = this.getPriceByType(existingProduct, product.priceType);
    const originalPrice = unitPrice * product.quantity;
    
    // Inicializar valores para descuentos
    let finalPrice = originalPrice;
    let totalDiscount = 0;
    let discountDescription = null;
    const appliedDiscounts = [];

    // Aplicar descuentos si fueron especificados
    if (product.appliedDiscounts && product.appliedDiscounts.length > 0) {
      const discountResults = [];
      
      for (const appliedDiscount of product.appliedDiscounts) {
        // Verificar que el descuento existe
        const discount = await this.discountRepository.findOne({
          where: { id: appliedDiscount.discountId }
        });

        if (!discount) {
          throw new NotFoundException(
            `El descuento con ID ${appliedDiscount.discountId} no existe.`,
          );
        }

        // Calcular cantidad a la que aplica el descuento
        const discountQuantity = appliedDiscount.quantity || product.quantity;
        
        // Calcular el descuento
        const discountResult = this.calculateDiscount(
          discount,
          discountQuantity,
          unitPrice
        );

        totalDiscount += discountResult.discountAmount;
        discountResults.push(discountResult.discountDescription);

        // Guardar referencia para crear appliedDiscounts después
        appliedDiscounts.push({
          discountId: discount.id,
          amount: discountResult.discountAmount
        });
      }

      finalPrice = originalPrice - totalDiscount;
      discountDescription = discountResults.join(' + ');
    }

    // Crear el registro de producto vendido
    const soldProduct = this.soldProductRepository.create({
      quantity: product.quantity,
      price: finalPrice,
      originalPrice,
      discountAmount: totalDiscount,
      discountDescription,
      productId: product.productId,
      saleId: product.saleId, // <-- Usamos solo saleId aquí
      type: product.type,
      priceType: product.priceType,
      priceWithouthIVA: finalPrice / 1.13,
      iva: finalPrice - (finalPrice / 1.13),
    });

    const savedSoldProduct = await this.soldProductRepository.save(soldProduct);

    // Registrar los descuentos aplicados
    if (appliedDiscounts.length > 0) {
      await Promise.all(
        appliedDiscounts.map(ad => 
          this.appliedDiscountRepository.save({
            amount: ad.amount,
            discountId: ad.discountId,
            soldProductId: savedSoldProduct.id
          })
        )
      );
    }

    results.push(1);
  }

  return results;
}

  private getPriceByType(product: Product, priceType: PriceType): number {
    switch (priceType) {
      case PriceType.SALE:
        return product.salePrice;
      case PriceType.WHOLESALE:
        return product.wholesalePrice;
      case PriceType.TOURIST:
        return product.touristPrice;
      default:
        throw new NotFoundException(`Tipo de precio no válido: ${priceType}`);
    }
  }

  private calculateDiscount(
    discount: Discount,
    quantity: number,
    unitPrice: number
  ): {
    finalPrice: number;
    discountAmount: number;
    discountDescription: string;
  } {
    const totalOriginalPrice = unitPrice * quantity;
    let finalPrice = totalOriginalPrice;
    let discountAmount = 0;
    let description = discount.name;
  
    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        discountAmount = totalOriginalPrice * (discount.value / 100);
        finalPrice = totalOriginalPrice - discountAmount;
        description = `${discount.value}% de descuento`;
        break;
  
      case DiscountType.FIXED_AMOUNT:
        discountAmount = Math.min(discount.value * quantity, totalOriginalPrice);
        finalPrice = totalOriginalPrice - discountAmount;
        description = `$${discount.value} de descuento por unidad`;
        break;
  
      case DiscountType.BUY_X_GET_Y:
        const x = discount.minQuantity || 2;
        const y = discount.value || 1;
        const paidQuantity = quantity - Math.floor(quantity / x) * y;
        discountAmount = totalOriginalPrice - (paidQuantity * unitPrice);
        finalPrice = paidQuantity * unitPrice;
        description = `Promo ${x}x${y}`;
        break;
  
      case DiscountType.BUNDLE:
        const bundleSize = discount.minQuantity || 1;
        const bundlePrice = discount.value || unitPrice;
        const bundles = Math.floor(quantity / bundleSize);
        const remainder = quantity % bundleSize;
        discountAmount = totalOriginalPrice - ((bundles * bundlePrice) + (remainder * unitPrice));
        finalPrice = (bundles * bundlePrice) + (remainder * unitPrice);
        description = `${bundleSize} por $${bundlePrice}`;
        break;
  
      case DiscountType.SEASONAL:
        // Implementación para descuentos estacionales
        discountAmount = totalOriginalPrice * 0.1; // Ejemplo: 10% de descuento estacional
        finalPrice = totalOriginalPrice - discountAmount;
        description = `Oferta estacional: ${discount.name}`;
        break;
  
      default:
        discountAmount = 0;
        finalPrice = totalOriginalPrice;
        description = 'Descuento aplicado';
    }
  
    return {
      finalPrice,
      discountAmount,
      discountDescription: description
    };
  }

  // 3. Obtener productos más vendidos
  async getTopSoldProducts(limit: number): Promise<any[]> {
    const topProducts = await this.soldProductRepository
      .createQueryBuilder('soldProduct')
      .innerJoin(Product, 'product', 'product.id = soldProduct.productId')
      .select([
        'SUM(soldProduct.price) AS total', // <- Cambio aquí
        'SUM(soldProduct.quantity) AS units',
        'product.name',
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('soldProduct.productId')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  
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
        'SUM(soldProduct.price) AS totalSales', // <- Quita " * soldProduct.quantity"
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('brand.id')
      .getRawMany();
  
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
        'SUM(soldProduct.price) AS totalSales', // <- Quita " * soldProduct.quantity"
      ])
      .where("soldProduct.type = 'sale'")
      .groupBy('category.id')
      .getRawMany();
  
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