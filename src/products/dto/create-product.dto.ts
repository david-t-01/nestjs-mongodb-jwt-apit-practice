import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'The name of the product' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'WM-001', description: 'Stock Keeping Unit' })
  @IsString()
  readonly sku: string;

  @ApiProperty({ example: 29.99, description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Product image file (jpg, jpeg, png, gif, webp)',
  })
  readonly image: Express.Multer.File;
}
