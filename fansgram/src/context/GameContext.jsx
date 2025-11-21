import React, { createContext, useContext, useState, useEffect } from 'react';
import profileImage from '@/assets/IMG_9292.jpg';
import Toast from '@/components/ui/Toast';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { message, type }
  const [user, setUser] = useState({
    username: '@ourfavaddict',
    diamonds: 300,
    avatar: profileImage,
    unlockedItems: [],
    history: [],
    isConnected: false
  });

  const login = () => {
    setUser(prev => ({ ...prev, isConnected: true }));
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isConnected: false }));
  };

  const showToast = (message, type = 'success') => {
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
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setUser(prev => ({ ...prev, history: [newLog, ...prev.history] }));
  };

  const addDiamonds = (amount) => {
    setUser(prev => ({ ...prev, diamonds: prev.diamonds + amount }));
    addLog('earn', 'Diamonds earned', amount);
  };

  const unlockItem = (itemId, price) => {
    if (user.unlockedItems.includes(itemId)) return { success: false, message: 'Already unlocked' };
    if (user.diamonds < price) return { success: false, message: 'Not enough diamonds' };

    setUser(prev => ({
      ...prev,
      diamonds: prev.diamonds - price,
      unlockedItems: [...prev.unlockedItems, itemId]
    }));
    addLog('unlock', 'Item unlocked', -price);
    return { success: true, message: 'Item unlocked! ✨' };
  };

  return (
    <GameContext.Provider value={{ user, addDiamonds, unlockItem, showToast, login, logout }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
