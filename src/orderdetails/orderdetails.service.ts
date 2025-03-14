import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDetailDto } from "./dto/create-orderdetail.dto";
import { OrderDetail } from "./entities/orderdetail.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Brand } from "src/brands/entities/brand.entity";
import { Category } from "src/categories/entities/category.entity";

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail) private orderDetailRepo: Repository<OrderDetail>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateOrderDetailDto): Promise<OrderDetail> {
    const order = await this.orderRepo.findOne({ where: { invoiceNumber: dto.invoiceNumber } });
    if (!order) throw new NotFoundException('Orden no encontrada con el número de factura proporcionado');

    let product: Product;
    if (dto.productId) {
      product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Producto no encontrado');
    } else {
      // Si no hay productId, validamos que los campos obligatorios estén presentes
      if (!dto.code || !dto.name || !dto.purchasePrice || !dto.salePrice || !dto.touristPrice || !dto.brandId || !dto.categoryId) {
        throw new BadRequestException('Debe proporcionar todos los datos del producto si no envía un productId');
      }

      const brand = await this.brandRepo.findOne({ where: { id: dto.brandId } });
      if (!brand) throw new NotFoundException('Marca no encontrada');

      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Categoría no encontrada');

      product = this.productRepo.create({
        code: dto.code,
        name: dto.name,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        touristPrice: dto.touristPrice,
        stock: dto.quantity, // Se registra con el stock de la orden
        reservedStock: dto.reservedStock ?? 0,
        wholesaleSale: dto.wholesaleSale ?? false,
        wholesalePrice: dto.wholesalePrice ?? null,
        wholesaleQuantity: dto.wholesaleQuantity ?? null,
        brand,
        category,
      });

      await this.productRepo.save(product);
    }

    const taxRate = 0.13; // IVA en El Salvador (13%)
    const taxAmount = dto.purchasePrice * taxRate * dto.quantity;

    const orderDetail = this.orderDetailRepo.create({
      order,
      product,
      quantity: dto.quantity,
      purchasePrice: dto.purchasePrice,
      calculatedTax: taxAmount,
    });

    await this.orderDetailRepo.save(orderDetail);

    // Aumentar stock en la base de datos
    product.stock += dto.quantity;
    await this.productRepo.save(product);

    return orderDetail;
  }
}