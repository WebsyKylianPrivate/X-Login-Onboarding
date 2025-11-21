import React from 'react';
import { useGame } from '@/context/GameContext';
import Avatar from '@/components/ui/Avatar';
import { Gem } from 'lucide-react';

const Header = ({ title = "Items" }) => {
  const { user } = useGame();

  return (
    <header className="header flex items-center justify-between p-4 sticky z-50">
      <h1 className="text-xl font-bold">{title}</h1>
      
      <div className="user-pill flex items-center gap-2">
        {/* Diamonds */}
        <div className="flex items-center gap-1">
          <Gem size={16} color="#60a5fa" fill="rgba(96, 165, 250, 0.2)" />
          <span className="font-bold">{user.diamonds}</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-300">{user.username}</span>
          <Avatar 
            src={user.avatar} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
