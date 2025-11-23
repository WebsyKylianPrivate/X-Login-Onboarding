import { useGame } from '../../context/GameContext';
import { History as HistoryIcon, ShoppingBag, Gem } from 'lucide-react';

const History = () => {
  const { user } = useGame();

  return (
    <div className="p-4 w-full flex-col" style={{ paddingBottom: '100px' }}>
      {/* Titre retiré ici car géré par le Header */}

      {user.history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 opacity-50">
          <HistoryIcon size={48} className="mb-4" />
          <p>No history yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {user.history.map((log) => (
            <div 
              key={log.id} 
              className="item-card flex-row items-center justify-between p-4"
              style={{ flexDirection: 'row' }} // Force row layout override
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${log.type === 'earn' ? 'bg-green-500/20' : 'bg-purple-500/20'}`}
                     style={{ backgroundColor: log.type === 'earn' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)' }}
                >
                  {log.type === 'earn' ? (
                    <Gem size={20} color={log.type === 'earn' ? '#4ade80' : '#a855f7'} />
                  ) : (
                    <ShoppingBag size={20} color="#a855f7" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{log.message}</span>
                  <span className="text-sm text-gray-400 opacity-60">{log.date}</span>
                </div>
              </div>

              <div className={`font-bold ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}
                   style={{ color: log.amount > 0 ? '#4ade80' : '#f87171' }}
              >
                {log.amount > 0 ? '+' : ''}{log.amount} 💎
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

