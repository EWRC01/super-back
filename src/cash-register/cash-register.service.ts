import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity'; // Asegúrate de importar la entidad Sale
import { User } from 'src/users/entities/user.entity'; // Asegúrate de importar la entidad User
import * as moment from 'moment-timezone';

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

  async closeCashRegister(userId: number, cashInHand: number): Promise<CashRegister> {

    const user = await this.userRepository.findOne({where: {id: userId}});

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const timezone = 'America/El_Salvador'; // Zona horaria
  
    // Obtener el inicio y el fin del día en la zona horaria especificada
    const todayStart = moment().tz(timezone).startOf('day').toDate();
    const todayEnd = moment().tz(timezone).endOf('day').toDate();
  
    // Calcular el total de ventas del día
    const salesResult = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalSales')
      .where('sale.date >= :todayStart AND sale.date <= :todayEnd', { todayStart, todayEnd })
      .getRawOne();
  
    const totalSales = parseFloat(salesResult.totalSales) || 0;
  
    // Calcular la discrepancia
    const expectedCash = totalSales; // Efectivo esperado en caja
    const discrepancy = cashInHand - expectedCash; // Diferencia entre efectivo en caja y efectivo esperado
  
    // Crear el registro de corte de caja
    const cashRegister = new CashRegister();
    cashRegister.date = new Date();
    cashRegister.cashInHand = cashInHand;
    cashRegister.totalSales = totalSales;
    cashRegister.expectedCash = expectedCash;
    cashRegister.discrepancy = discrepancy;
    cashRegister.user = { id: userId } as User; // Asignar el usuario
  
    // Guardar el registro en la base de datos
    return this.cashRegisterRepository.save(cashRegister);
  }

  async find(): Promise<CashRegister[]> {
    return this.cashRegisterRepository.find(
      {relations: ['user']}
    );
  }
}