// Types pour le GameContext

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  message: string;
  type: ToastType;
}

export type HistoryLogType = "unlock" | "earn";

export interface HistoryLog {
  id: number;
  type: HistoryLogType;
  message: string;
  amount: number;
  date: string;
}

export interface User {
  username: string;
  diamonds: number;
  spentTotal: number;
  avatar: string;
  unlockedItems: string[];
  history: HistoryLog[];
  isConnected: boolean;
}

export interface AuthResponse {
  ok: boolean;
  dbUser?: {
    isAuthenticated: boolean;
    username: string;
    avatarUrl?: string | null;
    createdAt?: string;
  };
  error?: string;
}

export interface WalletResponse {
  ok: boolean;
  wallet?: {
    diamonds: number;
    spent_total: number;
    unlocked_items: string[];
  } | null;
  error?: string;
}

export interface UnlockItemResult {
  success: boolean;
  message: string;
}

export interface GameContextValue {
  user: User;
  addDiamonds: (amount: number) => void;
  unlockItem: (itemId: string, price: number) => Promise<UnlockItemResult>;
  showToast: (message: string, type?: ToastType) => void;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  refreshAuth: () => void;
}

