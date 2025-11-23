import React from "react";
import { Trophy, Flame, Star, TrendingUp, Users } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  avatar: string;
  hourlyEarnings: number;
  metrics: {
    flame: number;
    star: number;
    pyramid: number;
    face: number;
  };
}

const mockChannels: Channel[] = [
  {
    id: "1",
    name: "Du Rove's Channel",
    avatar: "👤",
    hourlyEarnings: 630,
    metrics: {
      flame: 13000,
      star: 2000,
      pyramid: 8,
      face: 14,
    },
  },
  {
    id: "2",
    name: "TON Community",
    avatar: "🔵",
    hourlyEarnings: 263,
    metrics: {
      flame: 3000,
      star: 1000,
      pyramid: 9,
      face: 9,
    },
  },
  {
    id: "3",
    name: "Starboard: All Channels",
    avatar: "⭐",
    hourlyEarnings: 210,
    metrics: {
      flame: 2000,
      star: 1000,
      pyramid: 3,
      face: 11,
    },
  },
  {
    id: "4",
    name: "TON Society",
    avatar: "🔷",
    hourlyEarnings: 172,
    metrics: {
      flame: 2000,
      star: 1000,
      pyramid: 5,
      face: 9,
    },
  },
  {
    id: "5",
    name: "Sticker Community",
    avatar: "🌙",
    hourlyEarnings: 158,
    metrics: {
      flame: 2000,
      star: 833,
      pyramid: 18,
      face: 48,
    },
  },
  {
    id: "6",
    name: "Whale Alert",
    avatar: "🐋",
    hourlyEarnings: 145,
    metrics: {
      flame: 1500,
      star: 750,
      pyramid: 12,
      face: 25,
    },
  },
  {
    id: "7",
    name: "Crypto News",
    avatar: "📰",
    hourlyEarnings: 120,
    metrics: {
      flame: 1200,
      star: 600,
      pyramid: 7,
      face: 15,
    },
  },
  {
    id: "8",
    name: "DeFi Hub",
    avatar: "💎",
    hourlyEarnings: 98,
    metrics: {
      flame: 1000,
      star: 500,
      pyramid: 4,
      face: 10,
    },
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const Home: React.FC = () => {
  const handleJoin = (channelId: string) => {
    console.log("Join channel:", channelId);
    // TODO: Implémenter la logique de join
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header Section */}
      <div className="p-4 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Trophy size={20} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Top Channels</h1>
        </div>
        <p className="text-sm text-gray-400 ml-13">How it works →</p>
      </div>

      {/* Channels List */}
      <div className="flex-1 px-4 pb-24">
        <div className="space-y-3">
          {mockChannels.map((channel) => (
            <div
              key={channel.id}
              className="channel-card bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
            >
              {/* Avatar */}
              <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
                {channel.avatar}
              </div>

              {/* Channel Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1 truncate">
                  {channel.name}
                </h3>
                <p className="text-sm font-medium text-orange-400 mb-2">
                  +{channel.hourlyEarnings} SP Hourly
                </p>

                {/* Metrics */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Flame size={14} className="text-red-400" />
                    <span className="text-xs text-gray-300">
                      {formatNumber(channel.metrics.flame)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-xs text-gray-300">
                      {formatNumber(channel.metrics.star)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300">
                      {channel.metrics.pyramid}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-red-300" />
                    <span className="text-xs text-gray-300">
                      {channel.metrics.face}
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoin(channel.id)}
                className="shrink-0 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-xl transition-colors active:scale-95"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
