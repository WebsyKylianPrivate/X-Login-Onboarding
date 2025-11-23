// Services pour le wallet
import axios from "axios";
import { API_BASE } from "../../../config/api";
import type { WalletResponse } from "../types";

export const checkWallet = async (initData: string): Promise<WalletResponse> => {
  const response = await axios.post<WalletResponse>(
    `${API_BASE}/wallet/check`,
    { initData },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

export const buyItem = async (
  initData: string,
  itemId: string,
  shopId: string
): Promise<WalletResponse> => {
  const response = await axios.post<WalletResponse>(
    `${API_BASE}/wallet/buy`,
    { initData, itemId, shopId },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

