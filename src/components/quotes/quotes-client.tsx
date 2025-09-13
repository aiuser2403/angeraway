
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getNewQuote } from '@/app/actions';
import { RefreshCw, Zap, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QuotesClientProps = {
  initialQuotes: string[];
};

export default function QuotesClient({ initialQuotes }: QuotesClientProps) {
  const [quotes, setQuotes] = useState<string[]>(initialQuotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 7000); // Rotate every 7 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  const handleGetNewQuote = async () => {
    setIsLoading(true);
    try {
      const result = await getNewQuote();
      if (result.quote && !quotes.includes(result.quote)) {
        const newQuotes = [result.quote, ...quotes];
        setQuotes(newQuotes);
        setCurrentIndex(0);
      } else if (result.quote) {
        // If quote already exists, just show it
        const existingIndex = quotes.findIndex(q => q === result.quote);
        setCurrentIndex(existingIndex);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch a new quote. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuote = (quote: string) => {
    if (quote === "Smile") {
      return (
        <div className="flex items-center justify-center gap-2">
          “{quote}” <Smile className="inline-block" />
        </div>
      )
    }
    return `“${quote}”`;
  }

  return (
    <div className="flex flex-col items-center justify-center text-white min-h-[400px]">
       <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-white drop-shadow-lg">Things you Already Know</h1>
      </div>

      <div className="relative h-40 w-full max-w-3xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="absolute"
          >
            <blockquote className="text-2xl md:text-4xl italic font-headline text-center leading-relaxed">
              {renderQuote(quotes[currentIndex])}
            </blockquote>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGetNewQuote}
          disabled={isLoading}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-primary-foreground hidden"
        >
          {isLoading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Get AI Quote
        </Button>
        <Button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % quotes.length)}
            size="lg"
            variant="outline"
            className="bg-white/20 text-white border-white/50 hover:bg-white/30"
        >
            <RefreshCw className="mr-2 h-4 w-4" />
            Another Quote
        </Button>
      </div>
    </div>
  );
}
