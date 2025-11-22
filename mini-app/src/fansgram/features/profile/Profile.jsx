import React from 'react';
import { useGame } from '../../context/GameContext';
import Avatar from '../../components/ui/Avatar';
import { Gem, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useGame();

  const stats = [
    { label: 'Unlocked', value: user.unlockedItems.length },
    { label: 'Spent', value: user.history.filter(h => h.type === 'unlock').reduce((acc, curr) => acc + Math.abs(curr.amount), 0) },
    { label: 'Joined', value: 'Nov 2025' }
  ];

  return (
    <div className="p-4 w-full flex flex-col items-center" style={{ paddingBottom: '120px', gap: '24px' }}>
      
      {/* Profile Header */}
      <div className="flex flex-col items-center mt-10">
        <div className="relative mb-6">
          {/* Gradient Ring */}
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            padding: '3px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            boxShadow: '0 10px 40px -10px rgba(168, 85, 247, 0.5)',
            display: 'flex', // Centrage
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid transparent' // Simule l'épaisseur du ring
          }}>
            {/* Avatar Large Override */}
            <Avatar 
              src={user.avatar} 
              style={{ 
                width: '100%', 
                height: '100%', 
                border: '4px solid #000', 
                minWidth: 'auto',
                minHeight: 'auto',
                maxWidth: 'none',
                maxHeight: 'none',
                borderRadius: '50%',
                backgroundColor: 'black' // Fond noir pour éviter transparence
              }} 
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">{user.username}</h2>
          <span className="text-gray-500 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            ID: 8493021
          </span>
        </div>
      </div>

      {/* Balance Card - Single Line Layout */}
      <div className="w-full item-card p-6 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Gem size={24} color="#a855f7" />
            </div>
            <span className="text-base text-gray-300 font-medium">Balance</span>
          </div>
          <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{user.diamonds}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="shop-grid w-full" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {stats.map((stat, index) => (
          <div key={index} className="item-card p-5 flex flex-col items-center justify-center text-center bg-[#111] border border-white/5 gap-1">
            <span className="text-xl font-bold text-white">{stat.value}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 font-semibold hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Disconnect</span>
        </button>
      </div>

      <div className="mt-auto pt-4 text-center opacity-30">
        <span className="text-xs font-mono">v7.5.2 • Build 2025</span>
      </div>
    </div>
  );
};

export default Profile;
