import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads')),

  app.enableCors({
    origin: 'http://localhost:4000',
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
    {name: 'Cash-Register', description: 'Endpoints related to Cash Registers'},
    { name: 'Customers' , description: 'Endpoints related to Customers' },
    { name: 'Brands', description: 'Endpoints related to Brands' },
    { name: 'Categories', description: 'Endpoints related to Categories' },
    { name: 'Products', description: 'Endpoints related to Products' },
    { name: 'Sales', description: 'Endpoints related to Sales' },
    { name: 'Quotes', description: 'Endpoints related to Quotes'},
    { name: 'Accounts-Holdings', description: 'Endpoints related to Account Holdings' },
    { name: 'Payments', description: 'Endpoints related to Payments' },
    {name: 'Sold-Products', description: 'Endpoints related to Sold Products'},
  ];

  SwaggerModule.setup('api', app, document); // Configurar Swagger ANTES de app.listen()

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

