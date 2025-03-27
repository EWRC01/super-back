import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Provider } from 'src/providers/entities/provider.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    // Verificar si el providerId existe en la base de datos
    const provider = await this.providerRepository.findOne({
      where: { id: createBrandDto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`El proveedor con ID ${createBrandDto.providerId} no existe`);
    }

    // Crear y guardar la nueva marca con la relación de provider
    const newBrand = this.brandRepository.create({
      ...createBrandDto,
      provider,
    });

    return await this.brandRepository.save(newBrand);
  }

  async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find({ 
      where: {isActive: true} ,
      relations: ['products', 'provider'] });
  }

  async findAllDeleted(): Promise<Brand[]> {
    return await this.brandRepository.find({ 
      where: {isActive: false} ,
      relations: ['products', 'provider'] });
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id }, relations: ['products', 'provider'] });
    if (!brand) {
      throw new NotFoundException(`La marca con el ID ${id} no existe`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    
    if (updateBrandDto.providerId) {
      const provider = await this.providerRepository.findOne({
        where: { id: updateBrandDto.providerId }
      });
      
      if (!provider) {
        throw new NotFoundException('Proveedor no encontrado');
      }
      brand.provider = provider;
    }
  
    if (updateBrandDto.brandName) {
      brand.brandName = updateBrandDto.brandName;
    }
  
    await this.brandRepository.save(brand);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: {id:id}})

    if(!brand) { throw new HttpException(`Brand with ID: ${id} not found!`, HttpStatus.NOT_FOUND) };

    if (brand.isActive === false) {  throw new HttpException(`Brand with ID: ${id} is already deleted!`, HttpStatus.BAD_REQUEST)};

    brand.isActive = false

    await this.brandRepository.save(brand);
  }

  async active(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: {id:id}})

    if(!brand) { throw new HttpException(`Brand with ID: ${id} not found!`, HttpStatus.NOT_FOUND) };

    if (brand.isActive === true) {  throw new HttpException(`Brand with ID: ${id} is already active!`, HttpStatus.BAD_REQUEST)};

    brand.isActive = true

    await this.brandRepository.save(brand);
  }
}
