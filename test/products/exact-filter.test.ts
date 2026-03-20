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

describe('ProductsService — filter() exact match', () => {
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

  it('should filter by exact sku', async () => {
    await service.filter({ sku: 'MT-001' });

    expect(model.find).toHaveBeenCalledWith(expect.objectContaining({ sku: 'MT-001' }));
  });

  it('should filter by exact status', async () => {
    await service.filter({ status: 'disabled' });

    expect(model.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'disabled' }));
  });

  it('should filter by sku AND status together', async () => {
    await service.filter({ sku: 'MT-001', status: 'active' });

    const query = model.find.mock.calls[0][0];
    expect(query).toEqual(expect.objectContaining({ sku: 'MT-001', status: 'active' }));
  });

  it('should default to status=active when no params provided', async () => {
    await service.filter({});

    expect(model.find).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should support pagination, sorting & limit', async () => {
    await service.filter({ limit: 20, page: 2, sku: 'MT-001', sortBy: 'name' });

    expect(chainable.skip).toHaveBeenCalledWith(20);
    expect(chainable.limit).toHaveBeenCalledWith(20);
    expect(chainable.sort).toHaveBeenCalledWith({ name: 1 });
  });
});
