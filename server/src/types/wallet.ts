// src/types/wallet.ts

export interface Wallet {
  tg_user_id: number;
  diamonds: number;
  spent_total: number;
  unlocked_items: string[]; // Array of item IDs
  created_at: string;
  updated_at: string;
}

export interface WalletCheckResponse {
  ok: boolean;
  wallet?: Wallet | null;
  error?: string;
}

export interface WalletBuyResponse {
  ok: boolean;
  wallet?: Wallet | null;
  error?: string;
}
