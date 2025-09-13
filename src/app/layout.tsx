import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Anger Away',
  description: 'A place to let go of your anger.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Image
          src="https://picsum.photos/seed/calm-background/1920/1080"
          alt="Calm background"
          fill
          className="object-cover -z-10"
          data-ai-hint="calm abstract"
        />
        <div className="min-h-screen flex flex-col bg-background/80 backdrop-blur-sm">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
