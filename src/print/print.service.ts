import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { SaleInvoiceTemplate } from '../common/xml-templates/sale-invoice.template';
import { SaleInvoiceData } from '../common/interfaces/sale.interface';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { NumberToWords } from 'src/common/utils/number-to-word.util';
import * as QRCode from 'qrcode';
import { InvoiceHTMLTemplate } from 'src/common/html-templates/invoice.template';
import { ThermalInvoiceTemplate } from 'src/common/html-templates/invoice-thermal.template';
import { ConfigService } from '@nestjs/config';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly configService: ConfigService, // Inyecta ConfigService
  ) {}

  private get companyConfig() {
    return {
      name: this.configService.get<string>('COMPANY_NAME'),
      branch: this.configService.get<string>('COMPANY_BRANCH'),
      address: this.configService.get<string>('COMPANY_ADDRESS'),
      nit: this.configService.get<string>('COMPANY_NIT'),
      nrc: this.configService.get<string>('COMPANY_NRC'),
      typeDoc: this.configService.get<string>('COMPANY_DOC_TYPE'),
      cashRegister: this.configService.get<number>('ID_CASH_REGISTER')
    };
  }

  private mapToInvoiceData(sale: Sale): SaleInvoiceData {
    return {
      sale: {
        id: sale.id,
        date: sale.date,
        user: sale.user?.name || 'Sistema',
        cashregister: this.companyConfig.cashRegister,
        totalWithIVA: sale.totalWithIVA,
        totalDiscounts: sale.totalDiscount,
        paid: sale.paid,
        customer: sale.customer ? { name: sale.customer.name } : undefined,
        products: sale.products.map((p) => ({
          discountAmount: p.discountAmount,
          quantity: p.quantity,
          price: p.price,
          product: { 
            name: p.product.name,
            unitPrice: (p.price + p.discountAmount) / p.quantity
           },
        })),
      },
      config: {
        company: this.companyConfig,
        qrData: JSON.stringify({
          saleId: sale.id,
          total: sale.totalWithIVA,
          date: sale.date.toISOString()
        }),
        qrImage: '' // Se generará después
      },
    };
  }

  async generateSaleXML(saleId: number): Promise<string> {
    const sale = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.products', 'soldProduct')
      .leftJoinAndSelect('soldProduct.product', 'product')
      .where('sale.id = :saleId', { saleId })
      .getOne();

    if (!sale) {
      this.logger.error(`Venta con ID ${saleId} no encontrada`);
      throw new Error('Venta no encontrada');
    }

    return SaleInvoiceTemplate.generate(this.mapToInvoiceData(sale));
  }

  private async generateQRCode(saleData: SaleInvoiceData['sale']): Promise<string> {

    try {
        return await QRCode.toDataURL(
            JSON.stringify({
                saleId: saleData.id,
                total: saleData.totalWithIVA,
                date: saleData.date.toISOString(),
                customer: saleData.customer?.name || 'Consumidor Final'
              }),
              { errorCorrectionLevel: 'H'} // Para mejor legibilidad
        );
  } catch (err) {
    this.logger.error('Error QR Code:', err.stack) 
    return 'data:image/png;base64,iVBORw0KG...';
  }
}
  
  async generateSalePDF(saleId: number): Promise<Buffer> {
    const sale = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.products', 'soldProduct')
      .leftJoinAndSelect('soldProduct.product', 'product')
      .where('sale.id = :saleId', { saleId })
      .getOne();

    if (!sale) {
      this.logger.error(`Venta con ID ${saleId} no encontrada`);
      throw new Error('Venta no encontrada');
    }

    const invoiceData = this.mapToInvoiceData(sale);

    invoiceData.config.qrImage = await this.generateQRCode(invoiceData.sale);

    const htmlContent = await this.generateHTMLInvoice(invoiceData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
  
  private async generateHTMLInvoice(data: SaleInvoiceData): Promise<string> {

    return InvoiceHTMLTemplate.generate(data);
  }

  async generateThermalPdf(saleId: number): Promise<Buffer> {
    const sale = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.user', 'user')
      .leftJoinAndSelect('sale.products', 'soldProduct')
      .leftJoinAndSelect('soldProduct.product', 'product')
      .where('sale.id = :saleId', { saleId })
      .getOne();

    if (!sale) {
      this.logger.error(`Venta con ID ${saleId} no encontrada`);
      throw new Error('Venta no encontrada');
    }

    const invoiceData = this.mapToInvoiceData(sale);
    invoiceData.config.qrImage = await this.generateQRCode(invoiceData.sale);
    
    const htmlContent = ThermalInvoiceTemplate.generate(invoiceData);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Configurar el viewport para coincidir con el ancho térmico
      await page.setViewport({ width: 800, height: 600 });
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Calcular la altura completa del documento incluyendo footer
      const fullHeight = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const footer = document.querySelector('.footer') || body;
        
        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight,
          footer.getBoundingClientRect().bottom
        );
      });

      // Convertir pixeles a milímetros (1mm ≈ 3.78px)
      const heightInMM = Math.ceil(fullHeight / 3.78) + 5; // Margen adicional

      const pdfBuffer = await page.pdf({
        width: '80mm',          // Ancho fijo para impresora térmica
        height: `${heightInMM}mm`, // Altura calculada dinámicamente
        printBackground: true,
        margin: {
          top: '2mm',
          right: '2mm',
          bottom: '5mm', // Margen mayor en la parte inferior
          left: '2mm'
        },
        pageRanges: '1'
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

   
}
