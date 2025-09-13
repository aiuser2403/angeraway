
import * as React from 'react';
import { cn } from '@/lib/utils';

const PleasantSmileyIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="hsl(var(--accent))" fillOpacity="0.2" />
      <path
        d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
      />
      <path
        d="M14.994 15.5c-.556-1-1.48-1.5-2.993-1.5s-2.437.5-2.994 1.5"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="1" fill="hsl(var(--accent))" />
      <circle cx="15" cy="10" r="1" fill="hsl(var(--accent))" />
    </svg>
  );
});

PleasantSmileyIcon.displayName = 'PleasantSmileyIcon';

export default PleasantSmileyIcon;
