import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Provider } from 'src/providers/entities/provider.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const provider = await this.providerRepository.findOne({
      where: { id: createOrderDto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${createOrderDto.providerId} no encontrado`);
    }

    const newOrder = this.orderRepository.create({
      provider,
      orderDate: createOrderDto.orderDate,
      invoiceNumber: createOrderDto.invoiceNumber,
    });

    return await this.orderRepository.save(newOrder);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({ 
      where: {isActive: true}, 
      relations: ['provider', 'orderDetails'],
    });
  }

  async findActive() {
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoin('order.orderDetails', 'orderDetails')
      .where('orderDetails.id IS NULL')
      .select(['order.id', 'order.invoiceNumber'])
      .getMany();
  }
  
  async findAllDeleted(): Promise<Order[]> {
    return await this.orderRepository.find({ 
      where: {isActive: false}, 
      relations: ['provider', 'orderDetails'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['provider', 'orderDetails'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({where: {id}});

    if (!order) { throw new HttpException(`Order With ID: ${id} not found!`, HttpStatus.NOT_FOUND)};

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({where: {id}});

    if (!order) { throw new HttpException(`Order With ID: ${id} not found!`, HttpStatus.NOT_FOUND)};

    if (order.isActive === false) { throw new HttpException(`Order With ID: ${id} is already deleted!`, HttpStatus.BAD_REQUEST) }

    order.isActive = false;
    
    await this.orderRepository.save(order);
  }

  async active(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({where: {id}});

    if (!order) { throw new HttpException(`Order With ID: ${id} not found!`, HttpStatus.NOT_FOUND)};

    if (order.isActive === true) { throw new HttpException(`Order With ID: ${id} is already active!`, HttpStatus.BAD_REQUEST) }

    order.isActive = true;
    
    await this.orderRepository.save(order);
  }
}
