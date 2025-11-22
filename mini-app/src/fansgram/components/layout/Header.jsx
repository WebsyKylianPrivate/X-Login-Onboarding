import React from "react";
import { useGame } from "../../context/GameContext";
import Avatar from "../../components/ui/Avatar";
import { Gem, Lock } from "lucide-react";

const Header = ({ title = "Items", onRequireLogin }) => {
  const { user, isAuthenticated } = useGame();
  const isLoggedIn = isAuthenticated;

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
        <div
          style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }}
        ></div>

        {/* User Info ou Sign in */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-300">
              {user.username}
            </span>
            <Avatar src={user.avatar} />
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onRequireLogin && onRequireLogin()}
          >
            <span className="text-sm font-bold text-gray-300">Sign in</span>
            <div
              style={{
                width: "30px",
                height: "30px",
                minWidth: "30px",
                minHeight: "30px",
                maxWidth: "30px",
                maxHeight: "30px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Lock size={16} color="white" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
