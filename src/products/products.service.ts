import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StorageService } from '@/storage/storage.service';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { Product, ProductDocument } from '@/products/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly storageService: StorageService,
  ) { }

  async create(
    dto: Omit<CreateProductDto, 'image'>,
    file: Express.Multer.File,
  ): Promise<Product> {
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
}
