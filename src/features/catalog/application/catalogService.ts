import { catalogApi } from "../api/catalogApi";
import type { CatalogLabel, Product, ProductFormInput, ProductRecord, EntityId } from "../model/catalogTypes";

const fallbackImage = "https://placehold.co/320x240?text=Product";

export const catalogService = {
  async listProducts(): Promise<Product[]> {
    const records = await catalogApi.listProducts();
    return records.map((record) => {
      const variant = record.variants?.[0];
      return {
        id: record.id,
        name: record.name,
        description: record.description ?? "",
        price: variant ? Number(variant.price) : 0,
        stock: variant?.stockQuantity ?? 0,
        category: record.category?.name ?? "ທົ່ວໄປ",
        categoryId: record.categoryId,
        brandId: record.brandId,
        imageUrl: record.images?.[0]?.imageUrl || fallbackImage,
        variantId: variant?.id,
      };
    });
  },
  listProductRecords(): Promise<ProductRecord[]> {
    return catalogApi.listProducts();
  },
  listCategories(): Promise<CatalogLabel[]> {
    return catalogApi.listCategories();
  },
  listBrands(): Promise<CatalogLabel[]> {
    return catalogApi.listBrands();
  },
  createCategory(name: string) {
    return catalogApi.createCategory(name);
  },
  updateCategory(id: EntityId, name: string) {
    return catalogApi.updateCategory(id, name);
  },
  deleteCategory(id: EntityId) {
    return catalogApi.deleteCategory(id);
  },
  createProduct(input: ProductFormInput) {
    return catalogApi.createProduct(input);
  },
  updateProduct(id: Product["id"], input: { name: string; description: string }) {
    return catalogApi.updateProduct(id, input);
  },
  deleteProduct(id: Product["id"]) {
    return catalogApi.deleteProduct(id);
  },
};
