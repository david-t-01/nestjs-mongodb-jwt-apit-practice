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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ImageFileValidationPipe } from '../storage/pipes/image-file-validation.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { FindProductsQueryDto } from './dto/search-products.dto';

@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a product with an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request / Invalid file type' })
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
    status: 200,
    description: 'The found record',
    type: Product,
  })
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productsService.findOne(id);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [Product],
  })
  async search(
    @Query(
      new ValidationPipe({
        whitelist: true, // elimina campos no definidos
        forbidNonWhitelisted: true, // error si envían extras
        transform: true, // convierte tipos (string → number)
      })
    ) query: FindProductsQueryDto
  ): Promise<Product[]> {
    const { name, sku, status, skus, price_min, price_max, page, limit, sortBy } = query;

    if (price_min !== undefined || price_max !== undefined || name || skus) {
      return this.productsService.searchByCriteria({ name, price_min, price_max, skus, status, page, limit, sortBy });
    }

    if (status || sku) {
      return this.productsService.filter({ sku, status, page, limit, sortBy });
    }

    throw new BadRequestException('Bad request / Invalid search');
  }
}
