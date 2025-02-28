import { Module } from '@nestjs/common';
import { EmployeePaymentsService } from './employee-payments.service';
import { EmployeePaymentsController } from './employee-payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePayment } from './entities/employee-payment.entity';
import { Employee } from 'src/employees/entities/employee.entity';


@Module({
  imports: [TypeOrmModule.forFeature([EmployeePayment, Employee])],
  controllers: [EmployeePaymentsController],
  providers: [EmployeePaymentsService],
})
export class EmployeePaymentsModule {}
