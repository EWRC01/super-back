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

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Get('price/:id')
  @ApiOperation({ summary: 'Get product price by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async getPriceByID(@Param('id') id: number) {
    return this.productsService.getPriceByID(+id)
  }

  @Get('price-tourist/:id')
  @ApiOperation({ summary: 'Get product tourist price by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async getTouristPrice(@Param('id') id: number) {
    return this.productsService.getTouristPriceByID(+id)
  }

  @ApiOperation({ summary: 'Get product whosale price by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  @Get('price-wholesale/:id')
  async getWholeSalePrice(@Param('id') id: number) {
    return this.productsService.getWholeSalePriceByID(+id)
  }

  @Get('profit/:identifier')
  @ApiOperation({ summary: 'Calculate profit for a specific product by ID or code' })
  @ApiParam({ name: 'identifier', type: 'string', description: 'Product ID or code' })
  @ApiResponse({ status: 200, description: 'Profit calculated successfully' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async getProductProfit(@Param('identifier') identifier: string) {
    const parsedIdentifier = isNaN(Number(identifier)) ? identifier : Number(identifier);
    return this.productsService.calculateProfitByProduct(parsedIdentifier);
  }

  @Get('/stock/:identifier')
  @ApiOperation({ summary: 'Get stock of a product by ID or barcode' })
  @ApiParam({ name: 'identifier', type: 'string', description: 'Product ID or barcode' })
  @ApiResponse({ status: 200, description: 'Stock quantity returned' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async getStock(@Param('identifier') identifier: string): Promise<number> {
    const parsedIdentifier = isNaN(Number(identifier)) ? identifier : Number(identifier);
    return this.productsService.getStockByProduct(parsedIdentifier);
  }

  @Get('/inventory-total')
  @ApiOperation({ summary: 'Get total inventory value' })
  @ApiResponse({ status: 200, description: 'Total inventory value returned' })
  async getAllStock() {
    return this.productsService.getAllStock();
  }

  @Get('/inventory-profit')
  @ApiOperation({ summary: 'Get total profit from inventory' })
  @ApiResponse({ status: 200, description: 'Total profit returned' })
  async getInventoryProfit() {
    return this.productsService.getInventoryProfit();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiBadRequestResponse({ description: 'Invalid input or product not found' })
  async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiBadRequestResponse({ description: 'Product not found' })
  async remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/add-stock')
  @ApiOperation({ summary: 'Increase product stock' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiQuery({ name: 'quantity', type: 'number', description: 'Quantity to add' })
  @ApiResponse({ status: 200, description: 'Stock increased' })
  @ApiBadRequestResponse({ description: 'Invalid quantity or product not found' })
  async addStock(@Param('id') id: number, @Query('quantity') quantity: number) {
    return this.productsService.addStock(id, quantity);
  }

  @Patch(':id/subtract-stock')
  @ApiOperation({ summary: 'Decrease product stock' })
  @ApiParam({ name: 'id', type: 'number', description: 'Product ID' })
  @ApiQuery({ name: 'quantity', type: 'number', description: 'Quantity to subtract' })
  @ApiResponse({ status: 200, description: 'Stock decreased' })
  @ApiBadRequestResponse({ description: 'Invalid quantity, insufficient stock, or product not found' })
  async subtractStock(@Param('id') id: number, @Query('quantity') quantity: number) {
    return this.productsService.subtractStock(id, quantity);
  }
}
