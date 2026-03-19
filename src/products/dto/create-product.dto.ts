import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product', example: 'Wireless Mouse' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'Stock Keeping Unit', example: 'WM-001' })
  @IsString()
  readonly sku: string;

  @ApiProperty({ description: 'The price of the product', example: 29.99 })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({
    description: 'Product image file (jpg, jpeg, png, gif, webp)',
    format: 'binary',
    type: 'string',
  })
  readonly image: Express.Multer.File;
}
