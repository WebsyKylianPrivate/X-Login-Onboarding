import React from "react";
import { useNavigate } from "react-router-dom";
import xIcon from "../../assets/icons8-x-24 (1).png";
import { Lock } from "lucide-react";

const LoginPage = ({ onCancel }) => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/oauth");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-8">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]">
          <Lock size={40} className="text-white/80" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Restricted Access
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            You have received an invitation to access the private folder. Please
            log in to continue.
          </p>
        </div>

        <button
          onClick={handleSignInClick}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all transform active:scale-95 shadow-lg"
        >
          <span>Sign in with</span>
          <img src={xIcon} alt="X" className="w-5 h-5" />
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 text-sm mt-4 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}

        <p className="text-xs text-gray-600 mt-8">
          By continuing, you agree to the terms of use of the private folder.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
