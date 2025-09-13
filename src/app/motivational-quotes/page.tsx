import QuotesClient from "@/components/quotes/quotes-client";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const initialQuotes = [
  "This too shall pass.",
  "Breathe deeply. You are stronger than your anger.",
  "Let go and live freely.",
  "The best way out is always through.",
  "Every moment is a fresh beginning.",
];

export default function MotivationalQuotesPage() {
  const backgroundImage = PlaceHolderImages.find(img => img.id === 'quote-background-2');
  
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      {backgroundImage && (
        <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover z-0"
          data-ai-hint={backgroundImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 container mx-auto px-4 py-12 text-center">
        <QuotesClient initialQuotes={initialQuotes} />
      </div>
    </div>
  );
}
