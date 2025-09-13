
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Mic, FileText, Smile } from 'lucide-react';
import FlushPotIcon from '@/components/icons/flush-pot-icon';
import { useToast } from '@/hooks/use-toast';
import * as Tone from 'tone';
import Image from 'next/image';

type PageState = 'idle' | 'flushing' | 'flushed';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export default function HomePageClient() {
  const [angerText, setAngerText] = useState('');
  const [angerMedia, setAngerMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pageState, setPageState] = useState<PageState>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [flushSynth, setFlushSynth] = useState<Tone.NoiseSynth | null>(null);

  useEffect(() => {
    const synth = new Tone.NoiseSynth({
      noise: {
        type: 'brown',
      },
      envelope: {
        attack: 0.05,
        decay: 0.8,
        sustain: 0.1,
        release: 2,
      },
    }).toDestination();
    setFlushSynth(synth);

    return () => {
      synth.dispose();
    };
  }, []);


  const showFlushButton = useMemo(() => {
    return angerText.length > 0 || angerMedia !== null || isRecording;
  }, [angerText, angerMedia, isRecording]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }

      if (!SUPPORTED_FORMATS.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, WEBP, GIF, or SVG file.',
        });
        return;
      }
      
      setAngerMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: "Audio recording is a demo feature.",
    });
  };

  const handleFlush = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setPageState('flushing');

    if (flushSynth) {
      flushSynth.triggerAttackRelease("2s");
    }

    setTimeout(() => {
      setPageState('flushed');
      setAngerText('');
      setAngerMedia(null);
      setMediaPreview(null);
      setIsRecording(false);
    }, 2000);
  };
  
  const handleReset = () => {
    setPageState('idle');
  }

  const renderIdleState = () => (
    <>
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">Angry</h1>
        <p className="mt-2 text-lg text-muted-foreground">Write or record why you're angry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[84rem] mx-auto">
        <Card className="shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText className="text-accent" />
              Write it down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe why you’re angry…"
              className="h-[30rem] resize-none"
              value={angerText}
              onChange={(e) => setAngerText(e.target.value)}
              aria-label="Write your anger"
            />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Mic className="text-accent" />
              Upload or Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 h-full justify-between min-h-[30rem]">
              <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                {mediaPreview ? (
                  <div className="relative w-full h-full">
                    <Image src={mediaPreview} alt="Anger media preview" layout="fill" objectFit="contain" className="rounded-md" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2">Upload a photo to express your anger.</p>
                    <p className="text-xs mt-1">Supports JPEG, PNG, WEBP, GIF, SVG. Max 10MB.</p>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0 flex gap-4 mt-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-center">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {mediaPreview ? 'Change Image' : 'Upload Image'}
                </Button>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <Button variant={isRecording ? "destructive" : "outline"} onClick={handleRecord} className="w-full justify-center">
                  <Mic className="mr-2 h-4 w-4" />
                  {isRecording ? "Stop Recording" : "Record Audio"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showFlushButton && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="fixed bottom-10"
          >
            <Button size="lg" className="rounded-full shadow-2xl" onClick={handleFlush}>
              <FlushPotIcon className="mr-2" />
              Flush it out
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const renderFlushingState = () => (
     <motion.div
        key="flushing"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
        className="flex flex-col items-center justify-center text-primary"
      >
        <FlushPotIcon className="w-32 h-32" />
        <p className="text-2xl font-headline mt-4">Flushing...</p>
      </motion.div>
  );
  
  const renderFlushedState = () => (
    <motion.div
      key="flushed"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      className="text-center"
    >
      <div className="flex justify-center items-center">
        <Smile className="w-48 h-48 text-accent" />
      </div>
      <p className="text-3xl font-headline mt-8">Ahhh, much better.</p>
      <Button onClick={handleReset} className="mt-8" variant="outline">
        Start Over
      </Button>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <AnimatePresence mode="wait">
        {pageState === 'idle' && <motion.div key="idle" exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}>{renderIdleState()}</motion.div>}
        {pageState === 'flushing' && renderFlushingState()}
        {pageState === 'flushed' && renderFlushedState()}
      </AnimatePresence>
    </div>
  );
}
