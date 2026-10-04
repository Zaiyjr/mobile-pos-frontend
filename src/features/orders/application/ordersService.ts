import { ordersApi } from "../api/ordersApi";
import type { EntityId } from "@/features/catalog/model/catalogTypes";

export const ordersService = {
  list: () => ordersApi.list(),
  get: (id: EntityId) => ordersApi.get(id),
  cancel: (id: EntityId) => ordersApi.cancel(id),
};
