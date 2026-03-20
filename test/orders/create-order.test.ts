import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { Order } from '@/orders/entities/order.entity';
import { OrdersService } from '@/orders/orders.service';
import { Product } from '@/products/entities/product.entity';

const PRODUCT_A_ID = new Types.ObjectId();
const PRODUCT_B_ID = new Types.ObjectId();
const ORDER_ID = new Types.ObjectId();

function createMockModels() {
  const savedOrder = {
    clientName: 'John Doe',
    identifier: 'ORD-001',
    products: [
      { productId: PRODUCT_A_ID, quantity: 2 },
      { productId: PRODUCT_B_ID, quantity: 1 },
    ],
    toObject: jest.fn(),
    total: 79.97,
  };
  savedOrder.toObject.mockReturnValue({
    clientName: savedOrder.clientName,
    id: ORDER_ID,
    identifier: savedOrder.identifier,
    products: savedOrder.products,
    total: savedOrder.total,
  });

  const orderModel: any = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(savedOrder),
  }));

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

  return { orderModel, productChainable, productModel, savedOrder };
}

describe('OrdersService — create()', () => {
  let service: OrdersService;
  let orderModel: ReturnType<typeof createMockModels>['orderModel'];
  let productModel: ReturnType<typeof createMockModels>['productModel'];

  beforeEach(async () => {
    const mocks = createMockModels();
    orderModel = mocks.orderModel;
    productModel = mocks.productModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an order and calculate total from products', async () => {
    const dto = {
      clientName: 'John Doe',
      identifier: 'ORD-001',
      products: [
        { productId: PRODUCT_A_ID.toString(), quantity: 2 },
        { productId: PRODUCT_B_ID.toString(), quantity: 1 },
      ],
    };

    const result = await service.create(dto);

    expect(result.identifier).toBe('ORD-001');
    expect(result.clientName).toBe('John Doe');
    expect(result.total).toBe(79.97);
  });

  it('should query product prices by IDs', async () => {
    const dto = {
      clientName: 'John Doe',
      identifier: 'ORD-001',
      products: [{ productId: PRODUCT_A_ID.toString(), quantity: 1 }],
    };

    await service.create(dto);

    expect(productModel.find).toHaveBeenCalledWith({
      _id: { $in: expect.arrayContaining([expect.any(Types.ObjectId)]) },
    });
  });

  it('should pass items with productId and quantity to the order model', async () => {
    const dto = {
      clientName: 'Jane',
      identifier: 'ORD-002',
      products: [{ productId: PRODUCT_A_ID.toString(), quantity: 3 }],
    };

    await service.create(dto);

    const constructorArg = orderModel.mock.calls[0][0];
    expect(constructorArg.identifier).toBe('ORD-002');
    expect(constructorArg.clientName).toBe('Jane');
    expect(constructorArg.products).toEqual(expect.arrayContaining([expect.objectContaining({ quantity: 3 })]));
  });

  it('should call toObject() on the saved document', async () => {
    const mocks = createMockModels();
    const mod = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mocks.orderModel },
        { provide: getModelToken(Product.name), useValue: mocks.productModel },
      ],
    }).compile();

    const svc = mod.get<OrdersService>(OrdersService);

    await svc.create({
      clientName: 'John',
      identifier: 'ORD-003',
      products: [{ productId: PRODUCT_A_ID.toString(), quantity: 1 }],
    });

    expect(mocks.savedOrder.toObject).toHaveBeenCalled();
  });
});
