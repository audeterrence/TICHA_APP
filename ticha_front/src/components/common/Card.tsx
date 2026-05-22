import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'glow' | 'borderless';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  onClick,
}) => {
  const baseStyles = 'rounded-2xl border border-slate-100/80 bg-white p-6 shadow-sm transition-all duration-300';
  
  const variants = {
    default: 'bg-white border-slate-200/60 shadow-sm',
    glass: 'bg-white/70 backdrop-blur-xl border-white/50 shadow-md shadow-slate-100/40',
    glow: 'bg-white border-slate-100 shadow-sm hover:border-blue-600/30 hover:shadow-lg hover:shadow-blue-600/5',
    borderless: 'bg-transparent border-0 p-0 shadow-none',
  };

  const interactiveStyles = interactive 
    ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.995]' 
    : '';

  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

