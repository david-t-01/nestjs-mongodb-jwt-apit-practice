import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ProductsService } from "@/products/products.service";
import { Product } from "@/products/entities/product.entity";
import { StorageService } from "@/storage/storage.service";

function createMockModel() {
  const chainable = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  const model: any = {
    find: jest.fn().mockReturnValue(chainable),
    ...chainable,
  };

  return { model, chainable };
}

describe("ProductsService — search & filter", () => {
  let service: ProductsService;
  let model: ReturnType<typeof createMockModel>["model"];
  let chainable: ReturnType<typeof createMockModel>["chainable"];

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

  describe("searchByCriteria() — criteria-based", () => {
    it("should search by name with case-insensitive regex", async () => {
      await service.searchByCriteria({ name: "apple" });

      const query = model.find.mock.calls[0][0];
      expect(query.name).toEqual({ $regex: "apple", $options: "i" });
    });

    it("should search by price range (min and max)", async () => {
      await service.searchByCriteria({ price_min: 100, price_max: 500 });

      const query = model.find.mock.calls[0][0];
      expect(query.price).toEqual({ $gte: 100, $lte: 500 });
    });

    it("should search by price_min only", async () => {
      await service.searchByCriteria({ price_min: 50 });

      const query = model.find.mock.calls[0][0];
      expect(query.price).toEqual({ $gte: 50 });
    });

    it("should search by price_max only", async () => {
      await service.searchByCriteria({ price_max: 200 });

      const query = model.find.mock.calls[0][0];
      expect(query.price).toEqual({ $lte: 200 });
    });

    it("should search by skus patterns using $or with $regex", async () => {
      await service.searchByCriteria({ skus: ["MT-", "HJM"] });

      const query = model.find.mock.calls[0][0];
      expect(query.$or).toEqual([
        { sku: { $regex: "^MT-", $options: "i" } },
        { sku: { $regex: "^HJM", $options: "i" } },
      ]);
    });

    it("should search by single sku pattern", async () => {
      await service.searchByCriteria({ skus: ["WM-"] });

      const query = model.find.mock.calls[0][0];
      expect(query.$or).toEqual([{ sku: { $regex: "^WM-", $options: "i" } }]);
    });

    it("should combine name, price range and skus", async () => {
      await service.searchByCriteria({
        name: "mouse",
        price_min: 10,
        price_max: 100,
        skus: ["MT-"],
      });

      const query = model.find.mock.calls[0][0];
      expect(query.name).toEqual({ $regex: "mouse", $options: "i" });
      expect(query.price).toEqual({ $gte: 10, $lte: 100 });
      expect(query.$or).toEqual([{ sku: { $regex: "^MT-", $options: "i" } }]);
    });

    it("should always include status=active by default", async () => {
      await service.searchByCriteria({});

      const query = model.find.mock.calls[0][0];
      expect(query.status).toBe("active");
    });

    it("should allow overriding status", async () => {
      await service.searchByCriteria({ status: "inactive" });

      const query = model.find.mock.calls[0][0];
      expect(query.status).toBe("inactive");
    });
  });

  describe("pagination, sorting & limit", () => {
    it("should apply default limit when not specified", async () => {
      await service.searchByCriteria({ name: "test" });

      expect(chainable.limit).toHaveBeenCalledWith(10);
    });

    it("should apply provided limit", async () => {
      await service.searchByCriteria({ name: "test", limit: 50 });

      expect(chainable.limit).toHaveBeenCalledWith(50);
    });

    it("should apply skip based on page and limit", async () => {
      await service.searchByCriteria({ name: "test", page: 3, limit: 20 });

      expect(chainable.skip).toHaveBeenCalledWith(40);
    });

    it("should default to page 1 (skip 0)", async () => {
      await service.searchByCriteria({ name: "test" });

      expect(chainable.skip).toHaveBeenCalledWith(0);
    });

    it("should apply sort by name", async () => {
      await service.searchByCriteria({ name: "test", sortBy: "name" });

      expect(chainable.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it("should apply sort by sku", async () => {
      await service.searchByCriteria({ name: "test", sortBy: "sku" });

      expect(chainable.sort).toHaveBeenCalledWith({ sku: 1 });
    });

    it("should not call sort when sortBy is not provided", async () => {
      await service.searchByCriteria({ name: "test" });

      expect(chainable.sort).not.toHaveBeenCalled();
    });
  });
});
