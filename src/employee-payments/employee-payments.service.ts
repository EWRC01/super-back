import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { EmployeePayment } from './entities/employee-payment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateEmployeePaymentDto } from './dto/create-employee-payment.dto';

@Injectable()
export class EmployeePaymentsService {
  constructor(
    @InjectRepository(EmployeePayment)
    private readonly paymentsRepository: Repository<EmployeePayment>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async payEmployee(createPaymentDto: CreateEmployeePaymentDto): Promise<EmployeePayment> {
    const { employeeId, amount } = createPaymentDto;
  
    // Verificar si el empleado existe
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('El empleado no existe.');
    }
  
    // Obtener la fecha actual en la zona horaria de El Salvador
    const paymentDate = moment().tz('America/El_Salvador').toDate();
  
    // Obtener pagos previos del mismo mes y año
    const currentMonth = moment().tz('America/El_Salvador').month() + 1; // Mes en base 1
    const currentYear = moment().tz('America/El_Salvador').year();
  
    const previousPayments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.employeeId = :employeeId', { employeeId })
      .andWhere('MONTH(payment.paymentDate) = :month', { month: currentMonth })
      .andWhere('YEAR(payment.paymentDate) = :year', { year: currentYear })
      .getMany();
  
    // Calcular la sumatoria de pagos previos
    const totalPaid = previousPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  
    // Verificar que el pago total no supere el salario
    if (totalPaid + amount > employee.salary) {
      throw new BadRequestException(`El pago total del mes no puede superar el salario de $${employee.salary}. Actualmente ya ha recibido $${totalPaid}.`);
    }
  
    // Crear el pago
    const payment = this.paymentsRepository.create({
      employee,
      amount,
      paymentDate,
    });
  
    return await this.paymentsRepository.save(payment);
  }
  
  async getPayments(employeeId: number, month?: number, year?: number) {
    // Verificar si el empleado existe
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('El empleado no existe.');
    }

    // Construir la consulta con filtros opcionales
    let query = this.paymentsRepository.createQueryBuilder('payment')
      .where('payment.employeeId = :employeeId', { employeeId });

    if (month && year) {
      const startDate = moment.tz({ year, month: month - 1, day: 1 }, 'America/El_Salvador').startOf('month').toDate();
      const endDate = moment.tz({ year, month: month - 1, day: 1 }, 'America/El_Salvador').endOf('month').toDate();
      query = query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.orderBy('payment.paymentDate', 'DESC');

    // Obtener los pagos
    const payments = await query.getMany();

    // Calcular la sumatoria total de los pagos
    const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return { payments, totalPayments };
  }
}
