import React from "react";
import { Flame, Star, TrendingUp, Users } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  avatar: string;
  content: {
    count: number;
    type: "photos" | "videos";
  };
  metrics: {
    flame: number;
    star: number;
    pyramid: number;
    face: number;
  };
}

const mockFolders: Folder[] = [
  {
    id: "1",
    name: "Sophia",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 1250,
      type: "photos",
    },
    metrics: {
      flame: 13000,
      star: 2000,
      pyramid: 8,
      face: 14,
    },
  },
  {
    id: "2",
    name: "Emma",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 450,
      type: "photos",
    },
    metrics: {
      flame: 3000,
      star: 1000,
      pyramid: 9,
      face: 9,
    },
  },
  {
    id: "3",
    name: "Olivia",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 320,
      type: "videos",
    },
    metrics: {
      flame: 2000,
      star: 1000,
      pyramid: 3,
      face: 11,
    },
  },
  {
    id: "4",
    name: "Isabella",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 890,
      type: "videos",
    },
    metrics: {
      flame: 2000,
      star: 1000,
      pyramid: 5,
      face: 9,
    },
  },
  {
    id: "5",
    name: "Ava",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 280,
      type: "photos",
    },
    metrics: {
      flame: 2000,
      star: 833,
      pyramid: 18,
      face: 48,
    },
  },
  {
    id: "6",
    name: "Mia",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 195,
      type: "videos",
    },
    metrics: {
      flame: 1500,
      star: 750,
      pyramid: 12,
      face: 25,
    },
  },
  {
    id: "7",
    name: "Charlotte",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 650,
      type: "photos",
    },
    metrics: {
      flame: 1200,
      star: 600,
      pyramid: 7,
      face: 15,
    },
  },
  {
    id: "8",
    name: "Amelia",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face",
    content: {
      count: 180,
      type: "photos",
    },
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
  const handleJoin = (folderId: string) => {
    console.log("Join folder:", folderId);
    // TODO: Implémenter la logique de join
  };

  return (
    <div className="w-full bg-black text-white">
      {/* How it works link */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-sm text-gray-400">How it works →</p>
      </div>

      {/* Folders List */}
      <div className="px-4 pb-24">
        <div className="space-y-3">
          {mockFolders.map((folder) => (
            <div
              key={folder.id}
              className="folder-card bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
            >
              {/* Avatar */}
              <div className="shrink-0 w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden">
                <img
                  src={folder.avatar}
                  alt={folder.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Folder Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1 truncate">
                  {folder.name}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  +{folder.content.count} {folder.content.type}
                </p>

                {/* Metrics */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Flame size={14} className="text-red-400" />
                    <span className="text-xs text-gray-300">
                      {formatNumber(folder.metrics.flame)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-xs text-gray-300">
                      {formatNumber(folder.metrics.star)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300">
                      {folder.metrics.pyramid}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-red-300" />
                    <span className="text-xs text-gray-300">
                      {folder.metrics.face}
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoin(folder.id)}
                className="shrink-0 bg-linear-to-br from-purple-600 to-purple-500 hover:opacity-90 text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/30"
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
