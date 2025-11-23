// Hook pour gérer l'authentification
import { useState, useEffect } from "react";
import { useSignal, initData } from "@tma.js/sdk-react";
import { checkAuth } from "../services/authService";
import { DEFAULT_AVATAR } from "../constants";
import type { User } from "../types";

interface UseAuthReturn {
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: (value: boolean) => void;
  setAuthLoading: (value: boolean) => void;
}

export const useAuth = (initialUser: User): UseAuthReturn => {
  const initDataRaw = useSignal(initData.raw);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(initialUser);

  useEffect(() => {
    if (!initDataRaw) {
      setAuthLoading(false);
      return;
    }

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
          console.log(`✅ Utilisateur authentifié : @${data.dbUser!.username}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initDataRaw]);

  return {
    isAuthenticated,
    authLoading,
    user,
    setUser,
    setIsAuthenticated,
    setAuthLoading,
  };
};

