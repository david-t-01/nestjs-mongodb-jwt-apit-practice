import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Product } from '@/products/entities/product.entity';
import { ProductsService } from '@/products/products.service';
import { StorageService } from '@/storage/storage.service';

function createMockModel() {
  const chainable = {
    exec: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  const model: any = {
    find: jest.fn().mockReturnValue(chainable),
    ...chainable,
  };

  return { chainable, model };
}

describe('ProductsService — findAll()', () => {
  let service: ProductsService;
  let model: ReturnType<typeof createMockModel>['model'];
  let chainable: ReturnType<typeof createMockModel>['chainable'];

  beforeEach(async () => {
    const mock = createMockModel();
    model = mock.model;
    chainable = mock.chainable;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: model },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should filter by status=active by default', async () => {
    await service.findAll({});

    expect(model.find).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should apply default limit=10 and page=1', async () => {
    await service.findAll({});

    expect(chainable.limit).toHaveBeenCalledWith(10);
    expect(chainable.skip).toHaveBeenCalledWith(0);
  });

  it('should apply custom limit and page', async () => {
    await service.findAll({ limit: 20, page: 3 });

    expect(chainable.limit).toHaveBeenCalledWith(20);
    expect(chainable.skip).toHaveBeenCalledWith(40);
  });

  it('should apply sortBy when provided', async () => {
    await service.findAll({ sortBy: 'name' });

    expect(chainable.sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('should not call sort when sortBy is not provided', async () => {
    await service.findAll({});

    expect(chainable.sort).not.toHaveBeenCalled();
  });

  it('should allow overriding status', async () => {
    await service.findAll({ status: 'disabled' });

    expect(model.find).toHaveBeenCalledWith({ status: 'disabled' });
  });
});
