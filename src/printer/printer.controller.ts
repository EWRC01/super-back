import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { Repository } from 'typeorm';

@Controller('printer')
export class PrinterController {
    constructor(
        private readonly printerService: PrinterService,
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
    ) {}

    @Get(':saleId')
    async printSaleTicket(@Param('saleId') saleId: number): Promise<{ message: string }> {

        await this.printerService.printTicket(saleId);

        return { message: 'Ticket impreso correctamente' };
    }
}
