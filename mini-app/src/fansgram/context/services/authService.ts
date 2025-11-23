// Services pour l'authentification
import axios from "axios";
import { API_BASE } from "../../../config/api";
import type { AuthResponse } from "../types";

export const checkAuth = async (initData: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE}/auth/telegram-init`,
    { initData },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

