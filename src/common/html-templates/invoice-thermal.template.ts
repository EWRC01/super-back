import { SaleInvoiceData } from "../interfaces/sale.interface";

// En tu archivo invoice.template.ts
export class ThermalInvoiceTemplate {
    private static readonly styles = `
      <style>
        @page { margin: 0; padding: 0; size: 80mm auto; }
        body { 
          font-family: 'Courier New', monospace;
          font-size: 18px;
          width: 76mm !important;
          margin: 2mm auto !important;
          line-height: 1.2;
        }
        .header { text-align: center; margin-bottom: 3px; font-size: 12px; margin-top: 10px; }
        .businessInfo { font-size: 12px; }
        .saleDetails { font-size: 12px; }
        .totalsSection { font-size: 14px; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table td { padding: 1px 0; vertical-align: top; }
        .items-table td:nth-child(1) { width: 15% }
        .items-table td:nth-child(2) { width: 45% }
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) { width: 20%; text-align: right }
        .bold { font-weight: bold; }
        .qr-container { text-align: center; margin-top: 5px; width: 100%; max-width: 76 mm; }
        .footer { text-align: center; margin-top: 8px;}
      </style>
    `;
  
    static generate(data: SaleInvoiceData): string {
      return `
        <html>
          <head>${this.styles}</head>
          <body>
            ${this.header(data)}
            ${this.businessInfo(data)}
            ${this.saleDetails(data)}
            ${this.itemsTable(data)}
            ${this.totalsSection(data)}
            ${this.paymentInfo(data)}
            ${this.footer()}
          </body>
        </html>
      `;
    }
  
    private static header(data: SaleInvoiceData): string {
      return `
        <div class="header bold">
          <div>${data.config.company.name}</div>
          <div>Sucursal: ${data.config.company.branch}</div>
          <div>${data.config.company.address}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static businessInfo(data: SaleInvoiceData): string {
      return `
        <div class="businessInfo bold">
          <div>NIT: ${data.config.company.nit}</div>
          <div>NRC: ${data.config.company.nrc}</div>
          <div>Caja: ${data.sale.cashregister}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static saleDetails(data: SaleInvoiceData): string {
      return `
        <div class="saleDetails bold">
          <div>Fecha y Hora: ${new Date(data.sale.date).toLocaleString('es-SV')}</div>
          <div>Factura: ${data.sale.id.toString().padStart(8, '0')}</div>
          <div>Tipo Doc: ${data.config.company.typeDoc}</div>
          <div>Cliente: ${data.sale.customer?.name || 'Consumidor Final'}</div>
          <div>Cajero: ${data.sale.user}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static itemsTable(data: SaleInvoiceData): string {
      return `
        <table class="items-table">
          <tr>
            <td><strong>Cant.</strong></td>
            <td><strong>Descripción</strong></td>
            <td class="right"><strong>P.Unit</strong></td>
            <td class="right"><strong>Total</strong></td>
          </tr>
          ${data.sale.products.map(product => {
            const totalSinDescuento = product.product.unitPrice * product.quantity;
            const totalConDescuento = product.price;
    
            return `
              <tr>
                <td>${product.quantity}</td>
                <td>${product.product.name}</td>
                <td class="right">$${product.product.unitPrice.toFixed(2)}</td>
                <td class="right">$${totalSinDescuento.toFixed(2)}</td>
              </tr>
              ${product.discountAmount > 0 ? `
                <tr class="discount-row">
                  <td></td>
                  <td>↳ Descuento aplicado</td>
                  <td class="right"></td>
                  <td class="right">-$${product.discountAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td colspan="3"></td>
                <td class="right"><strong>$${totalConDescuento.toFixed(2)}</strong></td>
              </tr>
            `;
          }).join('')}
        </table>
      `;
    }
  
    private static totalsSection(data: SaleInvoiceData): string {
      const change = data.sale.paid - data.sale.totalWithIVA;
      const subTotal = data.sale.totalWithIVA + data.sale.totalDiscounts;
      return `
        <div class="totalsSection bold">
          <div>Subtotal: $${subTotal.toFixed(2)}</div>
          <div>Dto. Total: $${data.sale.totalDiscounts.toFixed(2)}</div>
          <div>Total: $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div>Recibido: $${data.sale.paid.toFixed(2)}</div>
          <div class="bold">Cambio: $${change.toFixed(2)}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static paymentInfo(data: SaleInvoiceData): string {

      // Dividir el string en multiples lineas
       // Parsear el JSON y formatear en líneas
  let qrLines = [];
  try {
    const qrData = JSON.parse(data.config.qrData);
    qrLines = [
      `Factura: ${qrData.saleId}`,
      `Total: $${qrData.total.toFixed(2)}`,
      `Fecha: ${new Date(qrData.date).toLocaleDateString('es-SV')}`
    ];
  } catch (e) {
    // Si falla el parseo, mostrar el texto original dividido
    qrLines = data.config.qrData.split(',').map(item => item.trim());
  }
      return `
        <div class="qr-container">
          <img src="${data.config.qrImage}" width="120" height="120">
          <div>${qrLines.map(line => `<div>${line}</div>`).join('')}</div>
        </div>
      `;
    }
  
    private static footer(): string {
      return `
        <div class="footer">
          <div>Gracias por su compra!</div>
        </div>
      `;
    }
  }