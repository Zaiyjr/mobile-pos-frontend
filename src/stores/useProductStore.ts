import { create } from "zustand";
import API from "@/api/axiosInstance";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  categoryId?: number;
  brandId?: number;
  imageUrl?: string;
  variantId?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  createProduct: (data: {
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    price: number;
    stock: number;
    imageUrl: string;
  }) => Promise<boolean>;
  updateProduct: (id: number, data: { name: string; description: string }) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await API.get("/products");
      const raw = res.data.data || [];
      const mapped: Product[] = raw.map((p: any) => {
        const primaryVariant = p.variants?.[0];
        const primaryImage = p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: primaryVariant ? Number(primaryVariant.price) : 0,
          stock: primaryVariant ? primaryVariant.stockQuantity : 0,
          category: p.category?.name || "ທົ່ວໄປ",
          categoryId: p.categoryId,
          brandId: p.brandId,
          imageUrl:
            primaryImage?.imageUrl ||
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
          variantId: primaryVariant?.id,
        };
      });
      set({ products: mapped });
    } catch {
      // Fallback mock data when backend not ready
      set({
        products: [
          { id: 1, name: "iPhone 15 Pro Max", price: 45000000, stock: 10, category: "Mobile", categoryId: 1, brandId: 1, description: "Apple A17 Pro Chip, Titanium Design", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600", variantId: 101 },
          { id: 2, name: "Samsung S24 Ultra", price: 38000000, stock: 8, category: "Mobile", categoryId: 1, brandId: 2, description: "200MP Camera, S Pen Included", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600", variantId: 102 },
          { id: 3, name: "iPad Pro M4", price: 29000000, stock: 5, category: "Tablet", categoryId: 2, brandId: 1, description: "M4 Chip, Ultra Retina XDR Display", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600", variantId: 103 },
          { id: 4, name: "MacBook Air M3", price: 52000000, stock: 3, category: "Laptop", categoryId: 3, brandId: 1, description: "18-hour battery, fanless design", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600", variantId: 104 },
        ],
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await API.get("/categories");
      set({ categories: res.data.data || [] });
    } catch {
      set({ categories: [{ id: 1, name: "Mobile" }, { id: 2, name: "Tablet" }, { id: 3, name: "Laptop" }] });
    }
  },

  fetchBrands: async () => {
    try {
      const res = await API.get("/brands");
      set({ brands: res.data.data || [] });
    } catch {
      set({ brands: [{ id: 1, name: "Apple" }, { id: 2, name: "Samsung" }] });
    }
  },

  createProduct: async (data) => {
    set({ loading: true });
    try {
      await API.post("/products", {
        name: data.name,
        description: data.description,
        categoryId: Number(data.categoryId),
        brandId: Number(data.brandId),
        images: { create: [{ imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600", isMain: true }] },
        variants: { create: [{ color: "Standard", sku: `SKU-${Date.now()}`, price: Number(data.price), stockQuantity: Number(data.stock) }] },
      });
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true });
    try {
      await API.put(`/products/${id}`, data);
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await API.delete(`/products/${id}`);
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
