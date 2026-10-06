import { useState } from "react";
import { authApi, type RegisterInput } from "@/features/auth/api/authApi";
import { clearAuthSession, saveAuthSession } from "@/features/auth/model/authStorage";
import { getApiErrorMessage } from "@/shared/api/client";

type AuthMode = "customer" | "staff";

const redirectByRole = (roleName?: string) => {
  if (roleName === "ADMIN") {
    window.location.href = "/admin";
    return;
  }

  if (roleName === "CASHIER" || roleName === "EMPLOYEE") {
    window.location.href = "/pos";
    return;
  }

  window.location.href = "/pos";
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, mode: AuthMode = "customer") => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.login(email.trim(), password);

      const role = typeof user.role === "string" ? user.role : user.role?.name;
      if (mode === "staff" && role === "USER") {
        throw new Error("ບັນຊີນີ້ແມ່ນສຳລັບລູກຄ້າ ກະລຸນາເຂົ້າຜ່ານ Customer Login");
      }

      saveAuthSession(token, user);
      redirectByRole(role);
      return true;
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.register(payload);
      saveAuthSession(token, user);
      redirectByRole(typeof user.role === "string" ? user.role : user.role?.name);
      return true;
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ບໍ່ສາມາດສ້າງບັນຊີໄດ້"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return { login, register, logout, loading, error, clearError: () => setError(null) };
};
