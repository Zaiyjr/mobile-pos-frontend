import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { AuthUser } from "../model/authStorage";

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
}

export const authApi = {
  async login(username: string, password: string) {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/login", { username, password });
    return response.data.data;
  },
  async register(input: RegisterInput) {
    await apiClient.post<ApiEnvelope<unknown>>("/auth/register", input);
  },
};
