// src/common/html-templates/invoice.template.ts

import { SaleInvoiceData } from "../interfaces/sale.interface";
import { NumberToWords } from "../utils/number-to-word.util";

export class InvoiceHTMLTemplate {
    private static readonly styles = `
      <style>
        body { 
          font-family: Arial, sans-serif;
          width: 210mm;
          margin: 20px auto;
          padding: 20px;
          line-height: 1.5;
        }
        .header { text-align: center; margin-bottom: 15px; }
        .title { font-size: 24px; font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .items-table { 
          width: 100%; 
          border-collapse: collapse;
          margin: 10px 0;
        }
        .items-table th, 
        .items-table td { 
          padding: 5px;
          vertical-align: top;
        }
        .items-table th {
          text-align: left;
          border-bottom: 1px solid #000;
        }
        .items-table td:nth-child(1) { width: 10% }
        .items-table td:nth-child(2) { width: 50% }
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) { width: 20%; text-align: right }
        .bold { font-weight: bold; }
        .qr-container { 
          text-align: center; 
          margin-top: 15px;
          width: 100%;
        }
        .footer { text-align: center; margin-top: 15px; }
        .totals-section { 
          margin-top: 10px;
          float: right;
          width: 300px;
        }
        .discount-row td {
          font-size: 0.9em;
          color: #666;
        }
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
        <div class="header">
          <div class="title">${data.config.company.name}</div>
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
        <div class="totals-section">
          <div>Subtotal: $${subTotal.toFixed(2)}</div>
          <div>Dto. Total: $${data.sale.totalDiscounts.toFixed(2)}</div>
          <div>Total: $${data.sale.totalWithIVA.toFixed(2)}</div>
          <div>Recibido: $${data.sale.paid.toFixed(2)}</div>
          <div class="bold">Cambio: $${change.toFixed(2)}</div>
          <div class="bold">${NumberToWords.convert(data.sale.totalWithIVA)}</div>
        </div>
        <div style="clear: both;"></div>
        <div class="divider"></div>
      `;
    }
  
    private static paymentInfo(data: SaleInvoiceData): string {
      // Dividir el string en multiples lineas
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
          <img src="${data.config.qrImage}" width="150" height="150">
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