import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { Order } from '@/orders/entities/order.entity';
import { OrdersService } from '@/orders/orders.service';
import { Product } from '@/products/entities/product.entity';

const PRODUCT_A_ID = new Types.ObjectId();
const ORDER_ID = new Types.ObjectId();

function createMockModels() {
  const existingOrder = {
    clientName: 'John Doe',
    id: ORDER_ID,
    identifier: 'ORD-001',
    products: [{ productId: PRODUCT_A_ID, quantity: 2 }],
    toObject: jest.fn(),
    total: 59.98,
  };
  existingOrder.toObject.mockReturnValue({
    clientName: existingOrder.clientName,
    id: ORDER_ID,
    identifier: existingOrder.identifier,
    products: existingOrder.products,
    total: existingOrder.total,
  });

  const orderChainable = {
    exec: jest.fn().mockResolvedValue(existingOrder),
  };

  const orderModel: any = jest.fn();
  orderModel.findById = jest.fn().mockReturnValue(orderChainable);

  const productModel: any = {};

  return { existingOrder, orderChainable, orderModel, productModel };
}

describe('OrdersService — findOne()', () => {
  let service: OrdersService;
  let mocks: ReturnType<typeof createMockModels>;

  beforeEach(async () => {
    mocks = createMockModels();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mocks.orderModel },
        { provide: getModelToken(Product.name), useValue: mocks.productModel },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return an order by ID', async () => {
    const result = await service.findOne(ORDER_ID.toString());

    expect(mocks.orderModel.findById).toHaveBeenCalledWith(ORDER_ID.toString());
    expect(result.identifier).toBe('ORD-001');
    expect(result.clientName).toBe('John Doe');
    expect(result.total).toBe(59.98);
  });

  it('should throw NotFoundException when order does not exist', async () => {
    mocks.orderChainable.exec.mockResolvedValueOnce(null);

    await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should call toObject() on the found document', async () => {
    await service.findOne(ORDER_ID.toString());

    expect(mocks.existingOrder.toObject).toHaveBeenCalled();
  });
});
