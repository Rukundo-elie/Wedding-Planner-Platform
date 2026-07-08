import React from 'react';

const WeddingRingIcon = ({ className = "h-6 w-6" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="url(#goldGradient)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left Ring (Groom's Ring) */}
      <circle cx="24" cy="38" r="14" />
      
      {/* Right Ring (Bride's Engagement Ring) */}
      <circle cx="40" cy="26" r="14" />
      
      {/* Interlocking Arc (Draws a segment of the left ring on top of the right ring for interlocking effect) */}
      <path 
        d="M 33.6 28.2 A 14 14 0 0 1 38 38" 
        stroke="url(#goldGradient)" 
        strokeWidth="3.5" 
      />

      {/* Diamond Gem on top of the Right Ring */}
      <path 
        d="M 40 2 L 46 8 L 40 14 L 34 8 Z" 
        fill="#38bdf8" 
        stroke="#0284c7" 
        strokeWidth="1.5" 
      />
      
      {/* Tiny Sparkle on Gem */}
      <path 
        d="M 48 2 L 50 4 M 50 2 L 48 4" 
        stroke="#38bdf8" 
        strokeWidth="1" 
      />

      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" /> {/* Amber 500 */}
          <stop offset="35%" stopColor="#fbbf24" /> {/* Amber 400 */}
          <stop offset="70%" stopColor="#d97706" /> {/* Amber 600 */}
          <stop offset="100%" stopColor="#b45309" /> {/* Amber 700 */}
        </linearGradient>
      </defs>
    </svg>
  );
};

export default WeddingRingIcon;
