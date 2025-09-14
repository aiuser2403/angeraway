
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
        <path d="M7.34,12.25c-0.15,1.83,0.3,3.64,1.3,5.18c0.07,0.11,0.15,0.22,0.23,0.32c0.75,0.92,1.74,1.6,2.9,1.96c0.59,0.18,1.2,0.28,1.82,0.28c2.37,0,4.52-1.2,5.77-3.11c1.23-1.88,1.4-4.22,0.43-6.23c-0.12-0.25-0.26-0.5-0.42-0.73C17.02,6.53,13.43,5.11,9.45,5.75C5.03,6.46,2.02,9.93,2,14.4c0,0.55,0.45,1,1,1h1.51c0.41,0,0.77-0.25,0.92-0.63c0.48-1.23,1.25-2.31,2.26-3.18C7.81,11.52,7.49,11.87,7.34,12.25z M18,3c-3.31,0-6,2.69-6,6c0,0.55,0.45,1,1,1s1-0.45,1-1c0-2.21,1.79-4,4-4s4,1.79,4,4c0,0.55,0.45,1,1,1s1-0.45,1-1C24,5.69,21.31,3,18,3z"/>
        <path d="M6.5,23h11c0.55,0,1-0.45,1-1v-6.5c0-0.55-0.45-1-1-1h-11c-0.55,0-1,0.45-1,1V22C5.5,22.55,5.95,23,6.5,23z"/>
    </svg>
  );
});

ToiletIcon.displayName = 'ToiletIcon';

export default ToiletIcon;
