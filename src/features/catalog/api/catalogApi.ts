import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { CatalogLabel, EntityId, ProductFormInput, ProductRecord } from "../model/catalogTypes";

export const catalogApi = {
  async listProducts() {
    const { data } = await apiClient.get<ApiEnvelope<ProductRecord[]>>("/products");
    return data.data;
  },
  async listCategories() {
    const { data } = await apiClient.get<ApiEnvelope<CatalogLabel[]>>("/categories");
    return data.data;
  },
  async listBrands() {
    const { data } = await apiClient.get<ApiEnvelope<CatalogLabel[]>>("/brands");
    return data.data;
  },
  createCategory(name: string) {
    return apiClient.post<ApiEnvelope<CatalogLabel>>("/categories", { name });
  },
  updateCategory(id: EntityId, name: string) {
    return apiClient.put<ApiEnvelope<CatalogLabel>>(`/categories/${id}`, { name });
  },
  deleteCategory(id: EntityId) {
    return apiClient.delete<ApiEnvelope<unknown>>(`/categories/${id}`);
  },
  createProduct(input: ProductFormInput) {
    return apiClient.post<ApiEnvelope<unknown>>("/products", {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      brandId: input.brandId,
      images: { create: input.imageUrl ? [{ imageUrl: input.imageUrl, isMain: true }] : [] },
      variants: { create: [{ color: "Standard", sku: `SKU-${Date.now()}`, price: input.price, stockQuantity: input.stock }] },
    });
  },
  updateProduct(id: EntityId, input: { name: string; description: string }) {
    return apiClient.put<ApiEnvelope<unknown>>(`/products/${id}`, input);
  },
  deleteProduct(id: EntityId) {
    return apiClient.delete<ApiEnvelope<unknown>>(`/products/${id}`);
  },
};
