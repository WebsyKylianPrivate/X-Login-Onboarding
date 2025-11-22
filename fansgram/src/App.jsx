import React, { useEffect, useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Shop from "@/features/shop/Shop";
import History from "@/features/history/History";
import Profile from "@/features/profile/Profile";
import LoginPage from "@/features/auth/LoginPage";
import AuthorizePage from "@/features/auth/AuthorizePage";

// Composant Wrapper pour gérer la navigation
const GameApp = () => {
  const { user } = useGame();
  const [currentView, setCurrentView] = useState("shop"); // 'shop' | 'history' | 'profile'
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthorize, setShowAuthorize] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor("#000000");
      window.Telegram.WebApp.setBackgroundColor("#000000");
    }
  }, []);

  // Reset view to shop when connecting
  useEffect(() => {
    if (user.isConnected) {
      setCurrentView("shop");
      setShowLogin(false);
      setShowAuthorize(false);
    }
  }, [user.isConnected]);

  // Afficher AuthorizePage si demandé
  if (showAuthorize) {
    return (
      <AuthorizePage
        onLoginSuccess={() => {
          setShowAuthorize(false);
          setShowLogin(false);
        }}
        onCancel={() => {
          setShowAuthorize(false);
          // showLogin reste true pour revenir à LoginPage
        }}
      />
    );
  }

  // Afficher LoginPage si demandé
  if (showLogin) {
    return (
      <LoginPage
        onSignInClick={() => setShowAuthorize(true)}
        onCancel={() => setShowLogin(false)}
      />
    );
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

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;
