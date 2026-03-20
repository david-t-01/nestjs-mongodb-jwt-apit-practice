import { ProductDocument } from '@/products/entities/product.entity';
import { Model, Types } from 'mongoose';

export interface OrderProductItem {
  productId: Types.ObjectId;
  quantity: number;
}

export async function calculateTotal(items: OrderProductItem[], productModel: Model<ProductDocument>): Promise<number> {
  const productIds = items.map((i) => i.productId);
  const products = await productModel
    .find({ _id: { $in: productIds } })
    .select('price')
    .exec();

  const priceMap = new Map(products.map((p) => [p._id.toString(), p.price]));

  return items.reduce((sum, item) => {
    const price = priceMap.get(item.productId.toString()) ?? 0;
    return parseFloat((sum + price * item.quantity).toFixed(3));
  }, 0);
}
