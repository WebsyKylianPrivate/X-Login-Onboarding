// src/pages/Fansgram.tsx
import { useEffect, useState } from "react";
import { GameProvider, useGame } from "../fansgram/context/GameContext";
import Header from "../fansgram/components/layout/Header";
import BottomNav from "../fansgram/components/layout/BottomNav";
import Shop from "../fansgram/features/shop/Shop";
import History from "../fansgram/features/history/History";
import Profile from "../fansgram/features/profile/Profile";
import LoginPage from "../fansgram/features/auth/LoginPage";

// Composant Wrapper pour gérer la navigation
const GameApp = () => {
  const { isAuthenticated, refreshAuth } = useGame();
  const [currentView, setCurrentView] = useState("shop"); // 'shop' | 'history' | 'profile'
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor("#000000");
      window.Telegram.WebApp.setBackgroundColor("#000000");
    }
  }, []);

  // Rafraîchir l'auth quand on revient sur la page (après connexion)
  useEffect(() => {
    const handleFocus = () => {
      refreshAuth();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshAuth]);

  // Reset view to shop when connecting
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView("shop");
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  // Afficher LoginPage si demandé
  if (showLogin) {
    return <LoginPage onCancel={() => setShowLogin(false)} />;
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case "history":
        return "History";
      case "profile":
        return "Profile";
      case "shop":
      default:
        return "Items";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header
        title={getHeaderTitle()}
        onRequireLogin={() => setShowLogin(true)}
      />

      <main className="flex-1 w-full">
        {currentView === "shop" && (
          <Shop onRequireLogin={() => setShowLogin(true)} />
        )}
        {currentView === "history" && <History />}
        {currentView === "profile" && <Profile />}
      </main>

      <BottomNav
        currentView={currentView}
        onChange={setCurrentView}
        onRequireLogin={() => setShowLogin(true)}
      />
    </div>
  );
};

export const Fansgram = () => {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
};
