import React from 'react';

export const VentoLogo = ({ className = "w-8 h-8", textClassName = "text-xl" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary"
      >
        <path
          d="M12 2L4 7V17L12 22L20 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22V12M12 12L20 7M12 12L4 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
      </svg>
      <span className={`font-black tracking-tighter font-manrope ${textClassName}`}>RBFS</span>
    </div>
  );
};
