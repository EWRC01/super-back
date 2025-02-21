import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity'; // Asegúrate de importar la entidad Sale
import { User } from 'src/users/entities/user.entity'; // Asegúrate de importar la entidad User
import * as moment from 'moment-timezone';
import { Payment } from 'src/payments/entities/payment.entity';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectRepository(CashRegister)
    private cashRegisterRepository: Repository<CashRegister>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async closeCashRegister(userId: number, cashInHand: number): Promise<CashRegister> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    const timezone = 'America/El_Salvador';
  
    const todayStart = moment().tz(timezone).startOf('day').toDate();
    const todayEnd = moment().tz(timezone).endOf('day').toDate();
  
    // Calcular el total de ventas del día
    const salesResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalSales')
      .where('sale.date BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .getRawOne();
  
    const totalSales = parseFloat(salesResult.totalSales) || 0;
  
    // Calcular el total de pagos del día (incluye reservas y fiados)
    const paymentsResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalPayments')
      .where('payment.date BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .getRawOne();
  
    const totalPayments = parseFloat(paymentsResult.totalPayments) || 0;
  
    // Efectivo esperado en caja = total de ventas + total de pagos
    const expectedCash = totalSales + totalPayments;
    const discrepancy = cashInHand - expectedCash;
  
    // Crear el registro de corte de caja
    const cashRegister = new CashRegister();
    cashRegister.date = new Date();
    cashRegister.cashInHand = cashInHand;
    cashRegister.totalSales = totalSales;
    cashRegister.totalPayments = totalPayments;
    cashRegister.expectedCash = expectedCash;
    cashRegister.discrepancy = discrepancy;
    cashRegister.user = { id: userId } as User;
  
    return this.cashRegisterRepository.save(cashRegister);
  }
  

  async find(): Promise<CashRegister[]> {
    return this.cashRegisterRepository.find(
      {relations: ['user']}
    );
  }
}