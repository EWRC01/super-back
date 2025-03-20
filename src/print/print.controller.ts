import { Controller, Post, Get, Param, HttpCode, HttpStatus, Header, Res, NotFoundException } from '@nestjs/common';
import { PrintService } from './print.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Print')
@Controller('print')
export class PrintController {
  constructor(private readonly printerService: PrintService) {}

  @Get('download-pdf/:saleId')
  async generatePdf(
    @Param('saleId') saleId: number,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.printerService.generateSalePDF(saleId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura_${saleId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  }

  @Get('download-pdf-thermal/:saleId')
  async generatePdfThermal(
    @Param('saleId') saleId: number,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.printerService.generateThermalPdf(saleId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura_${saleId}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  }

  @Get('view/:saleId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=factura.pdf')
  async viewPdf(
    @Param('saleId') saleId: number,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.printerService.generateSalePDF(saleId);
    res.send(pdfBuffer);
  }

  @Get('viewThermal/:saleId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=factura.pdf')
  async viewPdfThermal(
    @Param('saleId') saleId: number,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.printerService.generateThermalPdf(saleId);
    res.send(pdfBuffer);
  }

  @Get('generate-xml/:saleId')
  @ApiOperation({
    summary: 'Generar XML de factura',
    description: 'Devuelve el XML estructurado para la factura electrónica'
  })
  @ApiParam({
    name: 'saleId',
    description: 'ID de la venta para generar el XML',
    type: Number,
    example: 123
  })
  @ApiResponse({
    status: 200,
    description: 'XML generado exitosamente',
    schema: {
      example: `<?xml version="1.0"?>
      <Factura xmlns="http://example.com/facturaelectronica">
        <!-- Ejemplo de XML -->
      </Factura>`
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada'
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar el XML'
  })
  async generateSaleXML(@Param('saleId') saleId: number) {
    const xml = await this.printerService.generateSaleXML(saleId);
    return { xml }; // Devuelve como objeto para mejor formato en Swagger
  }
}