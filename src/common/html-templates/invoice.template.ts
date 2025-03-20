// src/common/html-templates/invoice.template.ts

import { SaleInvoiceData } from "../interfaces/sale.interface";
import { NumberToWords } from "../utils/number-to-word.util";

export class InvoiceHTMLTemplate {
    private static readonly styles = `
      <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; }
        .company-info { margin: 10px 0; }
        .details-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        .details-table th, 
        .details-table td { 
          border: 1px solid #ddd; 
          padding: 8px; 
        }
        .totals-section { 
          margin-top: 20px; 
          float: right; 
          width: 300px; 
        }
        .qr-code { 
          text-align: center; 
          margin-top: 30px; 
        }
        .client-info {
          margin-bottom: 15px;
          line-height: 1.6;
        }
      </style>
    `;
  
    static generate(data: SaleInvoiceData): string {
      return `
        <html>
          <head>
            ${this.styles}
          </head>
          <body>
            ${this.header(data)}
            ${this.clientInfo(data)}
            ${this.productsTable(data)}
            ${this.totalsSection(data)}
            ${this.qrSection(data)}
          </body>
        </html>
      `;
    }
  
    private static header(data: SaleInvoiceData): string {
      return `
        <div class="header">
          <div class="title">${data.config.company.name}</div>
          <div class="company-info">
            ${data.config.company.address}<br>
            NIT: ${data.config.company.nit} | NRC: ${data.config.company.nrc}
          </div>
        </div>
        <h2>Factura Consumidor Final</h2>
      `;
    }
  
    private static clientInfo(data: SaleInvoiceData): string {
      return `
        <div class="client-info">
          <strong>Cliente:</strong> ${data.sale.customer?.name || 'Consumidor Final'}<br>
          <strong>Fecha:</strong> ${new Date(data.sale.date).toLocaleDateString('es-SV')}<br>
          <strong>Cajero:</strong> ${data.sale.user}<br>
          <strong>Caja:</strong> ${data.sale.cashregister}
        </div>
      `;
    }
  
    private static productsTable(data: SaleInvoiceData): string {
      return `
        <table class="details-table">
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Descripción</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.sale.products.map(product => `
              <tr>
                <td>${product.quantity}</td>
                <td>${product.product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>$${(product.price * product.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  
    private static totalsSection(data: SaleInvoiceData): string {
      return `
        <div class="totals-section">
          <div><strong>Subtotal:</strong> $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div><strong>Total:</strong> $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div><strong>Pago Recibido:</strong> $${data.sale.paid.toFixed(2)}</div>
          <div><strong>Cambio:</strong> $${(data.sale.paid - data.sale.totalWithIVA).toFixed(2)}</div>
          <div><strong>${NumberToWords.convert(data.sale.totalWithIVA)}</strong></div>
        </div>
      `;
    }
  
    private static qrSection(data: SaleInvoiceData): string {
      return `
        <div class="qr-code">
          <img src="${data.config.qrImage}" width="100" height="100">
          <p>Ver Detalles: ${data.config.qrData}</p>
        </div>
      `;
    }
  }