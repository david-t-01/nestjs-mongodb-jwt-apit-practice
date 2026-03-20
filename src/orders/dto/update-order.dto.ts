import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { OrderProductItemDto } from './create-order.dto';

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Name of the client', example: 'Kenility' })
  @IsOptional()
  @IsString()
  readonly clientName?: string;

  @ApiPropertyOptional({
    description: 'Updated array of products with quantity',
    example: [{ productId: '507f1f77bcf86cd799439011', quantity: 3 }],
    type: [OrderProductItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductItemDto)
  readonly products?: OrderProductItemDto[];
}
