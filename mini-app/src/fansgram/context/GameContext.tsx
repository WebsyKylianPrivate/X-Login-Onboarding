import React, { createContext, useContext, useState, useCallback } from "react";
import { useSignal, initData } from "@tma.js/sdk-react";
import Toast from "../components/ui/Toast";
import { useAuth } from "./hooks/useAuth";
import { useWallet } from "./hooks/useWallet";
import { useToast } from "./hooks/useToast";
import { buyItem, checkWallet } from "./services/walletService";
import { checkAuth } from "./services/authService";
import { createHistoryLog } from "./utils/userUtils";
import { DEFAULT_USER_STATE, DEFAULT_AVATAR } from "./constants";
import type {
  GameContextValue,
  User,
  UnlockItemResult,
  ToastType,
} from "./types";

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initDataRaw = useSignal(initData.raw);
  const { toast, showToast, closeToast } = useToast();
  const {
    isAuthenticated,
    authLoading,
    user,
    setUser,
    setIsAuthenticated,
    setAuthLoading,
  } = useAuth(DEFAULT_USER_STATE);

  // Hook pour charger le wallet
  useWallet({ isAuthenticated, user, setUser });

  const login = useCallback(() => {
    setUser((prev) => ({ ...prev, isConnected: true }));
  }, [setUser]);

  const logout = useCallback(() => {
    // Ne rien faire - déconnexion désactivée
  }, []);

  const addLog = useCallback(
    (type: "unlock" | "earn", message: string, amount: number) => {
      const newLog = createHistoryLog(type, message, amount);
      setUser((prev) => ({
        ...prev,
        history: [newLog, ...prev.history],
      }));
    },
    [setUser]
  );

  const addDiamonds = useCallback(
    (amount: number) => {
      setUser((prev) => ({
        ...prev,
        diamonds: prev.diamonds + amount,
      }));
      addLog("earn", "Diamonds earned", amount);
    },
    [setUser, addLog]
  );

  const unlockItem = useCallback(
    async (itemId: string, price: number, shopId: string): Promise<UnlockItemResult> => {
      if (!initDataRaw) return { success: false, message: "No session" };

      // Déjà unlocked localement
      if (user.unlockedItems.includes(itemId))
        return { success: false, message: "Already unlocked" };

      try {
        const res = await buyItem(initDataRaw, itemId, shopId);

        if (res.ok && res.wallet) {
          setUser((prev) => ({
            ...prev,
            diamonds: res.wallet!.diamonds,
            spentTotal: res.wallet!.spent_total,
            unlockedItems: [...prev.unlockedItems, itemId], // Ajouter le nouvel item débloqué
          }));
          addLog("unlock", "Item unlocked", -price);
          return { success: true, message: "Item unlocked! ✨" };
        }

        return { success: false, message: "Buy failed" };
      } catch (e: any) {
        const code = e?.response?.data?.error;
        if (code === "NOT_ENOUGH_DIAMONDS")
          return { success: false, message: "Not enough diamonds" };
        if (code === "ALREADY_UNLOCKED")
          return { success: false, message: "Already unlocked" };
        if (code === "ITEM_NOT_FOUND")
          return { success: false, message: "Item not found" };
        return { success: false, message: "Server error" };
      }
    },
    [initDataRaw, user.unlockedItems, setUser, addLog]
  );

  const refreshAuth = useCallback(() => {
    // Re-vérifier l'auth (peut être appelé après une connexion)
    if (initDataRaw) {
      setAuthLoading(true);
      checkAuth(initDataRaw)
        .then((data) => {
          if (data.ok && data.dbUser?.isAuthenticated) {
            setIsAuthenticated(true);
            setUser((prev) => ({
              ...prev,
              username: `@${data.dbUser!.username}`,
              avatar: data.dbUser!.avatarUrl || DEFAULT_AVATAR,
              isConnected: true,
            }));
            // Récupérer les vrais diamants après refresh auth
            return checkWallet(initDataRaw);
          } else {
            setIsAuthenticated(false);
            setUser((prev) => ({
              ...prev,
              isConnected: false,
              diamonds: 300,
              spentTotal: 0,
              unlockedItems: [],
            }));
            return null;
          }
        })
        .then((walletResponse) => {
          if (walletResponse?.ok && walletResponse.wallet) {
            setUser((prev) => ({
              ...prev,
              diamonds: walletResponse.wallet!.diamonds ?? 300,
              spentTotal: walletResponse.wallet!.spent_total ?? 0,
              unlockedItems: walletResponse.wallet!.unlocked_items ?? [],
            }));
          }
        })
        .catch((err) => {
          console.error("Auth refresh error:", err);
          setIsAuthenticated(false);
          setUser((prev) => ({
            ...prev,
            isConnected: false,
            diamonds: 300,
            spentTotal: 0,
            unlockedItems: [],
          }));
        })
        .finally(() => {
          setAuthLoading(false);
        });
    }
  }, [initDataRaw, setUser, setIsAuthenticated, setAuthLoading]);

  const value: GameContextValue = {
    user,
    addDiamonds,
    unlockItem,
    showToast,
    login,
    logout,
    isAuthenticated,
    authLoading,
    refreshAuth,
    setUser,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

