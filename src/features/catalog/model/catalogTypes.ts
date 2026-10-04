export type EntityId = string | number;

export interface Product {
  id: EntityId;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  categoryId?: EntityId;
  brandId?: EntityId;
  imageUrl?: string;
  variantId?: EntityId;
}

export interface CatalogLabel {
  id: EntityId;
  name: string;
}

export interface ProductFormInput {
  name: string;
  description: string;
  categoryId: EntityId;
  brandId: EntityId;
  price: number;
  stock: number;
  imageUrl: string;
}

export type ProductRecord = {
  id: EntityId;
  name: string;
  description?: string | null;
  categoryId?: EntityId;
  brandId?: EntityId;
  category?: { name?: string } | null;
  variants?: Array<{ id: EntityId; price: number | string; stockQuantity: number }>;
  images?: Array<{ imageUrl?: string }>;
};
