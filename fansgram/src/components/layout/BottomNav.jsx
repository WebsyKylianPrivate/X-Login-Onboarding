import React from 'react';
import { History, Grid, User } from 'lucide-react';

const BottomNav = ({ currentView, onChange }) => {
  return (
    <nav className="bottom-nav">
      <NavItem 
        icon={<History size={24} />} 
        active={currentView === 'history'} 
        onClick={() => onChange('history')}
      />
      <NavItem 
        icon={<Grid size={24} />} 
        active={currentView === 'shop'} 
        onClick={() => onChange('shop')}
      />
      <NavItem 
        icon={<User size={24} />} 
        active={currentView === 'profile'}
        onClick={() => onChange('profile')}
      />
    </nav>
  );
};

const NavItem = ({ icon, active, onClick }) => (
  <button 
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default BottomNav;
