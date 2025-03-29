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

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);
  private readonly companyConfig = {
    name: 'SUPER CAMPOS',
    branch: 'FRENTE A LOMAS TURBAS',
    address: 'SUCURSAL LAS TUNAS',
    nit: '0000-000000-000-0',
    nrc: '0000000',
  };

  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  private mapToInvoiceData(sale: Sale): SaleInvoiceData {
    return {
      sale: {
        id: sale.id,
        date: sale.date,
        user: sale.user?.name || 'Sistema',
        cashregister: 1,
        totalWithIVA: sale.totalWithIVA,
        totalDiscounts: sale.totalDiscount,
        paid: sale.paid,
        customer: sale.customer ? { name: sale.customer.name } : undefined,
        products: sale.products.map((p) => ({
          discountAmount: p.discountAmount,
          quantity: p.quantity,
          price: p.price,
          product: { name: p.product.name },
        })),
      },
      config: {
        company: this.companyConfig,
        qrData: JSON.stringify({
            saleId: sale.id,
            total: sale.totalWithIVA,
            date: sale.date.toISOString()
        }),
        qrImage: '' // Se generara despues
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
      
      // Configuración específica para formato térmico
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
  
      const pdfBuffer = await page.pdf({
        width: '80mm',          // Ancho exacto para 80mm
        height: '210mm',         // Altura automática según contenido
        printBackground: true,  // Necesario para bordes/QR
        scale: 0.75,            // Reduce escala para mejor ajuste
        margin: {
          top: '5mm',
          right: '2mm',
          bottom: '5mm',
          left: '2mm'
        },
        pageRanges: '1'         // Fuerza una sola página
      });
  
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
   
}
