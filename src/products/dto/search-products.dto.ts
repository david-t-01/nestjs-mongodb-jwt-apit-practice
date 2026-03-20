import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Min, Validate } from 'class-validator';

export enum StatusField {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class FindProductsQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/[^a-zA-Z0-9-]/g, '') : value))
  sku?: string;

  @IsOptional()
  @IsEnum(StatusField, { message: 'status must be one of name, sku' })
  status?: StatusField;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    const values = Array.isArray(value) ? value : [value];

    return values.map((v) => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9-]/g, '') : v));
  })
  skus?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsString({
    message: 'sortBy must be one of name, sku',
  })
  @IsIn(['name', 'sku'])
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;
}
