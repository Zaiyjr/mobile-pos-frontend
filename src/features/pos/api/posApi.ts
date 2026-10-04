import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { EntityId } from "@/features/catalog/model/catalogTypes";

interface CustomerRecord { id: EntityId }
interface StockRecord { id: EntityId }
export interface CheckoutItem {
  variantId: EntityId;
  quantity: number;
  priceAtTime: number;
  stockItemIds: EntityId[];
}

export const posApi = {
  async findCustomerByPhone(phone: string) {
    const { data } = await apiClient.get<ApiEnvelope<CustomerRecord>>(`/customers/phone/${encodeURIComponent(phone)}`);
    return data.data;
  },
  async createCustomer(input: { name: string; phone: string }) {
    const { data } = await apiClient.post<ApiEnvelope<CustomerRecord>>("/customers", input);
    return data.data;
  },
  async findStockBySerial(serial: string) {
    const { data } = await apiClient.get<ApiEnvelope<StockRecord>>(`/stocks/check/${encodeURIComponent(serial)}`);
    return data.data;
  },
  async checkout(input: { customerId?: EntityId; totalAmount: number; items: CheckoutItem[] }) {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>("/orders", input);
    return data.data;
  },
};
