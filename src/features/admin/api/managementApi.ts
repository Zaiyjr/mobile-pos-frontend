import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { EntityId } from "@/features/catalog/model/catalogTypes";

export interface ManagedUser {
  id: EntityId;
  name?: string;
  email?: string;
  phone?: string;
  role?: { id?: EntityId; name?: string } | string;
  isActive?: boolean;
}

export const managementApi = {
  async listUsers() {
    const { data } = await apiClient.get<ApiEnvelope<ManagedUser[]>>("/users");
    return data.data;
  },
  async createUser(input: Record<string, string>) {
    const { data } = await apiClient.post<ApiEnvelope<ManagedUser>>("/users", input);
    return data.data;
  },
  updateUser(id: EntityId, input: Record<string, string>) {
    return apiClient.put<ApiEnvelope<ManagedUser>>(`/users/${id}`, input);
  },
  updateUserRole(id: EntityId, role: string) {
    return apiClient.put<ApiEnvelope<ManagedUser>>(`/users/${id}/role`, { role });
  },
  updateUserStatus(id: EntityId, isActive: boolean) {
    return apiClient.put<ApiEnvelope<ManagedUser>>(`/users/${id}/status`, { isActive });
  },
  deleteUser(id: EntityId) {
    return apiClient.delete<ApiEnvelope<unknown>>(`/users/${id}`);
  },
};
