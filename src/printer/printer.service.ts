import { Injectable, Logger } from '@nestjs/common';
import * as ThermalPrinter from 'node-thermal-printer';
import { PrinterTypes } from 'node-thermal-printer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/sales/entities/sale.entity';

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async printTicket(saleId: number): Promise<void> {
    // Buscar la venta con las relaciones adecuadas
    const sale = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.products', 'soldProduct')
      .leftJoinAndSelect('soldProduct.product', 'product')
      .where('sale.id = :saleId', { saleId })
      .getOne();

    if (!sale) {
      this.logger.error(`La venta con el ID ${saleId} no existe`);
      return;
    }

    const change = sale.paid - sale.totalWithIVA;

    // Configurar la impresora térmica
    const printer = new ThermalPrinter.printer({
      type: PrinterTypes.STAR, // Ajusta según tu modelo si es necesario
      interface: 'printer:USB001', // Cambia la IP según tu configuración
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: { timeout: 5000 },
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      this.logger.error('No se pudo conectar con la impresora térmica.');
      return;
    }

    // Imprimir encabezado
    printer.alignCenter();
    printer.bold(true);
    printer.println('Factura Electrónica');
    printer.println('MORALES LOPES, S.A. DE C.V.');
    printer.bold(false);
    printer.println('Sucursal: B028 - Ruta Militar, SM');
    printer.println('Dirección: Frente a Gasolinera PUMA');
    printer.println('San Miguel, El Salvador');
    printer.println('NIT: 0614-270912-101-5');
    printer.println('NRC: 2199924');
    printer.newLine();

    // Código de generación
    printer.println(`Código de Generación: ABC123456`);
    printer.println(`Fecha y Hora: ${sale.date}`);
    printer.newLine();

    // Datos del cliente
    printer.bold(true);
    printer.println(`Cliente: ${sale.customer?.name || 'No registrado'}`);
    printer.bold(false);
    printer.println(`Correlativo Interno: ${sale.id}`);
    printer.newLine();

    // Encabezado de productos
    printer.bold(true);
    printer.tableCustom([
      { text: 'Cant', align: 'LEFT', width: 0.2 },
      { text: 'Descripción', align: 'LEFT', width: 0.5 },
      { text: 'Precio', align: 'RIGHT', width: 0.15 },
      { text: 'Total', align: 'RIGHT', width: 0.15 },
    ]);
    printer.bold(false);

    // Listar productos
    sale.products.forEach((soldProduct) => {
      if (!soldProduct.product) {
        this.logger.warn(`El producto en soldProduct ID ${soldProduct.id} no está cargado.`);
        return;
      }
      printer.tableCustom([
        { text: soldProduct.quantity.toString(), align: 'LEFT', width: 0.2 },
        { text: soldProduct.product.name, align: 'LEFT', width: 0.5 },
        { text: `$${soldProduct.price.toFixed(2)}`, align: 'RIGHT', width: 0.15 },
        { text: `$${(soldProduct.price * soldProduct.quantity).toFixed(2)}`, align: 'RIGHT', width: 0.15 },
      ]);
    });

    // Totales
    printer.newLine();
    printer.bold(true);
    printer.println(`Subtotal: $${sale.totalWithIVA - sale.totalIVA}`);
    printer.println(`IVA: $${sale.totalIVA}`);
    printer.println(`Total: $${sale.totalWithIVA}`);
    printer.println(`Pago recibido: $${sale.paid}`);
    printer.println(`Cambio: $${change.toFixed(2)}`);
    printer.bold(false);
    printer.newLine();

    // Mensaje de agradecimiento
    printer.println('Gracias por su compra!');
    printer.println('Para cambios o devoluciones,');
    printer.println('presente este ticket dentro del periodo establecido.');
    printer.newLine();

    // Código QR (puedes usar un link de facturación o información de compra)
    printer.printQR('https://mifactura.com/validar/ABC123456', { cellSize: 6 });

    // Imprimir ticket
    const execute = await printer.execute();
    if (execute) {
      this.logger.log('✅ Ticket impreso correctamente.');
    } else {
      this.logger.error('❌ Error al imprimir el ticket.');
    }

    printer.cut();
  }
}
