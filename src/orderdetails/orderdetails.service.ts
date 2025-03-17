import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDetailDto } from "./dto/create-orderdetail.dto";
import { OrderDetail } from "./entities/orderdetail.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Brand } from "src/brands/entities/brand.entity";
import { Category } from "src/categories/entities/category.entity";
import { Decimal } from 'decimal.js';
@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail) private orderDetailRepo: Repository<OrderDetail>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateOrderDetailDto): Promise<OrderDetail[]> {
    const order = await this.orderRepo.findOne({ where: { invoiceNumber: dto.invoiceNumber } });
    if (!order) throw new NotFoundException('Orden no encontrada con el número de factura proporcionado');

    const orderDetails: OrderDetail[] = [];

    for (const productData of dto.products) {
      let product: Product;
      let purchasePrice: number;

      // Caso 1: Producto existente
      if (productData.productId) {
        product = await this.productRepo.findOne({ 
          where: { id: productData.productId },
          select: ["id", "purchasePrice", "stock"]
        });
        if (!product) throw new NotFoundException(`Producto con ID ${productData.productId} no encontrado`);
        purchasePrice = product.purchasePrice;

        // Actualizar stock solo si el producto ya existía
        product.stock += productData.quantity;
        await this.productRepo.save(product);
      }
      // Caso 2: Nuevo producto
      else {
        if (
          !productData.code ||
          !productData.name ||
          !productData.purchasePrice ||
          !productData.salePrice ||
          !productData.touristPrice ||
          !productData.brandId ||
          !productData.categoryId
        ) {
          throw new BadRequestException('Todos los campos del producto son obligatorios si no se proporciona un productId');
        }

        const brand = await this.brandRepo.findOne({ where: { id: productData.brandId } });
        if (!brand) throw new NotFoundException('Marca no encontrada');

        const category = await this.categoryRepo.findOne({ where: { id: productData.categoryId } });
        if (!category) throw new NotFoundException('Categoría no encontrada');

        // Crear nuevo producto con su stock inicial
        product = this.productRepo.create({
          code: productData.code,
          name: productData.name,
          purchasePrice: productData.purchasePrice,
          salePrice: productData.salePrice,
          touristPrice: productData.touristPrice,
          stock: productData.quantity,  // Stock inicial = cantidad del pedido
          reservedStock: productData.reservedStock ?? 0,
          wholesaleSale: productData.wholesaleSale ?? false,
          wholesalePrice: productData.wholesalePrice ?? null,
          wholesaleQuantity: productData.wholesaleQuantity ?? null,
          brand,
          category,
        });

        await this.productRepo.save(product);
        purchasePrice = productData.purchasePrice;
      }

      const purchasePriceDecimal = new Decimal(purchasePrice);
      const taxPerUnit  = purchasePriceDecimal.minus(purchasePriceDecimal.dividedBy(1.13));
      const taxAmount = taxPerUnit.times(productData.quantity);

      // Cálculos de impuestos (IVA 13%)
      const taxPerUnitRounded = taxPerUnit.toDecimalPlaces(2).toNumber();
      const taxAmountRounded = taxAmount.toDecimalPlaces(2).toNumber();
      const totalWithouthTax = purchasePriceDecimal.dividedBy(1.13).times(productData.quantity).toDecimalPlaces(2).toNumber();

      const orderDetail = this.orderDetailRepo.create({
        order,
        product,
        quantity: productData.quantity,
        purchasePriceUnit: purchasePrice,
        calculatedTaxUnit: taxPerUnitRounded,
        calculatedTotalPriceWithouthTax: totalWithouthTax,
        calculatedTotalTax: taxAmountRounded,
      });

      await this.orderDetailRepo.save(orderDetail);
      orderDetails.push(orderDetail);
    }

    return orderDetails;
  }

  async findAll() {
    return await this.orderDetailRepo.find({ relations: ['product'] });
  }
}