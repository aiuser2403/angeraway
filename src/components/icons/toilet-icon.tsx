
import * as React from 'react';
import { cn } from '@/lib/utils';

const ToiletIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      {...props}
    >
        <path d="M46.69,337.35a21.34,21.34,0,0,1,0-42.68H76.88V115.39c0-56.32,28.71-102.4,64-102.4H281.6c35.3,0,64,46.08,64,102.4V337.35h14.28a21.34,21.34,0,0,1,0,42.68H46.69ZM161.7,337.35V115.39c0-23.46,19.11-42.45,42.66-42.45h56.89c23.55,0,42.66,19,42.66,42.45V337.35H161.7Z" transform="translate(48.86 5.39) scale(0.9)"/>
        <path d="M42.67,409.6h338a21.33,21.33,0,0,1,21.33,21.33V464a21.33,21.33,0,0,1-21.33,21.33H42.67A21.33,21.33,0,0,1,21.33,464V430.93A21.33,21.33,0,0,1,42.67,409.6Z" transform="translate(48.86 5.39) scale(0.9)"/>
    </svg>
  );
});

ToiletIcon.displayName = 'ToiletIcon';

export default ToiletIcon;

    