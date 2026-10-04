import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/api/client";
import { catalogService } from "../application/catalogService";
import type { CatalogLabel, Product, ProductFormInput } from "./catalogTypes";

interface CatalogState {
  products: Product[];
  categories: CatalogLabel[];
  brands: CatalogLabel[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  createProduct: (input: ProductFormInput) => Promise<boolean>;
  updateProduct: (id: Product["id"], input: { name: string; description: string }) => Promise<boolean>;
  deleteProduct: (id: Product["id"]) => Promise<boolean>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      set({ products: await catalogService.listProducts() });
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to load products") });
    } finally {
      set({ loading: false });
    }
  },
  fetchCategories: async () => {
    try {
      set({ categories: await catalogService.listCategories() });
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to load categories") });
    }
  },
  fetchBrands: async () => {
    try {
      set({ brands: await catalogService.listBrands() });
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to load brands") });
    }
  },
  createProduct: async (input) => {
    set({ loading: true, error: null });
    try {
      await catalogService.createProduct(input);
      await get().fetchProducts();
      return !get().error;
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to create product") });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  updateProduct: async (id, input) => {
    set({ loading: true, error: null });
    try {
      await catalogService.updateProduct(id, input);
      await get().fetchProducts();
      return !get().error;
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to update product") });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await catalogService.deleteProduct(id);
      await get().fetchProducts();
      return !get().error;
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, "Unable to delete product") });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
