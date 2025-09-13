
import * as React from 'react';
import { cn } from '@/lib/utils';

const ToiletIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-toilet-paper', className)}
      {...props}
    >
      <path d="M4 14v- возможность 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
      <path d="M16 10V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6" />
      <path d="M12 10h.01" />
    </svg>
  );
});

ToiletIcon.displayName = 'ToiletIcon';

export default ToiletIcon;
