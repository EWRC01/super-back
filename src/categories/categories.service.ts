import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(newCategory);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({ 
      where:{isActive: true},
      relations: ['products'] });
  }

  async findAllDeleted(): Promise<Category[]> {
    return await this.categoryRepository.find({ 
      where:{isActive: false},
      relations: ['products'] });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['products'] });
    if (!category) {
      throw new NotFoundException(`La categoría con el ID ${id} no existe`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id); // Verifica si la categoría existe antes de actualizarla
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {

    const category = await this.categoryRepository.findOne({ where: { id: id }});

    if (!category) { throw new HttpException(`La categoría con el ID ${id} no existe`, HttpStatus.NOT_FOUND) }

    if (category.isActive === false) { throw new HttpException(`La categoría con el ID ${id} ya esta eliminada`, HttpStatus.BAD_REQUEST) }

    category.isActive = false

    await this.categoryRepository.save(category);
    
  }

  async active(id: number): Promise<void> {

    const category = await this.categoryRepository.findOne({ where: { id: id }});

    if (!category) { throw new HttpException(`La categoría con el ID ${id} no existe`, HttpStatus.NOT_FOUND) }

    if (category.isActive === true) { throw new HttpException(`La categoría con el ID ${id} ya esta activa`, HttpStatus.BAD_REQUEST) }

    category.isActive = true

    await this.categoryRepository.save(category);
    
  }
}
