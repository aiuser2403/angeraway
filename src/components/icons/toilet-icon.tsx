
import * as React from 'react';
import { cn } from '@/lib/utils';

const ToiletIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <path d="M7 15H5.5C4.12 15 3 16.12 3 17.5V19.5C3 20.88 4.12 22 5.5 22H18.5C19.88 22 21 20.88 21 19.5V17.5C21 16.12 19.88 15 18.5 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M17 15V5C17 3.34315 15.6569 2 14 2H10C8.34315 2 7 3.34315 7 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d-="M10 9H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
});

ToiletIcon.displayName = 'ToiletIcon';

export default ToiletIcon;
