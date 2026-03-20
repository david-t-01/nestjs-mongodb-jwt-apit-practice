import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { ImageFileValidationPipe } from '../storage/pipes/image-file-validation.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/search-products.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product with an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ description: 'Product created', status: 201, type: Product })
  @ApiResponse({ description: 'Bad request / Invalid file type', status: 400 })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(
    @Body() dto: Omit<CreateProductDto, 'image'>,
    @UploadedFile(new ImageFileValidationPipe())
    file: Express.Multer.File,
  ): Promise<Product> {
    return this.productsService.create(dto, file);
  }

  @Get(':id')
  @ApiResponse({
    description: 'The found record',
    status: 200,
    type: Product,
  })
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productsService.findOne(id);
  }

  @Get()
  @ApiResponse({
    description: 'List of products',
    status: 200,
    type: [Product],
  })
  @ApiResponse({ description: 'Bad request / Invalid search parameters', status: 400 })
  async search(
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true, // error si envían extras
        transform: true, // convierte tipos (string → number)
        whitelist: true, // elimina campos no definidos
      }),
    )
    query: FindProductsQueryDto,
  ): Promise<Product[]> {
    const { limit, name, page, price_max, price_min, sku, skus, sortBy, status } = query;

    if (price_min !== undefined || price_max !== undefined || name || skus) {
      return this.productsService.searchByCriteria({ limit, name, page, price_max, price_min, skus, sortBy, status });
    }

    if (status || sku) {
      return this.productsService.filter({ limit, page, sku, sortBy, status });
    }

    throw new BadRequestException('Bad request / Invalid search');
  }
}
