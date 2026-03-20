import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { Order } from '@/orders/entities/order.entity';
import { OrdersService } from '@/orders/orders.service';
import { Product } from '@/products/entities/product.entity';

const ORDER_A_ID = new Types.ObjectId();
const ORDER_B_ID = new Types.ObjectId();

function createMockModels() {
  const orderChainable = {
    exec: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  const orderModel: any = jest.fn();
  orderModel.aggregate = jest.fn().mockResolvedValue([]);
  orderModel.find = jest.fn().mockReturnValue(orderChainable);

  const productModel: any = {};

  return { orderChainable, orderModel, productModel };
}

describe('OrdersService — stats endpoints', () => {
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

  describe('balanceLastMonth()', () => {
    it('should return total sold price from aggregation', async () => {
      mocks.orderModel.aggregate.mockResolvedValueOnce([{ _id: null, total: 350.5 }]);

      const result = await service.balanceLastMonth();

      expect(result).toEqual({ total: 350.5 });
    });

    it('should return total 0 when no orders found', async () => {
      mocks.orderModel.aggregate.mockResolvedValueOnce([]);

      const result = await service.balanceLastMonth();

      expect(result).toEqual({ total: 0 });
    });

    it('should filter by createdAt within last month', async () => {
      await service.balanceLastMonth();

      const pipeline = mocks.orderModel.aggregate.mock.calls[0][0];
      const matchStage = pipeline[0].$match;

      expect(matchStage.createdAt).toBeDefined();
      expect(matchStage.createdAt.$gte).toBeInstanceOf(Date);
      expect(matchStage.createdAt.$lte).toBeInstanceOf(Date);

      const oneMonthAgo = matchStage.createdAt.$gte;
      const now = matchStage.createdAt.$lte;
      const diffMs = now.getTime() - oneMonthAgo.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(28);
      expect(diffDays).toBeLessThanOrEqual(31);
    });

    it('should use $sum on total field in $group stage', async () => {
      await service.balanceLastMonth();

      const pipeline = mocks.orderModel.aggregate.mock.calls[0][0];
      const groupStage = pipeline[1].$group;

      expect(groupStage._id).toBeNull();
      expect(groupStage.total).toEqual({ $sum: '$total' });
    });
  });

  describe('bestLastMonth()', () => {
    it('should return the order with highest total', async () => {
      const bestOrder = {
        clientName: 'VIP Client',
        id: ORDER_A_ID,
        identifier: 'ORD-100',
        toObject: jest.fn().mockReturnValue({
          clientName: 'VIP Client',
          id: ORDER_A_ID,
          identifier: 'ORD-100',
          total: 999.99,
        }),
        total: 999.99,
      };
      mocks.orderChainable.exec.mockResolvedValueOnce([bestOrder]);

      const result = await service.bestLastMonth();

      expect(result).toBeDefined();
      expect(result!.total).toBe(999.99);
      expect(result!.identifier).toBe('ORD-100');
    });

    it('should return null when no orders found', async () => {
      mocks.orderChainable.exec.mockResolvedValueOnce([]);

      const result = await service.bestLastMonth();

      expect(result).toBeNull();
    });

    it('should sort by total descending and limit to 1', async () => {
      await service.bestLastMonth();

      expect(mocks.orderChainable.sort).toHaveBeenCalledWith({ total: -1 });
      expect(mocks.orderChainable.limit).toHaveBeenCalledWith(1);
    });

    it('should filter by createdAt within last month', async () => {
      await service.bestLastMonth();

      const query = mocks.orderModel.find.mock.calls[0][0];
      expect(query.createdAt).toBeDefined();
      expect(query.createdAt.$gte).toBeInstanceOf(Date);
      expect(query.createdAt.$lte).toBeInstanceOf(Date);
    });
  });
});
