import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    { name: 'Customers' , description: 'Endpoints related to Customers' },
    { name: 'Brands', description: 'Endpoints related to Brands' },
    { name: 'Categories', description: 'Endpoints related to Categories' },
    { name: 'Products', description: 'Endpoints related to Products' },
    { name: 'Sales', description: 'Endpoints related to Sales' },
    { name: 'Quotes', description: 'Endpoints related to Quotes'},
    { name: 'Accounts-Holdings', description: 'Endpoints related to Account Holdings' },
    {name: 'Sold-Products', description: 'Endpoints related to Sold Products'},
  ];

  SwaggerModule.setup('api', app, document); // Configurar Swagger ANTES de app.listen()

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

