import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { PriceType } from 'src/common/enums/price-type.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as moment from 'moment-timezone';
import { Sale } from 'src/sales/entities/sale.entity';
import { AccountHoldingStatus } from 'src/common/enums/accounts-holdings-status.enum';

@Injectable()
export class AccountsHoldingsService {
  constructor(
    @InjectRepository(AccountsHoldings)
    private accountsHoldingsRepository: Repository<AccountsHoldings>,

    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(SoldProduct)
    private soldProductRepository: Repository<SoldProduct>,

    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  async create(createDto: CreateAccountsholdingDto): Promise<AccountsHoldings> {
    const { customerId, userId, products, type, status } = createDto;
    
    // Determinar si la cuenta es holding basándose en el DTO
    const isHolding = type === OperationType.HOLDING;

    // Determinar el estatus basandonos en el DTO
    const isPartial = status === AccountHoldingStatus.PARTIAL
    
    // Validar existencia del cliente y usuario
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    
    // Obtener productos asociados al DTO
    const productEntities = await this.productRepository.findByIds(products.map(p => p.productId));
    if (productEntities.length !== products.length) throw new NotFoundException('One or more products not found');
    
    let totalAmount = 0;
    
    // Crear la cuenta por cobrar o apartado (Holding) usando el valor derivado
    const accountHolding = this.accountsHoldingsRepository.create({
      customer,
      user,
      date: new Date(),
      total: 0,  // Se actualizará más adelante
      paid: 0,   // Inicialmente 0
      toPay: 0,  // Se actualizará más adelante
      type: isHolding ? OperationType.HOLDING : OperationType.ACCOUNT,
      status: isPartial ? AccountHoldingStatus.PARTIAL: AccountHoldingStatus.PENDING,
    });
    
    // Guardar la cuenta
    await this.accountsHoldingsRepository.save(accountHolding);
    
    // Procesar cada producto
    for (const item of products) {
      const product = productEntities.find(p => p.id === item.productId);
      if (!product) continue;
    
      // Seleccionar el precio según el tipo de precio indicado en el producto (por ejemplo, 'sale')
      let price: number;
      switch (item.priceType) {
        case PriceType.SALE:
          price = product.salePrice;
          break;
        case PriceType.WHOLESALE:
          price = product.wholesalePrice;
          break;
        case PriceType.TOURIST:
          price = product.touristPrice;
          break;
        default:
          throw new BadRequestException(`Invalid price type: ${item.priceType}`);
      }
    
      if (isHolding) {
        // Para holding, no se descuenta el stock, solo se reserva
        product.reservedStock = (Number(product.reservedStock) || 0) + Number(item.quantity);
        await this.productRepository.save(product);
      } else {
        // Para account, se valida y se descuenta el stock
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ID ${product.id}`);
        }
    
        // Crear la relación de producto vendido
        const soldProduct = this.soldProductRepository.create({
          product,
          quantity: item.quantity,
          price, // Precio obtenido del producto
          priceWithouthIVA: price / 1.13, // Precio sin IVA (asumiendo 13%),
          iva: price - (price / 1.13), // IVA aplicado
          type: OperationType.ACCOUNT,
          accountHolding,
        });
    
        await this.soldProductRepository.save(soldProduct);
    
        // Actualizar el stock de los productos vendidos
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }
    
      // Acumular el total de la cuenta
      totalAmount += price * item.quantity;
    }
    
    // Actualizar el total y el saldo pendiente
    accountHolding.total = totalAmount;
    accountHolding.toPay = totalAmount;
    
    // Guardar la cuenta actualizada
    return this.accountsHoldingsRepository.save(accountHolding);
  }

  async finalizeAccountHolding(accountHoldingId: number): Promise<Sale> {
    const accountHolding = await this.accountsHoldingsRepository.findOne({
      where: { id: accountHoldingId },
      relations: ['customer', 'user', 'soldProducts'],
    });
  
    if (!accountHolding) {
      throw new NotFoundException(`AccountHolding with ID ${accountHoldingId} not found`);
    }
  
    // Verificar si la cuenta ya está completamente pagada
    if (accountHolding.toPay > 0) {
      throw new BadRequestException('The account is not fully paid yet.');
    }
  
    // Convertir la cuenta en una venta
    const sale = this.saleRepository.create({
      customer: accountHolding.customer,
      user: accountHolding.user,
      totalWithIVA: accountHolding.total,
      totalWithoutIVA: accountHolding.total / 1.13,
      totalIVA: accountHolding.total - (accountHolding.total / 1.13),
      paid: accountHolding.paid,
      date: moment().tz('America/El_Salvador').toDate(), // La fecha en que la cuenta se finaliza
    });
  
    const savedSale = await this.saleRepository.save(sale);
  
    // Asociar los productos vendidos
    for (const soldProduct of accountHolding.soldProducts) {
      soldProduct.saleId = savedSale.id;
      await this.soldProductRepository.save(soldProduct);
    }
  
    // Marcar la cuenta como finalizada
    accountHolding.status = AccountHoldingStatus.PAID;
    await this.accountsHoldingsRepository.save(accountHolding);
  
    return savedSale;
  }
  
  
    
  // Método para obtener todas las cuentas por cobrar o apartados
  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;
    const [data, total] = await this.accountsHoldingsRepository.findAndCount({
      take: Number(limit),
      skip: Number((page - 1)) * Number(limit),
      relations: ['customer', 'user', 'soldProducts', 'payments']
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

    
  }

  // Método para obtener una cuenta por cobrar o apartado por su ID
  async findOne(id: number): Promise<AccountsHoldings> {
    const account = await this.accountsHoldingsRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'soldProducts', 'payments'],
    });
    if (!account) throw new NotFoundException(`Account with ID ${id} not found`);
    return account;
  }

  async cancelReservation(id: number): Promise<AccountsHoldings> {
    // Buscar la cuenta por cobrar o apartado (holding) por su ID, incluyendo soldProducts (con sus productos) y payments
    const account = await this.accountsHoldingsRepository.findOne({
      where: { id },
      relations: ['soldProducts', 'soldProducts.product', 'payments'],
    });
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    if (account.type !== OperationType.HOLDING) {
      throw new BadRequestException('This account is not a holding (reservation)');
    }
    
    // Si existen pagos asociados, eliminarlos (esto puede variar según tu lógica de negocio)
    if (account.payments && account.payments.length > 0) {
      for (const payment of account.payments) {
        await this.paymentRepository.remove(payment);
      }
    }
    
    // Para cada producto reservado en la cuenta (soldProducts), restaurar el stock reservado
    if (account.soldProducts && account.soldProducts.length > 0) {
      for (const soldProduct of account.soldProducts) {
        if (soldProduct.product) {
          const product = soldProduct.product;
          // Restablecer el stock reservado: descontar la cantidad reservada en este soldProduct
          product.reservedStock = Math.max(0, Number(product.reservedStock) - Number(soldProduct.quantity));
          await this.productRepository.save(product);
        }
        // Eliminar la relación de este soldProduct
        await this.soldProductRepository.remove(soldProduct);
      }
    }
    
    // Finalmente, eliminar la cuenta (reservation)
    await this.accountsHoldingsRepository.remove(account);
    
    return account;
  }  
}
