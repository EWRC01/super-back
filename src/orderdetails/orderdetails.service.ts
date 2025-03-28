import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDetailDto } from "./dto/create-orderdetail.dto";
import { OrderDetail } from "./entities/orderdetail.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Brand } from "src/brands/entities/brand.entity";
import { Category } from "src/categories/entities/category.entity";
import { Decimal } from 'decimal.js';
import { UpdateOrderDetailDto } from "./dto/update-orderdetail.dto";
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
      const basePriceWithouthTax = purchasePriceDecimal.dividedBy(1.13).toDecimalPlaces(2);
      const taxPerUnit = purchasePriceDecimal.minus(basePriceWithouthTax).toDecimalPlaces(2);
      const totalWithouthTax = basePriceWithouthTax.times(productData.quantity).toDecimalPlaces(2);
      const totalTax = taxPerUnit.times(productData.quantity).toDecimalPlaces(2);
      const totalWithTax = purchasePriceDecimal.times(productData.quantity).toDecimalPlaces(2);

      const orderDetail = this.orderDetailRepo.create({
        order,
        product,
        quantity: productData.quantity,
        purchasePriceUnit: purchasePriceDecimal.toNumber(),
        calculatedTaxUnit: taxPerUnit.toNumber(),
        calculatedTotalPriceWithouthTax: totalWithouthTax.toNumber(),
        calculatedTotalPriceWithTax: totalWithTax.toNumber(),
        calculatedTotalTax: totalTax.toNumber(),
      });

      await this.orderDetailRepo.save(orderDetail);
      orderDetails.push(orderDetail);
    }

    return orderDetails;
  }

  async findAll() {
    return await this.orderDetailRepo.find({ 
      where: {isActive: true},
      relations: ['product'] });
  }

  async findAllDeleted() {
    return await this.orderDetailRepo.find({ 
      where: {isActive: false},
      relations: ['product'] });
  }

  async findOne(invoiceNumber: string) {
    const orderDetails = await this.orderDetailRepo.find({
        where: { order: { invoiceNumber } },
        relations: ['product', 'order'],
    });

    if (orderDetails.length === 0) {
        throw new HttpException(
            `Order Details with Invoice Number: ${invoiceNumber} not found!`, 
            HttpStatus.NOT_FOUND
        );
    }

    // Extraer los datos de la orden desde el primer detalle
    const { orderDate, invoiceNumber: invNumber } = orderDetails[0].order;

    // Formatear la respuesta
    const formattedResponse = {
        orderDate,
        invoiceNumber: invNumber,
        details: orderDetails.map(detail => ({
            id: detail.id,
            quantity: detail.quantity,
            purchasePriceUnit: detail.purchasePriceUnit,
            calculatedTaxUnit: detail.calculatedTaxUnit,
            calculatedTotalPriceWithouthTax: detail.calculatedTotalPriceWithouthTax,
            calculatedTotalPriceWithTax: detail.calculatedTotalPriceWithTax,
            calculatedTotalTax: detail.calculatedTotalTax,
            product: detail.product
        }))
    };

    return formattedResponse;
}

async getOrderSummary(invoiceNumber: string) {
  const orderDetails = await this.orderDetailRepo.find({
    where: { order: { invoiceNumber } },
    relations: ['product', 'order'],
  });

  if (orderDetails.length === 0) {
    throw new NotFoundException(`No details found for invoice ${invoiceNumber}`);
  }

  // Convertir todos los valores a números
  const numericDetails = orderDetails.map(detail => ({
    ...detail,
    calculatedTotalPriceWithTax: Number(detail.calculatedTotalPriceWithTax),
    calculatedTotalPriceWithouthTax: Number(detail.calculatedTotalPriceWithouthTax),
    calculatedTotalTax: Number(detail.calculatedTotalTax)
  }));

  // Calcular totales
  const summary = {
    totalWithVAT: this.roundToTwoDecimals(
      numericDetails.reduce((acc, curr) => acc + curr.calculatedTotalPriceWithTax, 0)
    ),
    totalWithoutVAT: this.roundToTwoDecimals(
      numericDetails.reduce((acc, curr) => acc + curr.calculatedTotalPriceWithouthTax, 0)
    ),
    totalVAT: this.roundToTwoDecimals(
      numericDetails.reduce((acc, curr) => acc + curr.calculatedTotalTax, 0)
    ),
    invoice: {
      number: orderDetails[0].order.invoiceNumber,
      date: orderDetails[0].order.orderDate
    }
  };

  // Mapear detalles
  const details = numericDetails.map(detail => ({
    id: detail.id,
    productId: detail.product.id,
    unitPriceWithVAT: Number(detail.purchasePriceUnit),
    unitPriceWithoutVAT: Number((detail.purchasePriceUnit / 1.13).toFixed(2)),
    quantity: detail.quantity,
    totalPriceWithVAT: detail.calculatedTotalPriceWithTax,
    totalPriceWithoutVAT: detail.calculatedTotalPriceWithouthTax
  }));

  return { details, summary };
}

private roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
async update(id: number, dto: UpdateOrderDetailDto): Promise<OrderDetail> {
  const orderDetail = await this.orderDetailRepo.findOne({ 
      where: { id },
      relations: ['product', 'order']
  });

  if (!orderDetail) {
      throw new NotFoundException(`OrderDetail con ID ${id} no encontrado`);
  }

  const originalQuantity = orderDetail.quantity;
  let stockAdjustment = 0;

  // Actualizar cantidad si se proporciona
  if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');
      orderDetail.quantity = dto.quantity;
      stockAdjustment = dto.quantity - originalQuantity;
  }

  // Actualizar precio de compra y recalcular impuestos
  if (dto.purchasePrice !== undefined) {
      if (dto.purchasePrice <= 0) throw new BadRequestException('El precio debe ser mayor a 0');
      
      // 👇 Actualizar precio en el Producto asociado
      orderDetail.product.purchasePrice = dto.purchasePrice;
      await this.productRepo.save(orderDetail.product);

      // Actualizar campos en OrderDetail
      orderDetail.purchasePriceUnit = dto.purchasePrice;

      const purchasePrice = new Decimal(dto.purchasePrice);
      const basePriceWithoutTax = purchasePrice.dividedBy(1.13).toDecimalPlaces(2);
      const taxPerUnit = purchasePrice.minus(basePriceWithoutTax).toDecimalPlaces(2);
      const totalTax = taxPerUnit.times(orderDetail.quantity).toDecimalPlaces(2);
      const totalWithoutTax = basePriceWithoutTax.times(orderDetail.quantity).toDecimalPlaces(2);

      orderDetail.calculatedTaxUnit = taxPerUnit.toNumber();
      orderDetail.calculatedTotalTax = totalTax.toNumber();
      orderDetail.calculatedTotalPriceWithouthTax = totalWithoutTax.toNumber();
      orderDetail.calculatedTotalPriceWithTax = purchasePrice.times(orderDetail.quantity).toNumber();
  }

  // Guardar cambios en OrderDetail
  await this.orderDetailRepo.save(orderDetail);

  // Ajustar stock del producto si la cantidad cambió
  if (stockAdjustment !== 0) {
      const product = orderDetail.product;
      product.stock += stockAdjustment;
      await this.productRepo.save(product);
  }

  return orderDetail;
}

async remove(id: number): Promise<void> {
  const orderDetail = await this.orderDetailRepo.findOne({ 
    where: { id },
    relations: ['product']
  });

  if (!orderDetail) {
    throw new HttpException(`OrderDetail con ID ${id} no encontrado`, HttpStatus.NOT_FOUND);
  }

  if (orderDetail.isActive === false) {
    throw new HttpException(`OrderDetail con ID ${id} ya esta eliminada!`, HttpStatus.BAD_REQUEST);
  }

  orderDetail.isActive = false;

  // Restaurar stock del producto
  const product = orderDetail.product;
  product.stock -= orderDetail.quantity;
  await this.productRepo.save(product);

  // Eliminar OrderDetail
  await this.orderDetailRepo.save(orderDetail);
}

async active(id: number): Promise<void> {
  const orderDetail = await this.orderDetailRepo.findOne({ 
    where: { id },
    relations: ['product']
  });

  if (!orderDetail) {
    throw new HttpException(`OrderDetail con ID ${id} no encontrado`, HttpStatus.NOT_FOUND);
  }

  if (orderDetail.isActive === true) {
    throw new HttpException(`OrderDetail con ID ${id} ya esta activa!`, HttpStatus.BAD_REQUEST);
  }

  orderDetail.isActive = true;

  // Restaurar stock del producto
  const product = orderDetail.product;
  product.stock += orderDetail.quantity;
  await this.productRepo.save(product);

  // Eliminar OrderDetail
  await this.orderDetailRepo.save(orderDetail);
}

}