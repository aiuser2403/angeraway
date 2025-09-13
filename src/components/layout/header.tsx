
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const navLinks = [
  { href: '/still-angry', label: 'Still Angry?' },
  { href: '/motivational-quotes', label: 'Things you Already Know' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">
            Anger Away
          </h1>
        </Link>
        <nav className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-sm font-medium',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
           <Button asChild>
              <Link href="/still-angry">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
