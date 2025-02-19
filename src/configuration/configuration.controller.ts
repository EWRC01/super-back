// src/configuration/configuration.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigurationService } from './configuration.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
@ApiTags('Configuration')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  /**
   * Endpoint para crear o actualizar la configuración de la aplicación.
   * Permite subir un logo (imagen) y actualizar los campos name y phone.
   */
  @Post()
  @ApiOperation({ summary: 'Crear o actualizar la configuración (incluye carga de logo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos de configuración',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'default' },
        phone: { type: 'string', example: '1234567890' },
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración creada o actualizada correctamente',
  })
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads', // Carpeta para guardar archivos
        filename: (req, file, callback) => {
          // Generar un nombre único para el archivo
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtName = extname(file.originalname);
          callback(null, `logo-${uniqueSuffix}${fileExtName}`);
        },
      }),
    }),
  )
  async createConfiguration(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name: string; phone: string },
  ) {
    const logoPath = file ? file.path : '';
    return this.configurationService.createOrUpdateConfiguration(body.name, body.phone, logoPath);
  }
}
