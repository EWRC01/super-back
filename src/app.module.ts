import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { UsersModule } from './users/users.module';
import { SalesModule } from './sales/sales.module';
import { AccountsholdingsModule } from './accountsholdings/accountsholdings.module';
import { SoldproductsModule } from './soldproducts/soldproducts.module';
import { QuotationsModule } from './quotations/quotations.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from './payments/payments.module';
import { QuotationProductsModule } from './quotation-products/quotation-products.module';
import { CashRegisterModule } from './cash-register/cash-register.module';

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
        logging: false
      }),
      inject: [ConfigService],
    }),
    CategoriesModule, 
    BrandsModule, 
    ProductsModule, 
    CustomersModule, 
    UsersModule, 
    SalesModule, 
    AccountsholdingsModule, 
    SoldproductsModule, 
    QuotationsModule, 
    ConfigurationModule, PaymentsModule, QuotationProductsModule, CashRegisterModule
  ],
})
export class AppModule {}
