import React, { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles: Record<ToastType, {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
  }> = {
    success: {
      border: '1px solid rgba(34, 197, 94, 0.2)',
      bg: 'rgba(20, 20, 20, 0.95)',
      iconBg: 'rgba(34, 197, 94, 0.1)',
      iconColor: '#4ade80'
    },
    error: {
      border: '1px solid rgba(239, 68, 68, 0.2)',
      bg: 'rgba(20, 20, 20, 0.95)',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#f87171'
    }
  };

  const currentStyle = styles[type];

  return (
    <div 
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        minWidth: '320px',
        maxWidth: '90vw',
        backgroundColor: currentStyle.bg,
        border: currentStyle.border,
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        animation: 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: currentStyle.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {type === 'success' ? (
          <Check size={18} color={currentStyle.iconColor} />
        ) : (
          <AlertCircle size={18} color={currentStyle.iconColor} />
        )}
      </div>

      <span style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        color: 'white',
        flex: 1,
        letterSpacing: '0.01em'
      }}>
        {message}
      </span>

      <button 
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6
        }}
      >
        <X size={16} color="white" />
      </button>

      <style>
        {`
          @keyframes toast-in {
            from { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
            to { opacity: 1; transform: translate(-50%, 0) scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;

