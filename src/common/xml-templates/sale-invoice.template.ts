import { create } from 'xmlbuilder2';
import { SaleInvoiceData } from '../interfaces/sale.interface';
import { NumberToWords } from '../utils/number-to-word.util';
import { DateUtils } from '../utils/date.util';

export class SaleInvoiceTemplate {
  static generate(data: SaleInvoiceData): string {
    const { sale, config } = data;
    const change = sale.paid - sale.totalWithIVA;

    return create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Factura', { xmlns: 'https://codemark.es/' })
      .import(SaleInvoiceTemplate.buildHeader(config))
      .import(SaleInvoiceTemplate.buildGeneralData(sale))
      .import(SaleInvoiceTemplate.buildProducts(sale))
      .import(SaleInvoiceTemplate.buildTotals(sale, change))
      .import(SaleInvoiceTemplate.buildFooter(config))
      .end({ prettyPrint: true });
  }

  private static buildHeader(config: SaleInvoiceData['config']) {
    return create()
      .ele('Encabezado')
        .ele('Titulo').txt('Factura Consumidor Final').up()
        .ele('Empresa').txt(config.company.name).up()
        .ele('Sucursal').txt(config.company.branch).up()
        .ele('Direccion').txt(config.company.address).up()
        .ele('NIT').txt(config.company.nit).up()
        .ele('NRC').txt(config.company.nrc).up()
      .up();
  }

  private static buildGeneralData(sale: SaleInvoiceData['sale']) {
    return create()
      .ele('DatosGenerales')
        .ele('Cliente').txt(sale.customer?.name || 'Consumidor Final').up()
        .ele('Cajero').txt(sale.user).up()
        .ele('Caja').txt('1').up()
        .ele('FechaEmision').txt(DateUtils.formatForInvoice(sale.date)).up()
        .ele('Correlativo').txt(sale.id.toString()).up()
      .up();
  }

  private static buildProducts(sale: SaleInvoiceData['sale']) {
    const root = create().ele('Productos');
    
    sale.products.forEach(product => {
      root.ele('Producto')
        .ele('Cantidad').txt(product.quantity.toString()).up()
        .ele('Descripcion').txt(product.product.name).up()
        .ele('PrecioUnitario').txt(`$${product.price.toFixed(2)}`).up()
        .ele('Total').txt(`$${(product.price * product.quantity).toFixed(2)}`).up()
      .up();
    });
    
    return root;
  }

  private static buildTotals(sale: SaleInvoiceData['sale'], change: number) {
    return create()
      .ele('Totales')
        .ele('Subtotal').txt(`$${(sale.totalWithIVA).toFixed(2)}`).up()
        .ele('Total').txt(`$${sale.totalWithIVA.toFixed(2)}`).up()
        .ele('PagoRecibido').txt(`$${sale.paid.toFixed(2)}`).up()
        .ele('Cambio').txt(`$${change.toFixed(2)}`).up()
        .ele('Son').txt(NumberToWords.convert(sale.totalWithIVA)).up()
      .up();
  }

  private static buildFooter(config: SaleInvoiceData['config']) {
    return create()
      .ele('PieFactura')
        .ele('Mensaje').txt('Gracias por su compra!').up()
        .ele('QR').txt(config.qrData).up()
      .up();
  }
}