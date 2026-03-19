import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
