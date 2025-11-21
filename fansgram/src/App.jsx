import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/context/GameContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Shop from '@/features/shop/Shop';
import History from '@/features/history/History';
import Profile from '@/features/profile/Profile';
import LoginPage from '@/features/auth/LoginPage';

// Composant Wrapper pour gérer la navigation
const GameApp = () => {
  const { user } = useGame();
  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'history' | 'profile'

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }
  }, []);

  // Reset view to shop when connecting
  useEffect(() => {
    if (user.isConnected) {
      setCurrentView('shop');
    }
  }, [user.isConnected]);

  if (!user.isConnected) {
    return <LoginPage />;
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'history': return 'History';
      case 'profile': return 'Profile';
      case 'shop':
      default: return 'Items';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header title={getHeaderTitle()} />
      
      <main className="flex-1 w-full">
        {currentView === 'shop' && <Shop />}
        {currentView === 'history' && <History />}
        {currentView === 'profile' && <Profile />}
      </main>

      <BottomNav currentView={currentView} onChange={setCurrentView} />
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
