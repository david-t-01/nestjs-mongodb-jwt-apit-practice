import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
    virtuals: true,
  },
  toObject: {
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
    virtuals: true,
  },
})
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'ORD-001',
  })
  @Prop({
    required: true,
    unique: true,
  })
  identifier: string;

  @ApiProperty({
    description: 'Name of the client who placed the order',
    example: 'David David',
  })
  @Prop({
    required: true,
  })
  clientName: string;

  @ApiProperty({
    description: 'Total price of the order',
    example: 159.97,
  })
  @Prop({
    default: 0,
    required: true,
  })
  total: number;

  @ApiProperty({
    description: 'Array of products with quantity',
    example: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }],
    type: 'array',
  })
  @Prop({
    type: [
      {
        _id: false,
        productId: { ref: 'Product', required: true, type: SchemaTypes.ObjectId },
        quantity: { default: 1, min: 1, required: true, type: Number },
      },
    ],
  })
  products: { productId: Types.ObjectId; quantity: number }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
