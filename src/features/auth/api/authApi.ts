import { apiClient, type ApiEnvelope } from "@/shared/api/client";
import type { AuthUser } from "../model/authStorage";

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/login", { email, password });
    return response.data.data;
  },
  async register(input: RegisterInput): Promise<AuthSession> {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/register", input);
    return response.data.data;
  },
};
