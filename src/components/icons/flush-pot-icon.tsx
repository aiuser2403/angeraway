import * as React from 'react';
import { cn } from '@/lib/utils';

const FlushPotIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('h-6 w-6', className)}
        {...props}
      >
        <path d="M4 12h16" />
        <path d="M4 6h16" />
        <path d="M12 12v8" />
        <path d="M10 12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4z" />
        <path d="M18 12a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v8h16v-8z" />
      </svg>
    );
  }
);
FlushPotIcon.displayName = 'FlushPotIcon';

export default FlushPotIcon;
