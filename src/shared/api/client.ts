import axios, { type AxiosError } from "axios";
import { getAccessToken } from "@/features/auth/model/authStorage";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ErrorEnvelope {
  message?: string;
  status?: number;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError<ErrorEnvelope>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function isApiError(error: unknown): error is AxiosError<ErrorEnvelope> {
  return axios.isAxiosError(error);
}
