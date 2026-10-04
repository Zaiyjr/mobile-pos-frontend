import { create } from "zustand";
import { checkoutSale } from "../application/checkoutService";
import type { CartItem, ReceiptData } from "./posTypes";
import type { Product } from "@/features/catalog/model/catalogTypes";

interface PosState {
  cart: CartItem[];
  search: string;
  customerPhone: string;
  loading: boolean;
  error: string | null;
  receipt: ReceiptData | null;
  setSearch: (query: string) => void;
  setCustomerPhone: (phone: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: Product["id"]) => void;
  updateIMEI: (id: Product["id"], imei: string) => void;
  clearCart: () => void;
  setReceipt: (receipt: ReceiptData | null) => void;
  checkout: (refreshProducts: () => Promise<void>) => Promise<void>;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [], search: "", customerPhone: "", loading: false, error: null, receipt: null,
  setSearch: (search) => set({ search }),
  setCustomerPhone: (customerPhone) => set({ customerPhone }),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    return existing
      ? { cart: state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) }
      : { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
  updateIMEI: (id, imei) => set((state) => ({ cart: state.cart.map((item) => item.id === id ? { ...item, imei } : item) })),
  clearCart: () => set({ cart: [] }),
  setReceipt: (receipt) => set({ receipt }),
  checkout: async (refreshProducts) => {
    const { cart, customerPhone } = get();
    set({ loading: true, error: null });
    try {
      const receipt = await checkoutSale(cart, customerPhone);
      set({ receipt, cart: [], customerPhone: "" });
      await refreshProducts();
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : "ປິດບິນຂາຍບໍ່ສຳເລັດ" });
    } finally {
      set({ loading: false });
    }
  },
}));
