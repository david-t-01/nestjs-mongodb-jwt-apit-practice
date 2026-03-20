import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '@/products/entities/product.entity';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { Order, OrderDocument } from '@/orders/entities/order.entity';
import { calculateTotal } from './utils/ordersUtils';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const items = dto.products.map((p) => ({
      productId: new Types.ObjectId(p.productId),
      quantity: p.quantity,
    }));
    const total = await calculateTotal(items, this.productModel);

    const order = new this.orderModel({
      clientName: dto.clientName,
      identifier: dto.identifier,
      products: items,
      total,
    });

    const saved = await order.save();
    return saved.toObject();
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    if (dto.clientName !== undefined) {
      order.clientName = dto.clientName;
    }

    if (dto.products !== undefined) {
      const items = dto.products.map((p) => ({
        productId: new Types.ObjectId(p.productId),
        quantity: p.quantity,
      }));
      order.products = items;
      order.total = await calculateTotal(items, this.productModel);
    }

    const saved = await order.save();
    return saved.toObject();
  }

  async findOne(id: string): Promise<Order> {
    const doc = await this.orderModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Order ${id} not found`);
    return doc.toObject();
  }

  async balanceLastMonth(): Promise<{ total: number }> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const result = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo, $lte: now } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    return { total: result.length > 0 ? parseFloat(result[0].total.toFixed(3)) : 0 };
  }

  async bestLastMonth(): Promise<Order | null> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const docs = await this.orderModel
      .find({ createdAt: { $gte: oneMonthAgo, $lte: now } })
      .sort({ total: -1 })
      .limit(1)
      .exec();

    return docs.length > 0 ? docs[0].toObject() : null;
  }
}
