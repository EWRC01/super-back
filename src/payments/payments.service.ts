import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AccountsHoldingsService } from 'src/accountsholdings/accountsholdings.service';
import * as moment from 'moment-timezone';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(AccountsHoldings)
        private accountHoldingRepository: Repository<AccountsHoldings>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private readonly accountsHoldingsService: AccountsHoldingsService,
    ) {}

    async create(createDto: CreatePaymentDto): Promise<Payment> {
        const { amount, date, accountHoldingId, customerId } = createDto;
    
        // Buscar la cuenta asociada, incluyendo sus relaciones
        const accountHolding = await this.accountHoldingRepository.findOne({
            where: { id: accountHoldingId },
            relations: ['payments', 'customer'],
        });
    
        if (!accountHolding) {
            throw new NotFoundException(`Account holding with ID ${accountHoldingId} not found`);
        }
    
        // **Verificar que la cuenta pertenece al cliente correcto**
        if (accountHolding.customer.id !== customerId) {
            throw new BadRequestException('This account holding does not belong to the provided customer');
        }
    
        // Verificamos que la cuenta se haya pagado

        if (accountHolding.toPay <= 0) {
            throw new BadRequestException('This account has already been fully paid!')
        }

        let change = 0;
        let paidAmount = amount;

        if (amount > accountHolding.toPay) {
            change = amount - accountHolding.toPay;
            paidAmount = accountHolding.toPay // Solo se paga la cantidad necesaria
        }
    
        // Crear el pago
        const payment = this.paymentRepository.create({
            amount: paidAmount,
            date: moment().tz('America/El_Salvador').toDate(),
            accountHolding,
        });
    
        await this.paymentRepository.save(payment);
    
        // Asegurar que el pago se añade al array de pagos de la cuenta
        if (!accountHolding.payments) {
            accountHolding.payments = [];
        }
        accountHolding.payments.push(payment);
    
        // Actualizar el estado de la cuenta
        accountHolding.paid = Number(accountHolding.paid) + Number(amount);
        accountHolding.toPay = Math.max(Number(accountHolding.toPay) - Number(amount), 0);
    
        // Si el pago es total y la operación es HOLDING, mover los productos reservados a vendidos
        if (accountHolding.paid === accountHolding.total && accountHolding.type === OperationType.HOLDING) {
            for (const soldProduct of accountHolding.soldProducts) {
                const product = soldProduct.product;
                product.reservedStock -= soldProduct.quantity; // Reducir el stock reservado
                product.stock -= soldProduct.quantity; // Descontar el stock disponible
                await this.productRepository.save(product);
            }
        }
        
        // Guardar cuenta actualizada antes de verificar si se finaliza

        await this.accountHoldingRepository.save(accountHolding);

        // Si ya no hay saldo pendiente, finaliza la cuenta

        if (accountHolding.toPay <= 0) {
            await this.accountsHoldingsService.finalizeAccountHolding(accountHoldingId);
        }

        const savedPayment = await this.paymentRepository.findOne({
            where: { id: payment.id},
            relations: ['accounts_holdings']
        });
    
        return {
            id: savedPayment.id,
            date: savedPayment.date,
            amount: savedPayment.amount,
            accountHoldingId: savedPayment.accountHolding.id,
            accountHolding: savedPayment.accountHolding,
        };
    }
    
    async findAll(paginationDto: PaginationDto) {
        const {page, limit} = paginationDto;
        const [data, total] = await this.paymentRepository.findAndCount({
            take: Number(limit),
            skip: Number((page - 1)) * Number(limit),
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    
    }

    async findOne(id: number) {
        return this.paymentRepository.findOne({
            where: { id },
        });
    }

    async findPaymentsByAccountHoldingId(accountHoldingId: number) {
        return this.paymentRepository.find({
            where: { accountHoldingId },
        });
    }
}