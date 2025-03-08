import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity'; // Asegúrate de importar la entidad Sale
import { User } from 'src/users/entities/user.entity'; // Asegúrate de importar la entidad User
import * as moment from 'moment-timezone';
import { Payment } from 'src/payments/entities/payment.entity';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { StateCashRegister } from 'src/common/enums/cash-register-state.enum';

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


  async openCashRegister(userId: number, openCashRegisterDto: OpenCashRegisterDto): Promise<CashRegister> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    const timezone = 'America/El_Salvador';
    const currentDate = moment().tz(timezone).toDate(); // Obtener la fecha con la zona horaria correcta
  
    const { initialCash } = openCashRegisterDto;
  
    const cashRegister = new CashRegister();
    cashRegister.date = currentDate; // Fecha con zona horaria
    cashRegister.cashInHand = initialCash;
    cashRegister.totalSales = 0;
    cashRegister.totalPayments = 0;
    cashRegister.expectedCash = 0;
    cashRegister.discrepancy = 0;
    cashRegister.state = StateCashRegister.OPEN;
    cashRegister.user = { id: userId } as User;
  
    return this.cashRegisterRepository.save(cashRegister);
  }

  async closeCashRegister(userId: number, cashInHand: number): Promise<CashRegister> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    const timezone = 'America/El_Salvador';
  
    const todayStart = moment().tz(timezone).startOf('day').toDate();
    const todayEnd = moment().tz(timezone).endOf('day').toDate();
  
    // Calcular el total de pagos recibidos en el día
    const paymentsResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalPayments')
      .where('payment.date BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .getRawOne();
  
    const totalPayments = parseFloat(paymentsResult.totalPayments) || 0;
  
    // Obtener el total de ventas en efectivo del día
    const salesResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalSales')
      .where('sale.date BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .getRawOne();
  
    const totalSales = parseFloat(salesResult.totalSales) || 0;
  
    // Calcular el efectivo esperado en caja
    const expectedCash = totalSales + totalPayments;
  
    // Validar que el efectivo en caja coincida
    if (cashInHand !== expectedCash) {
      throw new BadRequestException(`Cash in hand (${cashInHand}) does not match expected cash (${expectedCash}).`);
    }
  
    // Registrar el cierre de caja
    const cashRegister = this.cashRegisterRepository.create({
      user,
      totalSales,
      totalPayments,
      cashInHand,
      date: new Date(),
    });
  
    return this.cashRegisterRepository.save(cashRegister);
  }
  

  // Mostrar todos los registros de caja
  
  async find(): Promise<CashRegister[]> {
    return this.cashRegisterRepository.find(
      {relations: ['user']}
    );
  }

  async findByUserandDate(userId: number, dateString: string) {
    const userFind = await this.userRepository.findOne({ where: { id: userId }});
  
    if (!userFind) { 
      throw new HttpException(`Usuario no encontrado`, HttpStatus.NOT_FOUND);
    }
  
    // 1. Definir la zona horaria (ej: 'America/Mexico_City')
    const timezone = 'America/El_Salvador';
    
    // 2. Parsear la fecha con moment-timezone
    const date = moment.tz(dateString, timezone);
    
    // 3. Validar fecha
    if (!date.isValid()) {
      throw new HttpException('Formato de fecha inválido', HttpStatus.BAD_REQUEST);
    }
  
    // 4. Obtener límites del día
    const startOfDay = date.startOf('day').toDate(); // 2025-02-20 00:00:00 en TZ
    const endOfDay = date.endOf('day').toDate(); // 2025-02-20 23:59:59 en TZ
  
    // 5. Buscar registros en el rango
    return this.cashRegisterRepository.find({
      where: {
        user: { id: userId },
        date: Between(startOfDay, endOfDay)
      },
      relations: ['user']
    });
  }
}