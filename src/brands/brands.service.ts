import { Injectable, NotFoundException } from '@nestjs/common';
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
    return await this.brandRepository.find({ relations: ['products, providers'] });
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id }, relations: ['products, providers'] });
    if (!brand) {
      throw new NotFoundException(`La marca con el ID ${id} no existe`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    await this.findOne(id); // Verifica si la marca existe antes de actualizarla
    await this.brandRepository.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.brandRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró la marca con ID ${id} para eliminar`);
    }
  }
}
