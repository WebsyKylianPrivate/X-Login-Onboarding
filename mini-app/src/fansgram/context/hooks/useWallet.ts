// Hook pour gérer le wallet
import { useEffect } from "react";
import { useSignal, initData } from "@tma.js/sdk-react";
import { checkWallet } from "../services/walletService";
import type { User } from "../types";

interface UseWalletProps {
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const useWallet = ({ isAuthenticated, setUser }: UseWalletProps): void => {
  const initDataRaw = useSignal(initData.raw);

  useEffect(() => {
    if (!isAuthenticated || !initDataRaw) {
      // Si non authentifié, remettre les diamants à 300 par défaut
      if (!isAuthenticated) {
        setUser((prev) => ({
          ...prev,
          diamonds: 300,
          spentTotal: 0,
          unlockedItems: [],
        }));
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps

    // Récupérer les vrais diamants depuis l'API
    checkWallet(initDataRaw)
      .then((data) => {
        if (data.ok && data.wallet) {
          setUser((prev) => ({
            ...prev,
            diamonds: data.wallet!.diamonds ?? 300,
            spentTotal: data.wallet!.spent_total ?? 0,
            unlockedItems: data.wallet!.unlocked_items ?? [],
          }));
          console.log(`💎 Diamants récupérés : ${data.wallet!.diamonds}`);
          console.log(`💰 Spent total récupéré : ${data.wallet!.spent_total}`);
          console.log(
            `🔓 Items débloqués : ${data.wallet!.unlocked_items?.length || 0}`
          );
        } else {
          // Si pas de wallet, garder 300 par défaut
          setUser((prev) => ({
            ...prev,
            diamonds: 300,
            spentTotal: 0,
            unlockedItems: [],
          }));
        }
      })
      .catch((err) => {
        console.error("Wallet check error:", err);
        // En cas d'erreur, garder 300 par défaut
        setUser((prev) => ({
          ...prev,
          diamonds: 300,
          spentTotal: 0,
          unlockedItems: [],
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, initDataRaw]);
};

