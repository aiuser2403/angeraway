
import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FlushPotIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { isFlushing?: boolean }
>(({ className, isFlushing, ...props }, ref) => {
  const waterVariants = {
    initial: { y: 0, opacity: 1 },
    flushing: { y: 10, opacity: 0, transition: { duration: 1, repeat: Infinity } },
  };

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      {/* Bowl */}
      <path d="M5 12h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z" />
      {/* Water */}
      <motion.path
        d="M5 12c3-2 6-2 9 0s5 2 5 2"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        variants={waterVariants}
        animate={isFlushing ? 'flushing' : 'initial'}
      />
      
      {/* Tank */}
      <path d="M20 6h-1a1 1 0 0 0-1 1v2H6V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v3h20V8a2 2 0 0 0-2-2z" />
      
      {/* Flush Handle */}
      <path d="M20 7v0a2 2 0 0 1-2-2h-1" />
    </svg>
  );
});
FlushPotIcon.displayName = 'FlushPotIcon';

export default FlushPotIcon;
