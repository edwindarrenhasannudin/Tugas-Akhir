import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", color = "white" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fork */}
      <g fill={color}>
        {/* Left Tine */}
        <rect x="16" y="20" width="8" height="25" rx="1" />
        {/* Middle Tine */}
        <rect x="28" y="20" width="8" height="25" rx="1" />
        {/* Right Tine */}
        <rect x="40" y="20" width="8" height="25" rx="1" />
        
        {/* Base of Fork */}
        <path d="M16 42 V48 C16 58, 48 58, 48 48 V42 H16 Z" />
        
        {/* Handle of Fork */}
        <rect x="28" y="55" width="8" height="30" rx="1" />
      </g>

      {/* Spoon */}
      <g fill={color}>
        {/* Spoon Head */}
        <ellipse cx="67" cy="40" rx="15" ry="20" />
        {/* Spoon Handle */}
        <rect x="63" y="58" width="8" height="27" rx="1" />
      </g>
    </svg>
  );
};
