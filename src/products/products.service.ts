import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
    const barcode = await this.productRepository.findOne({ where: { code: createProductDto.code } });

    if (barcode) throw new BadRequestException('El código de barras ya está en uso');

    if (!category && !brand) throw new NotFoundException('Categoria y Marca no encontradas');
    if (!category) throw new NotFoundException('Categoria no encontrada');
    if (!brand) throw new NotFoundException('Marca no encontrada');

    const newProduct = this.productRepository.create({ ...createProductDto, category, brand });
    return await this.productRepository.save(newProduct);
  }

  /**
   * Obtiene todos los productos con sus relaciones.
   */
  async findAll(paginationDto: PaginationDto) {
    const {page, limit} = paginationDto;
    const [data, total] = await this.productRepository.findAndCount({
      take: Number(limit),
      skip: Number((page - 1)) * Number(limit),
      where: {isDeleted: false},
      relations: ['brand', 'category']
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)

    }
  }

    /**
   * Obtiene todos los productos eliminados.
   */
    async findAllDeleted(paginationDto: PaginationDto) {
      const {page, limit} = paginationDto;
      const [data, total] = await this.productRepository.findAndCount({
        take: Number(limit),
        skip: Number((page - 1)) * Number(limit),
        where: { isDeleted: true },
        relations: ['brand', 'category']
      })
  
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
  
      }
    }

  /**
   * Obtiene el valor total del inventario.
   */
  async getAllStock() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.salePrice * product.stock)', 'totalInventory')
      .where('product.isDeleted = false')
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
      .where('product.isDeleted = false')
      .getRawOne();
    return result.inventoryProfit || 0;
  }

  /**
   * Calcula la ganancia de un producto específico.
   */
  async calculateProfitByProduct(identifier: string | number) {
    const product = await this.productRepository.findOne({
      where: typeof identifier === 'number' ? 
      { id: identifier, isDeleted: false } 
      : { code: identifier, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Product not found');

    const profit = (product.salePrice - product.purchasePrice) * product.stock;

    return { product, profit };
  }

  /**
   * Obtiene el número total de productos registrados.
   */
  async getTotalProducts(): Promise<number> {
    const result = await this.productRepository.find();
    return result.length;
  }

  /**
   * Obtiene el stock de un producto específico.
   */
  async getStockByProduct(identifier: number | string): Promise<number> {
    const product = await this.productRepository.findOne({
      where: typeof identifier === 'number' ? 
      { id: identifier, isDeleted: false } 
      : { code: identifier, isDeleted: false },
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
    const products = await this.productRepository.find({
      where: [
        { name: Like(`%${term}%`) },
        { code: Like(`%${term}%`) },
        {isDeleted: false}
      ],
      relations: ['brand', 'category']
    });
  
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

  async findByCode(code: string) {
    const product = await this.productRepository.findOne({where : {code: code}, relations: ['brand', 'category']});
    if (!product) throw new NotFoundException('Producto No Encontrado');
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
    const product = await this.productRepository.findOne({where: {id: id}})

    if (!product) { return new HttpException(`Producto con ID: ${id} no encontrado`, HttpStatus.NOT_FOUND)};

    if(product.isDeleted === true) { return new HttpException(`El producto con el ID: ${id} ya se encuentra eliminado`, HttpStatus.OK)};

    product.isDeleted = true
    product.stock = 0;

    product.code = `DELETED_PRODUCT_${product.code}` 

    await this.productRepository.save(product);

    return { message: 'Producto eliminado' };
  }

    /**
   * Activa un producto de la base de datos.
   */
    async active(id: number) {
      const product = await this.productRepository.findOne({where: {id: id}})
  
      if (!product) { return new HttpException(`Producto con ID: ${id} no encontrado`, HttpStatus.NOT_FOUND)};


      if(product.isDeleted === false) { return new HttpException(`El producto con el ID: ${id} ya se encuentra activo`, HttpStatus.OK)};
  
      product.isDeleted = false;
  
        // Restaurar el código original si fue modificado
      if (product.code.startsWith('DELETED_')) {
         product.code = product.code.replace('DELETED_PRODUCT_', '');
      }
  
      await this.productRepository.save(product);
  
      return { message: 'Producto activado' };
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
