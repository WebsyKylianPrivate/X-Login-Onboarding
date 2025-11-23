import React, { createContext, useContext, useState, useEffect } from "react";
import { useSignal, initData } from "@tma.js/sdk-react";
import axios from "axios";
import Toast from "../components/ui/Toast";
import { API_BASE } from "../../config/api";

// Avatar par défaut standard (comme Twitter/X)
const DEFAULT_AVATAR =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const initDataRaw = useSignal(initData.raw);
  const [toast, setToast] = useState(null); // { message, type }
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    username: "@ourfavaddict",
    diamonds: 300,
    spentTotal: 0,
    avatar: DEFAULT_AVATAR,
    unlockedItems: [],
    history: [],
    isConnected: false,
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!initDataRaw) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);

    axios
      .post(
        `${API_BASE}/auth/telegram-init`,
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        const data = response.data;

        if (data.ok && data.dbUser?.isAuthenticated) {
          setIsAuthenticated(true);
          setUser((prev) => ({
            ...prev,
            username: `@${data.dbUser.username}`,
            avatar: data.dbUser.avatarUrl || DEFAULT_AVATAR,
            isConnected: true,
          }));
          console.log(`✅ Utilisateur authentifié : @${data.dbUser.username}`);
        } else {
          setIsAuthenticated(false);
          setUser((prev) => ({
            ...prev,
            isConnected: false,
            diamonds: 300,
            spentTotal: 0,
            unlockedItems: [],
          }));
          console.log("ℹ️ Utilisateur non authentifié");
        }
      })
      .catch((err) => {
        console.error("Auth check error:", err);
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
  }, [initDataRaw]);

  // Récupérer les vrais diamants quand l'utilisateur est authentifié
  useEffect(() => {
    if (!isAuthenticated || !initDataRaw) {
      // Si non authentifié, remettre les diamants à 300 par défaut
      if (!isAuthenticated) {
        setUser((prev) => ({ ...prev, diamonds: 300, spentTotal: 0, unlockedItems: [] }));
      }
      return;
    }

    // Récupérer les vrais diamants depuis l'API
    axios
      .post(
        `${API_BASE}/wallet/check`,
        { initData: initDataRaw },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        const data = response.data;
        if (data.ok && data.wallet) {
          setUser((prev) => ({
            ...prev,
            diamonds: data.wallet.diamonds ?? 300,
            spentTotal: data.wallet.spent_total ?? 0,
            unlockedItems: data.wallet.unlocked_items ?? [],
          }));
          console.log(`💎 Diamants récupérés : ${data.wallet.diamonds}`);
          console.log(`💰 Spent total récupéré : ${data.wallet.spent_total}`);
          console.log(`🔓 Items débloqués : ${data.wallet.unlocked_items?.length || 0}`);
        } else {
          // Si pas de wallet, garder 300 par défaut
          setUser((prev) => ({ ...prev, diamonds: 300, spentTotal: 0, unlockedItems: [] }));
        }
      })
      .catch((err) => {
        console.error("Wallet check error:", err);
        // En cas d'erreur, garder 300 par défaut
        setUser((prev) => ({ ...prev, diamonds: 300, spentTotal: 0, unlockedItems: [] }));
      });
  }, [isAuthenticated, initDataRaw]);

  const login = () => {
    setUser((prev) => ({ ...prev, isConnected: true }));
  };

  const logout = () => {
    // Ne rien faire - déconnexion désactivée
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const addLog = (type, message, amount) => {
    const newLog = {
      id: Date.now(),
      type, // 'unlock' | 'earn'
      message,
      amount,
      date: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setUser((prev) => ({ ...prev, history: [newLog, ...prev.history] }));
  };

  const addDiamonds = (amount) => {
    setUser((prev) => ({ ...prev, diamonds: prev.diamonds + amount }));
    addLog("earn", "Diamonds earned", amount);
  };

  const unlockItem = async (itemId, price) => {
    if (!initDataRaw) return { success: false, message: "No session" };

    // Déjà unlocked localement
    if (user.unlockedItems.includes(itemId))
      return { success: false, message: "Already unlocked" };

    try {
      const res = await axios.post(`${API_BASE}/wallet/buy`, {
        initData: initDataRaw,
        itemId,
      });

      if (res.data.ok) {
        const w = res.data.wallet;
        setUser((prev) => ({
          ...prev,
          diamonds: w.diamonds,
          spentTotal: w.spent_total,
          unlockedItems: w.unlocked_items,
        }));
        addLog("unlock", "Item unlocked", -price);
        return { success: true, message: "Item unlocked! ✨" };
      }

      return { success: false, message: "Buy failed" };
    } catch (e) {
      const code = e?.response?.data?.error;
      if (code === "NOT_ENOUGH_DIAMONDS")
        return { success: false, message: "Not enough diamonds" };
      if (code === "ALREADY_UNLOCKED")
        return { success: false, message: "Already unlocked" };
      if (code === "ITEM_NOT_FOUND")
        return { success: false, message: "Item not found" };
      return { success: false, message: "Server error" };
    }
  };

  return (
    <GameContext.Provider
      value={{
        user,
        addDiamonds,
        unlockItem,
        showToast,
        login,
        logout,
        isAuthenticated,
        authLoading,
        refreshAuth: () => {
          // Re-vérifier l'auth (peut être appelé après une connexion)
          if (initDataRaw) {
            setAuthLoading(true);
            axios
              .post(
                `${API_BASE}/auth/telegram-init`,
                { initData: initDataRaw },
                { headers: { "Content-Type": "application/json" } }
              )
              .then((response) => {
                const data = response.data;
                if (data.ok && data.dbUser?.isAuthenticated) {
                  setIsAuthenticated(true);
                  setUser((prev) => ({
                    ...prev,
                    username: `@${data.dbUser.username}`,
                    avatar: data.dbUser.avatarUrl || DEFAULT_AVATAR,
                    isConnected: true,
                  }));
                  // Récupérer les vrais diamants après refresh auth
                  return axios.post(
                    `${API_BASE}/wallet/check`,
                    { initData: initDataRaw },
                    { headers: { "Content-Type": "application/json" } }
                  );
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
                if (
                  walletResponse &&
                  walletResponse.data.ok &&
                  walletResponse.data.wallet
                ) {
                  setUser((prev) => ({
                    ...prev,
                    diamonds: walletResponse.data.wallet.diamonds ?? 300,
                    spentTotal: walletResponse.data.wallet.spent_total ?? 0,
                    unlockedItems: walletResponse.data.wallet.unlocked_items ?? [],
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
        },
      }}
    >
      {children}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
