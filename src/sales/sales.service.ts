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
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';

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
    @InjectRepository(AccountsHoldings)
    private accountsHoldingsRepository: Repository<AccountsHoldings>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<any> {
    // Verificar si el usuario existe
    const user = await this.userRepository.findOne({ where: { id: createSaleDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID: ${createSaleDto.userId} not found!`);
    }
  
    // Verificar si el cliente existe
    const customer = await this.customerRepository.findOne({ where: { id: createSaleDto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID: ${createSaleDto.customerId} not found!`);
    }
  
    // Calcular el total de la venta
    let total = 0;
    for (const product of createSaleDto.products) {
      const productExists = await this.productsRepository.findOne({ where: { id: product.productId } });
      if (!productExists) {
        throw new NotFoundException(`Product with ID ${product.productId} not found`);
      }
  
      // Seleccionar el precio según el tipo
      let price: number;
      switch (product.priceType) {
        case PriceType.SALE:
          price = productExists.salePrice;
          break;
        case PriceType.WHOLESALE:
          price = productExists.wholesalePrice;
          break;
        case PriceType.TOURIST:
          price = productExists.touristPrice;
          break;
        default:
          throw new BadRequestException(`Tipo de precio no válido: ${product.priceType}`);
      }
  
      // Sumar al total
      total += price * product.quantity;
    }
  
    // Validar que el monto pagado sea suficiente
    if (createSaleDto.paid < total) {
      throw new BadRequestException('El monto pagado es insuficiente.');
    }
  
    // Crear la venta con el total calculado
    const sale = this.salesRepository.create({
      ...createSaleDto,
      user,
      customer,
      total, // Asignar el total calculado
    });
    const savedSale = await this.salesRepository.save(sale);
  
    // Registrar los productos vendidos y actualizar el stock
    for (const product of createSaleDto.products) {
      const productExists = await this.productsRepository.findOne({ where: { id: product.productId } });
  
      // Seleccionar el precio según el tipo
      let price: number;
      switch (product.priceType) {
        case PriceType.SALE:
          price = productExists.salePrice;
          break;
        case PriceType.WHOLESALE:
          price = productExists.wholesalePrice;
          break;
        case PriceType.TOURIST:
          price = productExists.touristPrice;
          break;
        default:
          throw new BadRequestException(`Tipo de precio no válido: ${product.priceType}`);
      }
  
      const soldProduct = this.soldProductsRepository.create({
        quantity: product.quantity,
        price, // Usar el precio seleccionado
        productId: product.productId,
        saleId: savedSale.id,
        type: 'sale',
      });
      await this.soldProductsRepository.save(soldProduct);
  
      // Actualizar el stock del producto
      await this.productsRepository.decrement(
        { id: product.productId },
        'stock',
        product.quantity,
      );
    }
  
    // Calcular el cambio
    const change = createSaleDto.paid - total;
  
    // Retornar una respuesta más completa
    return {
      ...savedSale,
      total,
      paid: createSaleDto.paid,
      change,
    };
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
      .addSelect('SUM(sale.total)', 'totalSales')
      .where('MONTH(sale.date) = :month AND YEAR(sale.date) = :year', { month, year })
      .groupBy('day')
      .getRawMany();
    return result || 0;
  }

  async getMonthlySales(year: number): Promise<any> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('MONTH(sale.date)', 'month')
      .addSelect('SUM(sale.total)', 'totalSales')
      .where('YEAR(sale.date) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
    return result || 0;
  }

  async getTotalIncome(): Promise<number> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalIncome')
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
      .select('SUM(sale.total)', 'totalIncome')
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
      .select('SUM(sale.total)', 'totalIncome')
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
      .select('SUM(sale.total)', 'totalIncome')
      .where('sale.date >= :monthStart', { monthStart })
      .andWhere('sale.date <= :monthEnd', { monthEnd })
      .getRawOne();
    return result.totalIncome || 0; // Retornar 0 si no hay ventas
  }

  async getPendingIncome(): Promise<number> {
    const result = await this.accountsHoldingsRepository
      .createQueryBuilder('account')
      .select('SUM(account.toPay)', 'pendingIncome')
      .where('account.type = :type', { type: 'account' }) // Filtra solo las cuentas por cobrar
      .getRawOne();
  
    return result.pendingIncome || 0;
  }
}