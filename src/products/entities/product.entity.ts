import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

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
export class Product {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Mouse',
  })
  @Prop({
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'WM-001',
  })
  @Prop({
    required: true,
    unique: true,
  })
  sku: string;

  @ApiProperty({
    description: 'The Mongo ObjectId referencing the stored image',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({
    type: Types.ObjectId,
  })
  imageId: Types.ObjectId;

  @ApiProperty({
    description: 'The price of the product',
    example: 29.99,
  })
  @Prop({
    required: true,
  })
  price: number;

  @ApiProperty({
    description: 'The status of the product',
    example: 'active',
  })
  @Prop({
    default: 'active',
    required: true,
  })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
