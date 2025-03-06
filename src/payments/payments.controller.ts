import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    NotFoundException,
    BadRequestException,
    HttpStatus,
    HttpCode,
    Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Payment } from './entities/payment.entity';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Payments') // Etiqueta para agrupar los endpoints en Swagger
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new payment', description: 'Creates a new payment and updates the associated account holdings.' })
    @ApiBody({ type: CreatePaymentDto, description: 'Payment details' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment created successfully', type: Payment })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or amount exceeds pending balance' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account holding not found' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
        try {
            return await this.paymentsService.create(createPaymentDto);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all payments', description: 'Retrieves a list of all payments.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of payments', type: [Payment] })
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.paymentsService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a payment by ID', description: 'Retrieves a payment by its ID.' })
    @ApiParam({ name: 'id', description: 'Payment ID', type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment found', type: Payment })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
    async findOne(@Param('id') id: number): Promise<Payment> {
        const payment = await this.paymentsService.findOne(id);
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }

    @Get('account-holding/:accountHoldingId')
    @ApiOperation({ summary: 'Get payments by account holding ID', description: 'Retrieves all payments associated with a specific account holding.' })
    @ApiParam({ name: 'accountHoldingId', description: 'Account holding ID', type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of payments', type: [Payment] })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account holding not found' })
    async findPaymentsByAccountHoldingId(@Param('accountHoldingId') accountHoldingId: number): Promise<Payment[]> {
        const payments = await this.paymentsService.findPaymentsByAccountHoldingId(accountHoldingId);
        if (!payments || payments.length === 0) {
            throw new NotFoundException(`No payments found for account holding with ID ${accountHoldingId}`);
        }
        return payments;
    }
}