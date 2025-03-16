import { Injectable, Logger } from '@nestjs/common';
import * as ThermalPrinter from 'node-thermal-printer';
import { PrinterTypes } from 'node-thermal-printer';

@Injectable()
export class PrinterService {
    private printer: any;
    private readonly logger = new Logger(PrinterService.name);
    private readonly IVA_RATE = 0.13; // 13% IVA

    constructor() {
        try {
            this.printer = new ThermalPrinter.printer({
                type: PrinterTypes.EPSON,
                interface: 'tcp://192.168.0.28',
                removeSpecialCharacters: false,
            });
        } catch (error) {
            this.logger.error(`Error al inicializar la impresora: ${error.message}`, error.stack);
            throw new Error('Error al inicializar la impresora');
        }
    }

    private calculateSubtotal(products: any[]): number {
        return products.reduce((total, product) => {
            const priceWithoutIva = product.price / (1 + this.IVA_RATE);
            return total + product.quantity * priceWithoutIva;
        }, 0);
    }

    private calculateIva(subtotal: number): number {
        return subtotal * this.IVA_RATE;
    }

    private calculateTotal(subtotal: number, iva: number): number {
        return subtotal + iva;
    }

    async printTicket(data: any): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const { shop, date, products, cash} = data;
                const subtotal = this.calculateSubtotal(products);
                const iva = this.calculateIva(subtotal);
                const total = this.calculateTotal(subtotal, iva);
                const change = cash >= total ? cash - total : 0;

                this.printer.alignCenter();
                this.printer.println(shop.name);
                this.printer.println(shop.address);
                this.printer.println(`Fecha: ${date}`);
                this.printer.drawLine();
                this.printer.alignLeft();
                this.printer.println('DESCRIPCIÓN          CANT.    PRECIO');
                products.forEach((product: any) => {
                    const priceWithoutIva = product.price / (1 + this.IVA_RATE);
                    const descriptionLines = this.splitDescription(product.description, 20);
                    descriptionLines.forEach((line, index) => {
                        if (index === 0) {
                            this.printer.println(`${line.padEnd(20)} ${product.quantity.toString().padStart(4)} ${priceWithoutIva.toFixed(2).padStart(8)}`);
                        } else {
                            this.printer.println(`${line}`);
                        }
                    });
                });

                this.printer.drawLine();
                this.printer.println(`Efectivo: $${cash.toFixed(2).padStart(10)}`);
                this.printer.println(`Cambio:   $${change.toFixed(2).padStart(10)}`);
                this.printer.drawLine();
                this.printer.println(`Subtotal: $${subtotal.toFixed(2).padStart(10)}`);
                this.printer.println(`IVA (13%): $${iva.toFixed(2).padStart(10)}`);
                this.printer.println(`TOTAL:    $${total.toFixed(2).padStart(10)}`);
                this.printer.drawLine();
                this.printer.alignCenter();
                this.printer.bold(true); 
                this.printer.println('¡Gracias por su compra!');
                this.printer.bold(false); 
                this.printer.printQR('https://codemark.es/');

                this.printer.cut();
                this.printer.execute()
                    .then(() => resolve('Impresión completada.'))
                    .catch((err: any) => {
                        this.logger.error(`Error al imprimir: ${err.message}`, err.stack);
                        reject('Error al imprimir: ' + err);
                    });
            } catch (err) {
                this.logger.error(`Error al procesar el ticket: ${err.message}`, err.stack);
                reject('Error al procesar el ticket: ' + err);
            }
        });
    }

    private splitDescription(description: string, maxLength: number): string[] {
        const words = description.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            if (currentLine.length + word.length + 1 <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        return lines;
    }

}