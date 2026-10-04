import type { Product } from "@/features/catalog/model/catalogTypes";

export interface CartItem extends Product {
  quantity: number;
  imei?: string;
}

export interface ReceiptData {
  order: { id: string | number; createdAt?: string };
  items: Array<{ name: string; quantity: number; price: number; imei?: string }>;
  total: number;
  customerPhone: string;
}
