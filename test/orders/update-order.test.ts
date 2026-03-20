import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from '@/orders/orders.service';
import { Order } from '@/orders/entities/order.entity';
import { Product } from '@/products/entities/product.entity';

const PRODUCT_A_ID = new Types.ObjectId();
const PRODUCT_B_ID = new Types.ObjectId();
const ORDER_ID = new Types.ObjectId();

function createMockModels() {
  const existingOrder = {
    clientName: 'John Doe',
    identifier: 'ORD-001',
    products: [{ productId: PRODUCT_A_ID, quantity: 2 }],
    save: jest.fn(),
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
  existingOrder.save.mockResolvedValue(existingOrder);

  const orderChainable = {
    exec: jest.fn().mockResolvedValue(existingOrder),
  };

  const orderModel: any = jest.fn();
  orderModel.findById = jest.fn().mockReturnValue(orderChainable);

  const productChainable = {
    exec: jest.fn().mockResolvedValue([
      { _id: PRODUCT_A_ID, price: 29.99 },
      { _id: PRODUCT_B_ID, price: 19.99 },
    ]),
    select: jest.fn().mockReturnThis(),
  };

  const productModel: any = {
    find: jest.fn().mockReturnValue(productChainable),
  };

  return { existingOrder, orderChainable, orderModel, productModel };
}

describe('OrdersService — update()', () => {
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

  it('should throw NotFoundException when order does not exist', async () => {
    mocks.orderChainable.exec.mockResolvedValueOnce(null);

    await expect(service.update('nonexistent', { clientName: 'New' })).rejects.toThrow(NotFoundException);
  });

  it('should update clientName only without recalculating total', async () => {
    await service.update(ORDER_ID.toString(), {
      clientName: 'Jane Doe',
    });

    expect(mocks.existingOrder.clientName).toBe('Jane Doe');
    expect(mocks.productModel.find).not.toHaveBeenCalled();
    expect(mocks.existingOrder.save).toHaveBeenCalled();
  });

  it('should update products and recalculate total', async () => {
    mocks.existingOrder.toObject.mockReturnValue({
      clientName: 'John Doe',
      id: ORDER_ID,
      identifier: 'ORD-001',
      products: [
        { productId: PRODUCT_A_ID, quantity: 1 },
        { productId: PRODUCT_B_ID, quantity: 1 },
      ],
      total: 49.98,
    });

    const result = await service.update(ORDER_ID.toString(), {
      products: [
        { productId: PRODUCT_A_ID.toString(), quantity: 1 },
        { productId: PRODUCT_B_ID.toString(), quantity: 1 },
      ],
    });

    expect(mocks.productModel.find).toHaveBeenCalled();
    expect(mocks.existingOrder.save).toHaveBeenCalled();
    expect(result.total).toBe(49.98);
  });

  it('should update both clientName and products', async () => {
    await service.update(ORDER_ID.toString(), {
      clientName: 'Updated Client',
      products: [{ productId: PRODUCT_A_ID.toString(), quantity: 5 }],
    });

    expect(mocks.existingOrder.clientName).toBe('Updated Client');
    expect(mocks.productModel.find).toHaveBeenCalled();
    expect(mocks.existingOrder.save).toHaveBeenCalled();
  });

  it('should call toObject() on the saved document', async () => {
    await service.update(ORDER_ID.toString(), { clientName: 'Test' });

    expect(mocks.existingOrder.toObject).toHaveBeenCalled();
  });
});
