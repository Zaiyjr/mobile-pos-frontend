import { create } from "zustand";
import API from "@/api/axiosInstance";
import type { Product } from "./useProductStore";

export interface CartItem extends Product {
  quantity: number;
  imei?: string;
}

interface PosState {
  cart: CartItem[];
  search: string;
  customerPhone: string;
  loading: boolean;
  receipt: any | null;

  setSearch: (query: string) => void;
  setCustomerPhone: (phone: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateIMEI: (id: number, imei: string) => void;
  clearCart: () => void;
  setReceipt: (receipt: any | null) => void;
  checkout: (refreshProducts: () => void) => Promise<void>;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  search: "",
  customerPhone: "",
  loading: false,
  receipt: null,

  setSearch: (search) => set({ search }),
  setCustomerPhone: (customerPhone) => set({ customerPhone }),

  addToCart: (product) => set((state) => {
    const exist = state.cart.find((item) => item.id === product.id);
    if (exist) {
      return { cart: state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

  updateIMEI: (id, imei) => set((state) => ({
    cart: state.cart.map((item) => item.id === id ? { ...item, imei } : item)
  })),

  clearCart: () => set({ cart: [] }),
  setReceipt: (receipt) => set({ receipt }),

  checkout: async (refreshProducts) => {
    const { cart, customerPhone } = get();
    if (cart.length === 0) {
      alert("ກະລຸນາເລືອກສິນຄ້າກ່ອນ");
      return;
    }
    set({ loading: true });
    try {
      let customerId: number | undefined;
      if (customerPhone) {
        try {
          const customerRes = await API.get(`/customers/phone/${customerPhone}`);
          if (customerRes.data?.data) {
            customerId = customerRes.data.data.id;
          }
        } catch (err) {
          try {
            const newCustRes = await API.post("/customers", {
              name: `ລູກຄ້າສະມາຊິກ (${customerPhone})`,
              phone: customerPhone
            });
            customerId = newCustRes.data?.data?.id;
          } catch (e) {
            console.error("ສ້າງລູກຄ້າບໍ່ສຳເລັດ:", e);
          }
        }
      }

      const orderItems = [];
      for (const item of cart) {
        let stockItemIds: number[] = [];
        if (item.imei) {
          try {
            const stockCheck = await API.get(`/stocks/check/${item.imei}`);
            if (stockCheck.data?.data) {
              stockItemIds.push(stockCheck.data.data.id);
            }
          } catch (err) {
            console.warn(`ບໍ່ພົບເລກ IMEI: ${item.imei} ໃນຄັງ, ຈະຂາຍເປັນສິນຄ້າທົ່ວໄປ`);
          }
        }

        orderItems.push({
          variantId: item.variantId || item.id,
          quantity: item.quantity,
          priceAtTime: item.price,
          stockItemIds: stockItemIds
        });
      }

      const checkoutPayload = {
        customerId,
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: orderItems
      };

      const res = await API.post("/orders", checkoutPayload);

      if (res.data?.success) {
        set({
          receipt: {
            order: res.data.data,
            items: cart,
            total: checkoutPayload.totalAmount,
            customerPhone: customerPhone || "ລູກຄ້າທົ່ວໄປ"
          },
          cart: [],
          customerPhone: ""
        });
        refreshProducts();
      } else {
        alert("ປິດບິນຂາຍບໍ່ສຳເລັດ");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການປິດບິນຂາຍ");
    } finally {
      set({ loading: false });
    }
  }
}));
