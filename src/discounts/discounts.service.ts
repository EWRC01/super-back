import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as moment from 'moment-timezone';
import { Discount } from './entities/discount.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountType } from '../common/enums/discount-type.enum';

@Injectable()
export class DiscountsService {
  private readonly timezone = 'America/El_Salvador';

  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    // Asegurar que las fechas estén en la zona horaria correcta
    if (createDiscountDto.startDate) {
      createDiscountDto.startDate = moment(createDiscountDto.startDate)
        .tz(this.timezone)
        .toDate();
    }
    if (createDiscountDto.endDate) {
      createDiscountDto.endDate = moment(createDiscountDto.endDate)
        .tz(this.timezone)
        .endOf('day') // Asegurar que cubra todo el día
        .toDate();
    }

    const discount = this.discountRepository.create(createDiscountDto);
    return this.discountRepository.save(discount);
  }

  async findAll(filters?: {
    isActive?: boolean;
    productId?: number;
    includeExpired?: boolean;
  }): Promise<Discount[]> {
    const where: any = {};
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (!filters?.includeExpired) {
      const now = moment().tz(this.timezone).toDate();
      where.startDate = LessThanOrEqual(now);
      where.endDate = MoreThanOrEqual(now);
    }

    return this.discountRepository.find({ 
      where,
      order: {
        startDate: 'DESC'
      }
    });
  }

  async findOne(id: number): Promise<Discount> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    return discount;
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOne(id);
    
    // Actualizar fechas con timezone
    if (updateDiscountDto.startDate) {
      updateDiscountDto.startDate = moment(updateDiscountDto.startDate)
        .tz(this.timezone)
        .toDate();
    }
    if (updateDiscountDto.endDate) {
      updateDiscountDto.endDate = moment(updateDiscountDto.endDate)
        .tz(this.timezone)
        .endOf('day')
        .toDate();
    }

    this.discountRepository.merge(discount, updateDiscountDto);
    return this.discountRepository.save(discount);
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);
    await this.discountRepository.remove(discount);
  }

  async getApplicableDiscounts(
    productId: number, 
    quantity: number,
    date?: Date
  ): Promise<Discount[]> {
    const now = date ? moment(date).tz(this.timezone) : moment().tz(this.timezone);
    const nowDate = now.toDate();
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();

    return this.discountRepository.find({
      where: {
        productId,
        isActive: true,
        startDate: LessThanOrEqual(endOfDay),
        endDate: MoreThanOrEqual(startOfDay),
        minQuantity: LessThanOrEqual(quantity),
      },
      order: {
        minQuantity: 'DESC',
        value: 'DESC' // Ordenar por descuentos más altos primero
      },
    });
  }

  async getCurrentDiscounts(): Promise<Discount[]> {
    const now = moment().tz(this.timezone);
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();

    return this.discountRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(endOfDay),
        endDate: MoreThanOrEqual(startOfDay),
      },
      order: {
        productId: 'ASC',
        minQuantity: 'ASC'
      }
    });
  }

  calculateDiscountAmount(discount: Discount, unitPrice: number, quantity: number): number {
    if (!discount.isActive) return 0;

    // Validar fechas de vigencia
    const now = moment().tz(this.timezone);
    if (discount.startDate && now.isBefore(moment(discount.startDate).tz(this.timezone))) {
      return 0;
    }
    if (discount.endDate && now.isAfter(moment(discount.endDate).tz(this.timezone).endOf('day'))) {
      return 0;
    }

    switch(discount.type) {
      case DiscountType.PERCENTAGE:
        return (unitPrice * quantity) * (discount.value / 100);
      
      case DiscountType.FIXED_AMOUNT:
        return Math.min(discount.value * quantity, unitPrice * quantity);
      
      case DiscountType.BUY_X_GET_Y:
        const freeItems = Math.floor(quantity / discount.minQuantity) * discount.value;
        return freeItems * unitPrice;
      
      case DiscountType.BUNDLE:
        const bundleSize = discount.minQuantity || 1;
        const bundlePrice = discount.value || unitPrice;
        const bundles = Math.floor(quantity / bundleSize);
        const remainder = quantity % bundleSize;
        return (unitPrice * quantity) - ((bundles * bundlePrice) + (remainder * unitPrice));
      
      default:
        return 0;
    }
  }

  async checkDiscountValidity(discountId: number): Promise<boolean> {
    const discount = await this.findOne(discountId);
    const now = moment().tz(this.timezone);
    
    if (!discount.isActive) return false;
    if (discount.startDate && now.isBefore(moment(discount.startDate).tz(this.timezone))) {
      return false;
    }
    if (discount.endDate && now.isAfter(moment(discount.endDate).tz(this.timezone).endOf('day'))) {
      return false;
    }
    
    return true;
  }
}