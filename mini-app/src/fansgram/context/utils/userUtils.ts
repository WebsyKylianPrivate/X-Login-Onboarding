// Utilitaires pour la gestion de l'utilisateur
import type { User, HistoryLog, HistoryLogType } from "../types";

export const createHistoryLog = (
  type: HistoryLogType,
  message: string,
  amount: number
): HistoryLog => {
  return {
    id: Date.now(),
    type,
    message,
    amount,
    date: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export const addDiamondsToUser = (
  user: User,
  amount: number,
  addLog: (log: HistoryLog) => void
): User => {
  addLog(createHistoryLog("earn", "Diamonds earned", amount));
  return {
    ...user,
    diamonds: user.diamonds + amount,
  };
};

