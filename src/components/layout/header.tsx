
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const navLinks = [
  { href: '/still-angry', label: 'Still Angry?' },
  { href: '/motivational-quotes', label: 'Things you Already Know' },
];

export default function Header() {
  const pathname = usePathname();

  const getNextLink = () => {
    if (pathname === '/') {
      return '/still-angry';
    }
    if (pathname === '/still-angry') {
      return '/motivational-quotes';
    }
    return null;
  };

  const getBackLink = () => {
    if (pathname === '/motivational-quotes') {
      return '/still-angry';
    }
    if (pathname === '/still-angry') {
      return '/';
    }
    return null;
  }

  const nextLink = getNextLink();
  const backLink = getBackLink();

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            {backLink && (
                 <Button asChild variant="outline" size="icon">
                    <Link href={backLink}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
            )}
            <Link href="/">
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">
                Why So Angry
            </h1>
            </Link>
        </div>
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
           {nextLink && (
            <Button asChild>
                <Link href={nextLink}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
           )}
        </nav>
      </div>
    </header>
  );
}
