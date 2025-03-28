import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  const configService = app.get(ConfigService)

  app.useStaticAssets(join(__dirname, '..', 'uploads')),

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:4000'), // Valor por defecto si no se provee
    methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    allowHeaders: 'Content-Type, Authorization',
    credentials: true
  });  // Para evitar problemas de CORS

  const config = new DocumentBuilder()
    .setTitle('Super API')
    .setDescription('Backend para super Tunas')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.tags = [
    { name: 'Users', description: 'Endpoints related to Users' },
    { name: 'Employees', description: 'Endpoints related to Employees' },
    { name: 'Employee-Payments', description: 'Endpoints related to Employee Payments' },
    { name: 'Cash-Register', description: 'Endpoints related to Cash Registers'},
    { name: 'Customers' , description: 'Endpoints related to Customers' },
    { name: 'Providers', description: 'Endpoints related to Providers'},
    { name: 'Brands', description: 'Endpoints related to Brands' },
    { name: 'Categories', description: 'Endpoints related to Categories' },
    { name: 'Products', description: 'Endpoints related to Products' },
    { name: 'Damaged Products', description: 'Endpoint related to damaged products'},
    { name: 'Sales', description: 'Endpoints related to Sales' },
    { name: 'Quotes', description: 'Endpoints related to Quotes'},
    { name: 'Sold-Products', description: 'Endpoints related to Sold Products'},
    { name: 'Tax', description: 'Endpoints related to IVA - Tax' },
    { name: 'Orders', description: 'Endpoints realated to Order' },
    { name: 'Order Details', description: 'Endpoints related to Order Details' },
    { name: 'Configuration', description: 'Endpoints related to configuration' }
  ];

  SwaggerModule.setup('api', app, document); // Configurar Swagger ANTES de app.listen()

  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();

