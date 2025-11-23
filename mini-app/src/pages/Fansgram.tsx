// src/pages/Fansgram.tsx
import { useEffect, useState } from "react";
import { GameProvider, useGame } from "../fansgram/context/GameContext";
import Header from "../fansgram/components/layout/Header";
import BottomNav from "../fansgram/components/layout/BottomNav";
import Shop from "../fansgram/features/shop/Shop";
import History from "../fansgram/features/history/History";
import Profile from "../fansgram/features/profile/Profile";
import Home from "../fansgram/features/home/Home";
import LoginPage from "../fansgram/features/auth/LoginPage";

// Composant Wrapper pour gérer la navigation
const GameApp = () => {
  const { isAuthenticated, refreshAuth } = useGame();
  const [currentView, setCurrentView] = useState<"home" | "shop" | "history" | "profile">("home");
  const [showLogin, setShowLogin] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [selectedShopSlug, setSelectedShopSlug] = useState<string | null>(null);

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

  // Reset view to home when connecting
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView("home");
      setShowLogin(false);
      setSelectedFolderName(null);
      setSelectedShopSlug(null);
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
        return selectedFolderName || "Items";
      case "home":
      default:
        return "Top Folders";
    }
  };

  const handleBack = () => {
    setCurrentView("home");
    setSelectedFolderName(null);
    setSelectedShopSlug(null);
  };

  const handleNavigateToShop = (folderName: string, shopSlug: string) => {
    setSelectedFolderName(folderName);
    setSelectedShopSlug(shopSlug);
    setCurrentView("shop");
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header
        title={getHeaderTitle()}
        onRequireLogin={() => setShowLogin(true)}
        showBackButton={currentView === "shop"}
        onBack={handleBack}
      />

      <main className="flex-1 w-full overflow-y-auto">
        {currentView === "home" && (
          <Home onNavigateToShop={handleNavigateToShop} />
        )}
        {currentView === "shop" && selectedShopSlug && (
          <Shop shopSlug={selectedShopSlug} onRequireLogin={() => setShowLogin(true)} />
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
