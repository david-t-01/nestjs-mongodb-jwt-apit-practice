import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StorageService } from '@/storage/storage.service';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { Product, ProductDocument } from '@/products/entities/product.entity';

interface PaginationParams {
  limit?: number;
  page?: number;
  sortBy?: string;
}

interface FilterParams extends PaginationParams {
  sku?: string;
  status?: string;
}

interface SearchCriteriaParams extends PaginationParams {
  name?: string;
  price_max?: number;
  price_min?: number;
  skus?: string[];
  status?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: Omit<CreateProductDto, 'image'>, file: Express.Multer.File): Promise<Product> {
    const fileName = await this.storageService.saveFile(file);

    // TODO: reemplazar por el servicio de generación de ID de imagen
    const imageId = new Types.ObjectId();

    const product = new this.productModel({
      ...dto,
      imageId,
    });

    return product.save();
  }

  async findOne(id: string): Promise<Product | null> {
    const doc = await this.productModel.findById(id).exec();
    return doc ? doc.toObject() : null;
  }

  async searchByCriteria(params: SearchCriteriaParams = {}): Promise<Product[]> {
    const { limit, name, page, price_max, price_min, skus, sortBy, status = 'active' } = params;
    const query: Record<string, any> = {};

    if (name) {
      query.name = { $options: 'i', $regex: name };
    }

    if (price_min !== undefined || price_max !== undefined) {
      query.price = {};
      if (price_min !== undefined) query.price.$gte = price_min;
      if (price_max !== undefined) query.price.$lte = price_max;
    }

    if (skus?.length) {
      query.$or = skus.map((pattern) => ({
        sku: { $options: 'i', $regex: `^${pattern}` },
      }));
    }

    query.status = status;

    return this.applyPagination(query, { limit, page, sortBy });
  }

  async filter(params: FilterParams = {}): Promise<Product[]> {
    const { limit, page, sku, sortBy, status = 'active' } = params;
    const query: Record<string, any> = {};

    if (sku) query.sku = sku;
    query.status = status;

    return this.applyPagination(query, { limit, page, sortBy });
  }

  private applyPagination(
    query: Record<string, any>,
    { limit = 10, page = 1, sortBy }: PaginationParams,
  ): Promise<Product[]> {
    const skip = (page - 1) * limit;
    let chain = this.productModel.find(query).skip(skip).limit(limit);

    if (sortBy) {
      chain = chain.sort({ [sortBy]: 1 });
    }

    return chain.exec() as unknown as Promise<Product[]>;
  }
}
