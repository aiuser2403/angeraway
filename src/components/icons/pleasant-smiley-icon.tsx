
import * as React from 'react';
import { cn } from '@/lib/utils';

const PleasantSmileyIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <defs>
        <radialGradient id="faceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FFDD00', stopOpacity: 1 }} />
          <stop offset="90%" style={{ stopColor: '#FFC300', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#E6A200', stopOpacity: 1 }} />
        </radialGradient>
        <radialGradient id="highlightGradient" cx="50%" cy="50%" r="50%" fx="35%" fy="30%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      {/* Main face with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#faceGradient)" stroke="#B8860B" strokeWidth="2" />
      
      {/* Eyes */}
      <ellipse cx="35" cy="40" rx="8" ry="12" fill="#2F1B00" />
      <ellipse cx="65" cy="40" rx="8" ry="12" fill="#2F1B00" />
      
      {/* Smile */}
      <path 
        d="M 25,65 Q 50,85 75,65" 
        fill="none" 
        stroke="#2F1B00" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />

      {/* Glossy highlight */}
      <ellipse cx="50" cy="45" rx="35" ry="25" fill="url(#highlightGradient)" />

    </svg>
  );
});

PleasantSmileyIcon.displayName = 'PleasantSmileyIcon';

export default PleasantSmileyIcon;
