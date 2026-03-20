import { Types } from 'mongoose';
import { calculateTotal, OrderProductItem } from '@/orders/utils/ordersUtils';

function createMockProductModel(products: { _id: Types.ObjectId; price: number }[]) {
  const chainable = {
    exec: jest.fn().mockResolvedValue(products),
    select: jest.fn().mockReturnThis(),
  };

  return {
    find: jest.fn().mockReturnValue(chainable),
  } as any;
}

describe('calculateTotal()', () => {
  const PRODUCT_A = new Types.ObjectId();
  const PRODUCT_B = new Types.ObjectId();
  const PRODUCT_C = new Types.ObjectId();

  it('should calculate total as sum of price * quantity for each item', async () => {
    const model = createMockProductModel([
      { _id: PRODUCT_A, price: 10 },
      { _id: PRODUCT_B, price: 25.5 },
    ]);

    const items: OrderProductItem[] = [
      { productId: PRODUCT_A, quantity: 2 },
      { productId: PRODUCT_B, quantity: 3 },
    ];

    const total = await calculateTotal(items, model);
    expect(total).toBe(96.5);
  });

  it('should return 0 for empty items', async () => {
    const model = createMockProductModel([]);

    const total = await calculateTotal([], model);
    expect(total).toBe(0);
  });

  it('should treat missing products (price 0) gracefully', async () => {
    const model = createMockProductModel([{ _id: PRODUCT_A, price: 15 }]);

    const items: OrderProductItem[] = [
      { productId: PRODUCT_A, quantity: 1 },
      { productId: PRODUCT_B, quantity: 3 },
    ];

    const total = await calculateTotal(items, model);
    expect(total).toBe(15);
  });

  it('should handle quantity of 1 correctly', async () => {
    const model = createMockProductModel([{ _id: PRODUCT_A, price: 49.99 }]);

    const items: OrderProductItem[] = [{ productId: PRODUCT_A, quantity: 1 }];

    const total = await calculateTotal(items, model);
    expect(total).toBe(49.99);
  });

  it('should multiply price by quantity for each product', async () => {
    const model = createMockProductModel([
      { _id: PRODUCT_A, price: 100 },
      { _id: PRODUCT_B, price: 50 },
      { _id: PRODUCT_C, price: 25 },
    ]);

    const items: OrderProductItem[] = [
      { productId: PRODUCT_A, quantity: 1 },
      { productId: PRODUCT_B, quantity: 2 },
      { productId: PRODUCT_C, quantity: 4 },
    ];

    const total = await calculateTotal(items, model);
    expect(total).toBe(300);
  });
});
