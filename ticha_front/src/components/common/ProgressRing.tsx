import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // width and height
  strokeWidth?: number;
  gradientStart?: string;
  gradientEnd?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  gradientStart = '#2563EB', // tichaBlue
  gradientEnd = '#7C3AED', // tichaPurple
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  
  // Unique gradient ID to prevent overlaps if multiple rings are mounted
  const gradientId = `ring-grad-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle
          className="text-slate-100"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress Circle */}
        <circle
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Central Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {children ? (
          children
        ) : (
          <span className="text-xl font-bold text-tichaDark">{progress}%</span>
        )}
      </div>
    </div>
  );
};
