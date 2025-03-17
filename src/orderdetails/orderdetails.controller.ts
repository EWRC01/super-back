import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe, 
  NotFoundException, 
  BadRequestException, 
  Get
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderDetailsService } from './orderdetails.service';
import { CreateOrderDetailDto } from './dto/create-orderdetail.dto';
import { OrderDetail } from './entities/orderdetail.entity';

@ApiTags('Order Details') // Grupo en Swagger
@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encuentra todos los registros',
    description: 'Permite encontrar todos los registros de detalles de orden'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registros encontrados correctamente',
    type: OrderDetail
  })
  async findAll() {
    return await this.orderDetailsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Registrar un detalle de orden',
    description: `Permite registrar un nuevo detalle de orden. Si el producto ya existe en el sistema, se utilizará su información. 
    Si el producto no existe, se creará automáticamente con los datos proporcionados en el request.`,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Detalle de orden registrado correctamente',
    type: OrderDetail,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Los datos proporcionados son incorrectos o faltan campos obligatorios',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la orden con el número de factura o la marca/categoría del producto',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor',
  })
  async create(@Body() createOrderDetailDto: CreateOrderDetailDto): Promise<OrderDetail[]> {
    try {
      return await this.orderDetailsService.create(createOrderDetailDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new Error('Error interno del servidor');
    }
  }
}
