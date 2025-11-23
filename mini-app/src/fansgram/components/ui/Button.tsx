import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-95',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-400 hover:text-white',
    outline: 'border border-white/20 bg-white/5 hover:bg-white/10',
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

