import React from 'react';

interface CalendarIconProps {
  className?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ className = "h-5 w-5 text-white" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      {/* Planet orbit symbol */}
      <circle cx="14" cy="15" r="2"></circle>
      <path d="M12 13.5C12 13.5 13 12.5 15 14.5C17 16.5 16 17.5 16 17.5"></path>
    </svg>
  );
};

export default CalendarIcon;
