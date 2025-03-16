import { Body, Controller, Post } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Definir la estructura de los parámetros en un DTO
class ProductoDTO {
    description: string;
    quantity: number;
    price: number;
}

class TiendaDTO {
    name: string;
    address: string;
}


class PrintRequestDTO {
    shop: TiendaDTO;
    date: string;
    products: ProductoDTO[];
    cash: number;
}

@Controller('printer')
export class PrinterController {
    constructor(private readonly printerService: PrinterService) { }

    @Post('print')
    @ApiOperation({ summary: 'Imprimir un ticket de venta' })
    @ApiBody({
        description: 'Body of the request to print the ticket',
        required: true, // Marks the body as required
        type: PrintRequestDTO, // Defines the data type of the request
        examples: {
          example: {
            value: {
              shop: {
                name: 'Store XYZ',
                address: 'Fictitious Street 123',
              },
              products: [
                {
                  description: 'Product 1',
                  quantity: 2,
                  price: 100,
                },
                {
                  description: 'Product 2',
                  quantity: 1,
                  price: 150,
                },
              ],
              cash: 500,
              date: '2025-03-15',
            },
          },
        },
      })
    @ApiResponse({
        status: 200,
        description: 'Ticket impreso correctamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Error en la impresión',
    })
    async printTicket(@Body() data: PrintRequestDTO) {
        return this.printerService.printTicket(data);
    }
}
