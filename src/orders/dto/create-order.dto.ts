import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsMongoId, IsString, Min, ValidateNested } from 'class-validator';

export class OrderProductItemDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  readonly productId: string;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsInt()
  @Min(1)
  readonly quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Unique identifier for the order', example: 'ORD-001' })
  @IsString()
  readonly identifier: string;

  @ApiProperty({ description: 'Name of the client', example: 'David David' })
  @IsString()
  readonly clientName: string;

  @ApiProperty({
    description: 'Array of products with quantity',
    example: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }],
    type: [OrderProductItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderProductItemDto)
  readonly products: OrderProductItemDto[];
}
