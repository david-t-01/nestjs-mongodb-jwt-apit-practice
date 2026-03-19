import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
  },
})
export class Product {
  @ApiProperty({ example: 'Wireless Mouse', description: 'The name of the product' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'WM-001', description: 'Stock Keeping Unit' })
  @Prop({ required: true, unique: true })
  sku: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'The Mongo ObjectId referencing the stored image',
  })
  @Prop({ type: Types.ObjectId })
  imageId: Types.ObjectId;

  @ApiProperty({ example: 29.99, description: 'The price of the product' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ example: 'active', description: 'The status of the product' })
  @Prop({ required: true, default: 'active' })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
