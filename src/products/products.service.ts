import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Brand } from 'src/brands/entities/brand.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>
  ) {}

  /**
   * Crea un nuevo producto en la base de datos.
   */
  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({ where: { id: createProductDto.categoryId } });
    const brand = await this.brandRepository.findOne({ where: { id: createProductDto.brandId } });

    if (!category && !brand) throw new NotFoundException('Categoria y Marca no encontradas');
    if (!category) throw new NotFoundException('Categoria no encontrada');
    if (!brand) throw new NotFoundException('Marca no encontrada');

    const newProduct = this.productRepository.create({ ...createProductDto, category, brand });
    return await this.productRepository.save(newProduct);
  }

  /**
   * Obtiene todos los productos con sus relaciones.
   */
  async findAll() {
    const products = await this.productRepository.find({ relations: ['brand', 'category'] });
    return { products };
  }

  /**
   * Obtiene el valor total del inventario.
   */
  async getAllStock() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.salePrice * product.stock)', 'totalInventory')
      .getRawOne();
    return result.totalInventory || 0;
  }

  /**
   * Calcula la ganancia total del inventario.
   */
  async getInventoryProfit(): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM((product.salePrice - product.purchasePrice) * product.stock)', 'inventoryProfit')
      .getRawOne();
    return result.inventoryProfit || 0;
  }

  /**
   * Calcula la ganancia de un producto específico.
   */
  async calculateProfitByProduct(identifier: string | number) {
    const product = await this.productRepository.findOne({
      where: typeof identifier === 'number' ? { id: identifier } : { code: identifier },
    });
    if (!product) throw new NotFoundException('Product not found');
    const profit = (product.salePrice - product.purchasePrice) * product.stock;
    return { product, profit };
  }

  /**
   * Obtiene el número total de productos registrados.
   */
  async getTotalProducts(): Promise<number> {
    const result = await this.findAll();
    return result.products.length;
  }

  /**
   * Obtiene el stock de un producto específico.
   */
  async getStockByProduct(identifier: number | string): Promise<number> {
    const product = await this.productRepository.findOne({
      where: typeof identifier === 'number' ? { id: identifier } : { code: identifier },
    });
    if (!product) throw new NotFoundException('Product Not Found!');
    return product.stock;
  }

  async getPriceByID(id: number) {
    const product = await this.productRepository.findOne({
      where: {id: id}
    })

    if (!product) { throw new NotFoundException(`El producto con el ID: ${id} no fue encontrado!`)};

    return product.salePrice
  }

  async getWholeSalePriceByID(id: number) {
    const product = await this.productRepository.findOne({
      where: {id: id}
    })

    if (!product) { throw new NotFoundException(`El producto con el ID: ${id} no fue encontrado!`)};

    return product.wholesalePrice
  }

  async getTouristPriceByID(id: number) {

    const product = await this.productRepository.findOne({
      where: {id: id}
    })

    if (!product) { throw new NotFoundException(`El producto con el ID: ${id} no fue encontrado!`)};

    return product.touristPrice
  }

  /**
   * Busca productos por nombre o código.
   */
  async findByNameOrCode(term: string) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.code = :term', { term })
      .orWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${term}%` });
  
    const products = await query.getMany();
  
    if (products.length === 0) {
      throw new HttpException('Product Not Found!', HttpStatus.NOT_FOUND);
    }
  
    return products;
  }
  

  /**
   * Obtiene un producto por su ID.
   */
  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['brand', 'category'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  /**
   * Actualiza los datos de un producto.
   */
  async update(id: number, updateProductDto: UpdateProductDto) {

    const category = await this.categoryRepository.findOne({ where: { id: updateProductDto.categoryId } });
    const brand = await this.brandRepository.findOne({ where: { id: updateProductDto.brandId } });
    const product = await this.productRepository.findOne({where: {id: id}});

    if (!product) { throw new HttpException(`Product with ID: ${id} Not Found!`, HttpStatus.NOT_FOUND)};

    if (!category && !brand) throw new HttpException('Categoria y Marca no encontradas', HttpStatus.NOT_FOUND);
    if (!category) throw new HttpException('Categoria no encontrada', HttpStatus.NOT_FOUND);
    if (!brand) throw new HttpException('Marca no encontrada', HttpStatus.NOT_FOUND);

    Object.assign(product, updateProductDto);
    product.category = category;
    product.brand = brand;

    return await this.productRepository.save(product);
  }

  /**
   * Elimina un producto de la base de datos.
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.productRepository.delete(id);
    return { message: 'Producto eliminado' };
  }

  /**
   * Agrega stock a un producto.
   */
  async addStock(id: number, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser un número positivo.');
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    product.stock += Number(quantity);
    return await this.productRepository.save(product);
  }

  /**
   * Reduce stock de un producto.
   */
  async subtractStock(id: number, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('La cantidad debe ser un número positivo.');
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    if (product.stock < quantity) throw new BadRequestException('Stock insuficiente para realizar la operación.');
    product.stock -= Number(quantity);
    return await this.productRepository.save(product);
  }
}
