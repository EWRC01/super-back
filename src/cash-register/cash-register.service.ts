import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity'; // Asegúrate de importar la entidad Sale
import { User } from 'src/users/entities/user.entity'; // Asegúrate de importar la entidad User
import * as moment from 'moment-timezone';
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
  ) {}


  async openCashRegister(userId: number, openCashRegisterDto: OpenCashRegisterDto): Promise<CashRegister> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    const timezone = 'America/El_Salvador';
    const currentDate = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  
    const { initialCash } = openCashRegisterDto;
  
    // Definir el inicio y fin del día actual
    const todayStart = moment().tz(timezone).startOf('day').toDate();
    const todayEnd = moment().tz(timezone).endOf('day').toDate();
  
    // Obtener la última caja cerrada del mismo día y usuario
    const lastClosedCashRegister = await this.cashRegisterRepository.findOne({
      where: {
        state: StateCashRegister.CLOSED,
        user: { id: userId },
        date: Between(todayStart, todayEnd),
      },
      order: { date: 'DESC' },
    });
  
    // Solo se toma el expectedCash si la caja cerrada es del mismo día
    const previousExpectedCash = lastClosedCashRegister ? lastClosedCashRegister.expectedCash : 0;
  
    const cashRegister = new CashRegister();
    cashRegister.date = currentDate as unknown as Date;
    cashRegister.cashInHand = previousExpectedCash + initialCash; // Se suma solo si es del mismo día
    cashRegister.totalSales = 0;
    cashRegister.expectedCash = previousExpectedCash + initialCash;
    cashRegister.discrepancy = 0;
    cashRegister.state = StateCashRegister.OPEN;
    cashRegister.user = { id: userId } as User;
    cashRegister.previousCashRegisterId = lastClosedCashRegister ? lastClosedCashRegister.id : null;
  
    return this.cashRegisterRepository.save(cashRegister);
  }
  
  

  async closeCashRegister(userId: number, cashInHand: number): Promise<CashRegister> {
    const timezone = 'America/El_Salvador';
    const currentDate = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Obtener la última caja abierta del usuario
    const lastOpenedCashRegister = await this.cashRegisterRepository.findOne({
      where: { user: { id: userId }, state: StateCashRegister.OPEN },
      order: { date: 'DESC' },
    });
    if (!lastOpenedCashRegister) {
      throw new HttpException('No open cash register found', HttpStatus.BAD_REQUEST);
    }
  
    // Definir el inicio y fin del día de apertura de la caja abierta
    // Esto garantiza que solo se tomen en cuenta ventas del mismo día en que se abrió la caja
    const openMoment = moment(lastOpenedCashRegister.date).tz(timezone);
    const todayStart = openMoment.clone().startOf('day').toDate();
    const todayEnd = openMoment.clone().endOf('day').toDate();
  
    // Consultar las ventas dentro del rango del día en que se abrió la caja
    const salesResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalSales')
      .where('sale.date BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .getRawOne();
    const totalSales = parseFloat(salesResult.totalSales) || 0;
  
    // Calcular el efectivo esperado tomando el efectivo inicial de la caja abierta + ventas del día
    const expectedCash = lastOpenedCashRegister.cashInHand + totalSales;
    const discrepancy = cashInHand - expectedCash;
  
    const cashRegister = new CashRegister();
    cashRegister.date = currentDate as unknown as Date;
    cashRegister.cashInHand = cashInHand;
    cashRegister.totalSales = totalSales;
    cashRegister.expectedCash = expectedCash;
    cashRegister.discrepancy = discrepancy;
    cashRegister.state = StateCashRegister.CLOSED;
    cashRegister.user = { id: userId } as User;
    cashRegister.previousCashRegisterId = lastOpenedCashRegister.id;
  
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