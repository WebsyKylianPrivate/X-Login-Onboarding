import React from 'react';
import { History, Grid, User } from 'lucide-react';
import { useGame } from '../../context/GameContext';

type ViewType = 'home' | 'history' | 'shop' | 'profile';

interface BottomNavProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
  onRequireLogin?: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, active, onClick }) => (
  <button 
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChange, onRequireLogin }) => {
  const { isAuthenticated } = useGame();
  
  const handleNavClick = (view: ViewType) => {
    // Si l'utilisateur n'est pas connecté et qu'il clique sur history ou profile
    if (!isAuthenticated && (view === 'history' || view === 'profile')) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    // Sinon, changer la vue normalement
    onChange(view);
  };

  return (
    <nav className="bottom-nav">
      <NavItem 
        icon={<History size={24} />} 
        active={currentView === 'history'} 
        onClick={() => handleNavClick('history')}
      />
      <NavItem 
        icon={<Grid size={24} />} 
        active={currentView === 'shop' || currentView === 'home'} 
        onClick={() => handleNavClick('shop')}
      />
      <NavItem 
        icon={<User size={24} />} 
        active={currentView === 'profile'} 
        onClick={() => handleNavClick('profile')}
      />
    </nav>
  );
};

export default BottomNav;

