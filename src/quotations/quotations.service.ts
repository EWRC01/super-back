import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { QuotationProduct } from 'src/quotation-products/entity/quotation-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { PriceType } from 'src/common/enums/price-type.enum';
import * as moment from 'moment-timezone';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const customer = await this.customersRepository.findOne({ where: { id: createQuotationDto.customerId } });
    if (!customer) {
        throw new NotFoundException(`Cliente con ID: ${createQuotationDto.customerId} no encontrado`);
    }

    const user = await this.usersRepository.findOne({ where: { id: createQuotationDto.userId } });
    if (!user) {
        throw new NotFoundException(`Usuario con ID: ${createQuotationDto.userId} no encontrado`);
    }

    let total = 0;
    const quotationProducts: QuotationProduct[] = [];

    for (const item of createQuotationDto.products) {
        const product = await this.productRepository.findOne({ where: { id: item.productId } });
        if (!product) {
            throw new NotFoundException(`Producto con ID: ${item.productId} no encontrado`);
        }

        // Obtener el precio correcto según priceType
        let unitPrice: number;
        switch (createQuotationDto.priceType) {
            case PriceType.WHOLESALE:
                unitPrice = product.wholesalePrice;
                break;
            case PriceType.TOURIST:
                unitPrice = product.touristPrice;
                break;
            default:
                unitPrice = product.salePrice;
        }

        const subtotal = Number(item.quantity) * Number(unitPrice);
        total += Number(subtotal);

        const quotationProduct = new QuotationProduct();
        quotationProduct.product = product;
        quotationProduct.quantity = item.quantity;
        quotationProduct.unitPrice = unitPrice;
        quotationProduct.subtotal = subtotal;
        quotationProduct.priceType = createQuotationDto.priceType;

        quotationProducts.push(quotationProduct);
    }

    const newQuotation = this.quotationsRepository.create({
        date: new Date(),
        total,
        customer,
        user,
        quotationProducts
    });

    return await this.quotationsRepository.save(newQuotation);
}


  async findAll(startDate: string, endDate: string): Promise<Quotation[]> {

    const timeZone = "America/El_Salvador";

    return this.quotationsRepository.find({
      relations: [
        'customer',
        'user',
        'quotationProducts'
      ],
      where: {
        date: Between(
          moment.tz(`${startDate}T00:00:00`, timeZone).toDate(), 
          moment.tz(`${endDate}T23:59:59`, timeZone).toDate(),
        )
      },
    });
  }

  async findOne(id: number): Promise<Quotation> {
    const quotation = await this.quotationsRepository.findOne({
      relations: [
        'customer',
        'user',
        'quotationProducts'
      ],
      where: {id: id}
    })

    if (!quotation) { throw new HttpException(`Cotizacion con ID: ${id} no encontrada!`, HttpStatus.NOT_FOUND)};

    return quotation;
  }

  async remove(id: number): Promise<void> {

    const quotation = await this.quotationsRepository.findOne({where: {id: id}})

    if (!quotation) { throw new HttpException(`Cotizacion con ID: ${id} no encontrada!`, HttpStatus.NOT_FOUND)};

    await this.quotationsRepository.delete(id);
  }
}