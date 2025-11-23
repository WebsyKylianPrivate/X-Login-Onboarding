// src/types/wallet.ts

export interface Wallet {
  tg_user_id: number;
  diamonds: number;
  spent_total: number;
  created_at: string;
  updated_at: string;
}

export interface WalletCheckResponse {
  ok: boolean;
  wallet?: Wallet | null;
  error?: string;
}
