import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { EntityId } from "@/features/catalog/model/catalogTypes";

export interface OrderItemRecord {
  id: EntityId;
  quantity: number;
  priceAtTime: number | string;
  variant?: { sku?: string; product?: { name?: string } };
  soldItems?: Array<{ stockItem?: { imei?: string; serialNumber?: string } }>;
}

export interface OrderRecord {
  id: EntityId;
  createdAt: string;
  totalAmount: number | string;
  status?: "PAID" | "CANCELLED" | string;
  employee?: { name?: string };
  customer?: { name?: string; phone?: string } | null;
  items?: OrderItemRecord[];
}

export const ordersApi = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<OrderRecord[]>>("/orders");
    return data.data;
  },
  async get(id: EntityId) {
    const { data } = await apiClient.get<ApiEnvelope<OrderRecord>>(`/orders/${id}`);
    return data.data;
  },
  async cancel(id: EntityId) {
    const { data } = await apiClient.post<ApiEnvelope<OrderRecord>>(`/orders/cancel/${id}`);
    return data.data;
  },
};
