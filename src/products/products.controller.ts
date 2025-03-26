import { 
  Controller, Get, Post, Body, Param, Patch, Delete, Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { 
  ApiTags, ApiOperation, ApiParam, ApiQuery, 
  ApiResponse, ApiBadRequestResponse 
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('findDeleted/')
  @ApiOperation({ summary: 'Retrieve all products' })
  async findAllDeleted(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAllDeleted(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Get(':id/price')
  @ApiOperation({ summary: 'Get product price by ID' })
  async getPriceByID(@Param('id') id: number) {
    return this.productsService.getPriceByID(+id);
  }

  @Get(':id/price-tourist')
  @ApiOperation({ summary: 'Get tourist price for a product' })
  async getTouristPrice(@Param('id') id: number) {
    return this.productsService.getTouristPriceByID(+id);
  }

  @Get(':id/price-wholesale')
  @ApiOperation({ summary: 'Get wholesale price for a product' })
  async getWholeSalePrice(@Param('id') id: number) {
    return this.productsService.getWholeSalePriceByID(+id);
  }

  @Get(':identifier/profit')
  @ApiOperation({ summary: 'Calculate profit for a product by ID or code' })
  async getProductProfit(@Param('identifier') identifier: string) {
    return this.productsService.calculateProfitByProduct(isNaN(Number(identifier)) ? identifier : Number(identifier));
  }

  @Get(':identifier/stock')
  @ApiOperation({ summary: 'Get stock of a product by ID or barcode' })
  async getStock(@Param('identifier') identifier: string): Promise<number> {
    return this.productsService.getStockByProduct(isNaN(Number(identifier)) ? identifier : Number(identifier));
  }

  @Get('search/:term')
  @ApiOperation({ summary: 'Find products by name or code' })
  async findProduct(@Param('term') term: string) {
    return this.productsService.findByNameOrCode(term);
  }

  @Get('inventory/total-stock')
  @ApiOperation({ summary: 'Get total stock of all products' })
  async getTotalStock() {
    return this.productsService.getTotalProducts();
  }

  @Get('inventory/total-value')
  @ApiOperation({ summary: 'Get total inventory value' })
  async getAllStock() {
    return this.productsService.getAllStock();
  }

  @Get('inventory/total-profit')
  @ApiOperation({ summary: 'Get total profit from inventory' })
  async getInventoryProfit() {
    return this.productsService.getInventoryProfit();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product details' })
  async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Post('activate-product/:id')
  @ApiOperation({ summary: 'Activate a product' })
  async activate(@Param('id') id: number) {
    return this.productsService.active(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/add-stock')
  @ApiOperation({ summary: 'Increase product stock' })
  @ApiQuery({ name: 'quantity', type: 'number', description: 'Quantity to add' })
  async addStock(@Param('id') id: number, @Query('quantity') quantity: number) {
    return this.productsService.addStock(id, quantity);
  }

  @Patch(':id/subtract-stock')
  @ApiOperation({ summary: 'Decrease product stock' })
  @ApiQuery({ name: 'quantity', type: 'number', description: 'Quantity to subtract' })
  async subtractStock(@Param('id') id: number, @Query('quantity') quantity: number) {
    return this.productsService.subtractStock(id, quantity);
  }
}
