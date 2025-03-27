import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const exists = await this.providerRepository.findOneBy({ taxId: createProviderDto.taxId });
    if (exists) {
      throw new ConflictException('El NIT ya está registrado');
    }
    const provider = this.providerRepository.create(createProviderDto);
    return await this.providerRepository.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return await this.providerRepository.find({where: {isActive: true}});
  }

  async findAllDeleted(): Promise<Provider[]> {
    return await this.providerRepository.find({where: {isActive: false}});
  }

  async findTotalProviders(): Promise<Number> {
    const providers = await this.providerRepository.find();

    return providers.length;
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.providerRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return provider;
  }

  async update(id: number, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.providerRepository.findOne({where: {id: id}});

    if (!provider) { throw new HttpException(`Provider with ID: ${id} not found!`, HttpStatus.NOT_FOUND )};

    Object.assign(provider, updateProviderDto);

    return await this.providerRepository.save(provider);
  }

  async remove(id: number): Promise<void> {
    const provider = await this.providerRepository.findOne({where: {id: id}});

    if (!provider) { throw new HttpException(`Provider with ID: ${id} not found!`, HttpStatus.NOT_FOUND )};

    if (provider.isActive === false) { throw new HttpException(`Provider with ID: ${id} is already deleted`, HttpStatus.OK )};

    provider.isActive = false;

    await this.providerRepository.save(provider);
  }

  async active(id: number): Promise<void> {
    const provider = await this.providerRepository.findOne({where: {id: id}});

    if (!provider) { throw new HttpException(`Provider with ID: ${id} not found!`, HttpStatus.NOT_FOUND )};

    if (provider.isActive === true) { throw new HttpException(`Provider with ID: ${id} is already active`, HttpStatus.OK )};

    provider.isActive = true;

    await this.providerRepository.save(provider);
  }
}
