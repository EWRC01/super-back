import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { Product } from 'src/products/entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(AccountsHoldings)
        private accountHoldingRepository: Repository<AccountsHoldings>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {}

    async create(createDto: CreatePaymentDto): Promise<Payment> {
        const { amount, date, accountHoldingId, customerId } = createDto;
    
        // Buscar la cuenta asociada, incluyendo sus relaciones
        const accountHolding = await this.accountHoldingRepository.findOne({
            where: { id: accountHoldingId },
            relations: ['payments', 'soldProducts', 'soldProducts.product', 'customer'],
        });
    
        if (!accountHolding) {
            throw new NotFoundException(`Account holding with ID ${accountHoldingId} not found`);
        }
    
        // **Verificar que la cuenta pertenece al cliente correcto**
        if (accountHolding.customer.id !== customerId) {
            throw new BadRequestException('This account holding does not belong to the provided customer');
        }
    
        // Logs para depuración
        console.log('Monto del pago:', amount);
        console.log('Saldo pendiente:', accountHolding.toPay);
        console.log('accountHoldingId:', accountHoldingId);
        console.log('customerId:', customerId);
    
        // Validar que el saldo pendiente sea mayor o igual al monto del pago
        if (amount > Number(accountHolding.toPay)) {
            throw new BadRequestException('The amount exceeds the pending balance');
        }
    
        // Crear el pago
        const payment = this.paymentRepository.create({
            amount,
            date: new Date(date),
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
        accountHolding.toPay = Number(accountHolding.toPay) - Number(amount);
    
        // Si el pago es total y la operación es HOLDING, mover los productos reservados a vendidos
        if (accountHolding.paid === accountHolding.total && accountHolding.type === OperationType.HOLDING) {
            for (const soldProduct of accountHolding.soldProducts) {
                const product = soldProduct.product;
                product.reservedStock -= soldProduct.quantity; // Reducir el stock reservado
                product.stock -= soldProduct.quantity; // Descontar el stock disponible
                await this.productRepository.save(product);
            }
        }
    
        // Guardar la cuenta actualizada
        await this.accountHoldingRepository.save(accountHolding);
    
        return payment;
    }
    
    async findAll(paginationDto: PaginationDto) {
        const {page, limit} = paginationDto;
        const [data, total] = await this.paymentRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
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