import React, { createContext, useContext, useState, useEffect } from "react";
import { useSignal, initData } from "@tma.js/sdk-react";
import axios from "axios";
import profileImage from "../assets/IMG_9292.jpg";
import Toast from "../components/ui/Toast";

const GameContext = createContext();

const API_BASE = "https://juiceless-hyo-pretechnical.ngrok-free.dev/api";

export const GameProvider = ({ children }) => {
  const initDataRaw = useSignal(initData.raw);
  const [toast, setToast] = useState(null); // { message, type }
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    username: "@ourfavaddict",
    diamonds: 300,
    avatar: profileImage,
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
            isConnected: true,
          }));
          console.log(`✅ Utilisateur authentifié : @${data.dbUser.username}`);
        } else {
          setIsAuthenticated(false);
          setUser((prev) => ({ ...prev, isConnected: false }));
          console.log("ℹ️ Utilisateur non authentifié");
        }
      })
      .catch((err) => {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
        setUser((prev) => ({ ...prev, isConnected: false }));
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [initDataRaw]);

  const login = () => {
    setUser((prev) => ({ ...prev, isConnected: true }));
  };

  const logout = () => {
    setUser((prev) => ({ ...prev, isConnected: false }));
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

  const unlockItem = (itemId, price) => {
    if (user.unlockedItems.includes(itemId))
      return { success: false, message: "Already unlocked" };
    if (user.diamonds < price)
      return { success: false, message: "Not enough diamonds" };

    setUser((prev) => ({
      ...prev,
      diamonds: prev.diamonds - price,
      unlockedItems: [...prev.unlockedItems, itemId],
    }));
    addLog("unlock", "Item unlocked", -price);
    return { success: true, message: "Item unlocked! ✨" };
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
                    isConnected: true,
                  }));
                } else {
                  setIsAuthenticated(false);
                  setUser((prev) => ({ ...prev, isConnected: false }));
                }
              })
              .catch((err) => {
                console.error("Auth refresh error:", err);
                setIsAuthenticated(false);
                setUser((prev) => ({ ...prev, isConnected: false }));
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
