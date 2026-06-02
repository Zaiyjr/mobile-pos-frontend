import { useState } from "react";
import API from "@/api/axiosInstance";

type AuthMode = "customer" | "staff";

interface RegisterPayload {
  username: string;
  password: string;
  name: string;
}

const redirectByRole = (roleName?: string) => {
  if (roleName === "ADMIN") {
    window.location.href = "/admin";
    return;
  }

  if (roleName === "CASHIER" || roleName === "EMPLOYEE") {
    window.location.href = "/pos";
    return;
  }

  window.location.href = "/shop";
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string, mode: AuthMode = "customer") => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/login", { username, password });
      const { token, user } = res.data.data;

      if (mode === "staff" && user.role?.name === "USER") {
        throw new Error("ບັນຊີນີ້ແມ່ນສຳລັບລູກຄ້າ ກະລຸນາເຂົ້າຜ່ານ Customer Login");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      redirectByRole(user.role?.name);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      await API.post("/auth/register", payload);
      return await login(payload.username, payload.password, "customer");
    } catch (err: any) {
      setError(err.response?.data?.message || "ບໍ່ສາມາດສ້າງບັນຊີໄດ້");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  return { login, register, logout, loading, error, clearError: () => setError(null) };
};
