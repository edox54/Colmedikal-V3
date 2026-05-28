import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 350 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(0, 0)">
        {/* Light Blue: Left and Bottom */}
        <path 
          d="M 35 35 
             L 25 35 
             A 15 15 0 0 0 25 65 
             L 35 65 
             L 35 75 
             A 15 15 0 0 0 65 75 
             L 65 65 
             Z" 
          fill="#4597CA" 
        />
        
        {/* Dark Blue: Top and Right */}
        <path 
          d="M 35 35 
             L 35 25 
             A 15 15 0 0 1 65 25 
             L 65 35 
             L 75 35 
             A 15 15 0 0 1 75 65 
             L 65 65 
             Z" 
          fill="#0C4169" 
        />
      </g>
      
      {/* Brand Text */}
      <text 
        x="95" 
        y="65" 
        fontFamily="'Kumbh Sans', 'Open Sans', system-ui, sans-serif" 
        fontWeight="800" 
        fontSize="46" 
        fill="#0C4169" 
        letterSpacing="-1.5"
      >
        colmedikal
      </text>
    </svg>
  );
}
