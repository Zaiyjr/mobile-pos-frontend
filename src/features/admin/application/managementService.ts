import { managementApi } from "../api/managementApi";
import type { EntityId } from "@/features/catalog/model/catalogTypes";

export const managementService = {
  listUsers: () => managementApi.listUsers(),
  createUser: (input: Record<string, string>) => managementApi.createUser(input),
  updateUser: (id: EntityId, input: Record<string, string>) => managementApi.updateUser(id, input),
  updateUserRole: (id: EntityId, role: string) => managementApi.updateUserRole(id, role),
  updateUserStatus: (id: EntityId, isActive: boolean) => managementApi.updateUserStatus(id, isActive),
  deleteUser: (id: EntityId) => managementApi.deleteUser(id),
};
