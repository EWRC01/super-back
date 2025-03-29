import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Product } from 'src/products/entities/product.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { PriceType } from '../common/enums/price-type.enum';
import * as moment from 'moment-timezone';
import { DiscountType } from 'src/common/enums/discount-type.enum';
import { Discount } from 'src/discounts/entities/discount.entity';
import { AppliedDiscount } from 'src/discounts/entities/applied-discount.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(SoldProduct)
    private soldProductsRepository: Repository<SoldProduct>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(AppliedDiscount)
    private appliedDiscountRepository: Repository<AppliedDiscount>,
  ) {}


  async create(createSaleDto: CreateSaleDto): Promise<any> {
      // Verificar si el usuario existe
      const user = await this.userRepository.findOne({ 
        where: { id: createSaleDto.userId } 
      });
      if (!user) {
        throw new NotFoundException(`User with ID: ${createSaleDto.userId} not found!`);
      }
  
      // Verificar si el cliente existe
      const customer = await this.customerRepository.findOne({ 
        where: { id: createSaleDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID: ${createSaleDto.customerId} not found!`);
      }
  
      // Configurar zona horaria
      const timezone = 'America/El_Salvador';
      const now = moment().tz(timezone);
  
      let totalWithIVA = 0;
      let totalWithoutIVA = 0;
      let totalIVA = 0;
      let totalDiscount = 0;
  
      // Crear la venta primero para obtener el ID
      const sale = this.salesRepository.create({
        date: createSaleDto.date,
        paid: createSaleDto.paid,
        customer,
        user,
        totalWithIVA: 0,
        totalWithoutIVA: 0,
        totalIVA: 0,
        totalDiscount: 0
      });
  
      const savedSale = await this.salesRepository.save(sale);
  
      // Procesar cada producto en la venta
      for (const product of createSaleDto.products) {
        const productExists = await this.productsRepository.findOne({ 
          where: { id: product.productId }
        });
        
        if (!productExists) {
          throw new NotFoundException(`Product with ID ${product.productId} not found`);
        }
  
        // Calcular precio base según tipo
        const unitPrice = this.getPriceByType(productExists, product.priceType);
        const originalPrice = unitPrice * product.quantity;
        
        // Aplicar descuentos si existen
        let finalPrice = originalPrice;
        let itemDiscount = 0;
  
        if (product.appliedDiscounts && product.appliedDiscounts.length > 0) {
          for (const discountInfo of product.appliedDiscounts) {
            const discount = await this.discountRepository.findOne({
              where: { id: discountInfo.discountId }
            });
            
            if (discount) {
              // Convertir IDs a números para comparación
              const discountProductId = Number(discount.productId);
              const currentProductId = Number(product.productId);
  
              // Validar que el descuento sea aplicable a este producto
              if (discount.productId != null && discountProductId !== currentProductId) {
                throw new BadRequestException(
                  `El descuento ${discount.name} (ID: ${discount.id}) ` +
                  `no es aplicable al producto ${productExists.name} (ID: ${product.productId})`
                );
              }
  
              // Validar cantidad mínima si aplica
              if (discount.minQuantity && product.quantity < discount.minQuantity) {
                throw new BadRequestException(
                  `Se requiere una cantidad mínima de ${discount.minQuantity} ` +
                  `para aplicar el descuento ${discount.name}`
                );
              }
  
              // Validar fechas de vigencia con moment-timezone
              if (discount.startDate) {
                const startDate = moment(discount.startDate).tz(timezone);
                if (startDate.isAfter(now)) {
                  throw new BadRequestException(
                    `El descuento ${discount.name} estará vigente a partir del ${startDate.format('DD/MM/YYYY')}`
                  );
                }
              }
  
              if (discount.endDate) {
                const endDate = moment(discount.endDate).tz(timezone);
                if (endDate.isBefore(now)) {
                  throw new BadRequestException(
                    `El descuento ${discount.name} expiró el ${endDate.format('DD/MM/YYYY')}`
                  );
                }
              }
  
              // Validar si el descuento está activo
              if (discount.isActive === false) {
                throw new BadRequestException(
                  `El descuento ${discount.name} no está activo actualmente`
                );
              }
  
              const discountQty = discountInfo.quantity || product.quantity;
              itemDiscount += this.calculateDiscountAmount(
                discount, 
                unitPrice, 
                discountQty
              );
            } else {
              throw new NotFoundException(`Discount with ID ${discountInfo.discountId} not found`);
            }
          }
          finalPrice = originalPrice - itemDiscount;
        }
  
        // Calcular IVA sobre el precio final con descuento
        const priceWithouthIVA = finalPrice / 1.13;
        const iva = finalPrice - priceWithouthIVA;
  
        // Registrar el producto vendido
        const soldProduct = await this.soldProductsRepository.save({
          quantity: product.quantity,
          price: finalPrice,
          originalPrice,
          discountAmount: itemDiscount,
          priceWithouthIVA,
          iva,
          productId: product.productId,
          saleId: savedSale.id,
          type: 'sale',
          priceType: product.priceType,
          createdAt: now.toDate(),
        });
  
        // Registrar descuentos aplicados si existen
        if (product.appliedDiscounts && product.appliedDiscounts.length > 0) {
          await Promise.all(
            product.appliedDiscounts.map(async (d) => {
              const discount = await this.discountRepository.findOne({ 
                where: { id: d.discountId } 
              });
              if (discount) {
                return this.appliedDiscountRepository.save({
                  amount: this.calculateDiscountAmount(
                    discount,
                    unitPrice,
                    d.quantity || product.quantity
                  ),
                  discountId: d.discountId,
                  soldProductId: soldProduct.id,
                  appliedAt: now.toDate(),
                });
              }
            })
          );
        }
  
        // Actualizar totales
        totalWithIVA += finalPrice;
        totalWithoutIVA += priceWithouthIVA;
        totalIVA += iva;
        totalDiscount += itemDiscount;
  
        // Actualizar stock
        await this.productsRepository.decrement(
          { id: product.productId },
          'stock',
          product.quantity
        );
      }
  
      // Validar que el monto pagado sea suficiente
      if (createSaleDto.paid < totalWithIVA) {
        throw new BadRequestException('El monto pagado es insuficiente.');
      }
  
      // Actualizar la venta con los totales reales
      await this.salesRepository.update(savedSale.id, {
        totalWithIVA,
        totalWithoutIVA,
        totalIVA,
        totalDiscount,
      });
  
      // Calcular el cambio
      const change = createSaleDto.paid - totalWithIVA;
  
      return {
        ...await this.salesRepository.findOne({ where: { id: savedSale.id } }),
        paid: createSaleDto.paid,
        change,
        date: now.format('YYYY-MM-DD HH:mm:ss'),
        timezone,
      };
    }

private getPriceByType(product: Product, priceType: PriceType): number {
    switch (priceType) {
      case PriceType.SALE: return product.salePrice;
      case PriceType.WHOLESALE: return product.wholesalePrice;
      case PriceType.TOURIST: return product.touristPrice;
      default: throw new BadRequestException(`Tipo de precio no válido: ${priceType}`);
    }
}

private calculateDiscountAmount(discount: Discount, unitPrice: number, quantity: number): number {
    if (!discount) return 0;
    
    switch(discount.type) {
      case 'PERCENTAGE':
        return (unitPrice * quantity) * (discount.value / 100);
      case 'FIXED_AMOUNT':
        return Math.min(discount.value * quantity, unitPrice * quantity);
      case 'BUY_X_GET_Y':
        const freeItems = Math.floor(quantity / discount.minQuantity) * discount.value;
        return freeItems * unitPrice;
      case 'BUNDLE':
        const bundleSize = discount.minQuantity || 1;
        const bundlePrice = discount.value || unitPrice;
        const bundles = Math.floor(quantity / bundleSize);
        const remainder = quantity % bundleSize;
        return (unitPrice * quantity) - ((bundles * bundlePrice) + (remainder * unitPrice));
      default:
        return 0;
    }
}


  async findAll(startDate: string, endDate: string): Promise<Sale[]> {

    const timeZone = "America/El_Salvador";

    return this.salesRepository.find({
      where: {
        date: Between(
          moment.tz(`${startDate}T00:00:00`, timeZone).toDate(), 
          moment.tz(`${endDate}T23:59:59`, timeZone).toDate(),
        )
      },
      relations: ['products'],
    });
  }

  async getDailySales(month: number, year: number): Promise<any> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select("DATE_FORMAT(sale.date, '%Y-%m-%d')", 'day')
      .addSelect('SUM(sale.totalWithIVA)', 'totalSales')
      .where('MONTH(sale.date) = :month AND YEAR(sale.date) = :year', { month, year })
      .groupBy('day')
      .getRawMany();
    return result || 0;
  }

  async getMonthlySales(year: number): Promise<any> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('MONTH(sale.date)', 'month')
      .addSelect('SUM(sale.totalWithIVA)', 'totalSales')
      .where('YEAR(sale.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
    return result || 0;
  }

  async getTotalIncome(): Promise<number> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .getRawOne();
    return result.totalIncome || 0;
  }

  async getTodayIncome(): Promise<number> {

    // Hacemos referencia a la zona horaria de El Salvador

    const timezone = 'America/El_Salvador';
    
    // Definimos la hora de inicio y fin

    const todayStart= moment().tz(timezone).startOf('day').toDate(); // Inicio del dia (00:00:00)
    const todayEnd= moment().tz(timezone).endOf('day').toDate(); // Fin del dia (23:59:59)

    //Query Builder para el ingreso total del día

    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :todayStart', { todayStart })
      .andWhere('sale.date <= :todayEnd', { todayEnd })
      .getRawOne();

    return result.totalIncome || 0; // Retornamos 0 si no hay ventas
  }

  async getWeeklyIncome(): Promise<number> {

    // Hacemos referencia a la zona horaria de El Salvador
    const timeZone = 'America/El_Salvador';
    const now = moment().tz(timeZone);

    // Calcular el inicio de la semana

    const weekStart = now.startOf('week').toDate(); // Inicio de la semana (Domingo)
    const weekEnd = now.endOf('week').toDate(); // Fin de la semana (Sábado)

    // Usar Query Builder para obtener el ingreso total de la semana
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :weekStart', { weekStart })
      .andWhere('sale.date <= :weekEnd', { weekEnd })
      .getRawOne();
    return result.totalIncome || 0; // Retornar 0 si no hay ventas
  }

  async getMonthlyIncome(): Promise<number> {

    // Hacemos referencia a la zona horaria de El Salvador
    const timeZone = 'America/El_Salvador';
    const now = moment().tz(timeZone);

    // Calcular el inicio y fin del mes
    const monthStart = now.startOf('month').toDate(); // Inicio del mes
    const monthEnd = now.endOf('month').toDate(); // Fin del mes

    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :monthStart', { monthStart })
      .andWhere('sale.date <= :monthEnd', { monthEnd })
      .getRawOne();
    return result.totalIncome || 0; // Retornar 0 si no hay ventas
  }
}