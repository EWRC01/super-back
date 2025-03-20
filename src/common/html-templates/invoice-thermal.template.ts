import { SaleInvoiceData } from "../interfaces/sale.interface";

// En tu archivo invoice.template.ts
export class ThermalInvoiceTemplate {
    private static readonly styles = `
      <style>
        @page { margin: 0; padding: 0; size: 80mm auto; }
        body { 
          font-family: 'Courier New', monospace;
          font-size: 10px;
          width: 76mm !important;
          margin: 2mm auto !important;
          line-height: 1.2;
        }
        .header { text-align: center; margin-bottom: 3px; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table td { padding: 1px 0; vertical-align: top; }
        .items-table td:nth-child(1) { width: 15% }
        .items-table td:nth-child(2) { width: 45% }
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) { width: 20%; text-align: right }
        .bold { font-weight: bold; }
        .qr-container { text-align: center; margin-top: 5px; }
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
        <div>
          <div>NIT: ${data.config.company.nit}</div>
          <div>NRC: ${data.config.company.nrc}</div>
          <div>Caja: ${data.sale.cashregister}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static saleDetails(data: SaleInvoiceData): string {
      return `
        <div>
          <div>Fecha: ${new Date(data.sale.date).toLocaleString('es-SV')}</div>
          <div>Factura: ${data.sale.id.toString().padStart(8, '0')}</div>
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
          ${data.sale.products.map(product => `
            <tr>
              <td>${product.quantity}</td>
              <td>${product.product.name}</td>
              <td class="right">$${product.price.toFixed(2)}</td>
              <td class="right">$${(product.price * product.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="divider"></div>
      `;
    }
  
    private static totalsSection(data: SaleInvoiceData): string {
      const change = data.sale.paid - data.sale.totalWithIVA;
      return `
        <div>
          <div>Subtotal: $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div>Total: $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div>Recibido: $${data.sale.paid.toFixed(2)}</div>
          <div class="bold">Cambio: $${change.toFixed(2)}</div>
        </div>
        <div class="divider"></div>
      `;
    }
  
    private static paymentInfo(data: SaleInvoiceData): string {
      return `
        <div class="qr-container">
          <img src="${data.config.qrImage}" width="80" height="80">
          <div>${data.config.qrData}</div>
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