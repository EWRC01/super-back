import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { UsersModule } from './users/users.module';
import { SalesModule } from './sales/sales.module';
import { SoldproductsModule } from './soldproducts/soldproducts.module';
import { QuotationsModule } from './quotations/quotations.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationProductsModule } from './quotation-products/quotation-products.module';
import { CashRegisterModule } from './cash-register/cash-register.module';
import { TaxModule } from './tax/tax.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeePaymentsModule } from './employee-payments/employee-payments.module';
import { ProvidersModule } from './providers/providers.module';
import { OrdersModule } from './orders/orders.module';
import { OrderdetailsModule } from './orderdetails/orderdetails.module';
import { PrintModule } from './print/print.module';
import { DamagedProductsModule } from './damaged-products/damaged-products.module';
import { DiscountsModule } from './discounts/discounts.module';
import { BackupService } from './backup/backup.service';
import { BackupModule } from './backup/backup.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        extra: {
          decimalNumbers: true, // Forzar numeros
        }
      }),
      inject: [ConfigService],
    }),
    CategoriesModule, 
    BrandsModule, 
    ProductsModule, 
    CustomersModule, 
    UsersModule, 
    SalesModule, 
    SoldproductsModule, 
    QuotationsModule, 
    ConfigurationModule, 
    QuotationProductsModule, 
    CashRegisterModule, 
    TaxModule, EmployeesModule, EmployeePaymentsModule, ProvidersModule, OrdersModule, OrderdetailsModule, PrintModule, DamagedProductsModule, DiscountsModule, BackupModule
  ],
  controllers: [],
  providers: [BackupService],
})
export class AppModule {}
