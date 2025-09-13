
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Mic, FileText, Square, Trash2, X, Play, Pause, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ImageCropDialog from './image-crop-dialog';
import PleasantSmileyIcon from '@/components/icons/pleasant-smiley-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ToiletIcon from '../icons/toilet-icon';

type PageState = 'idle' | 'confirming' | 'flushing' | 'flushed';
type RecordingState = 'idle' | 'recording' | 'recorded' | 'denied';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const SUPPORTED_AUDIO_FORMATS = ['audio/wav', 'audio/x-aiff', 'audio/x-pcm', 'audio/mpeg', 'audio/webm'];
const STORAGE_KEY = 'anger-away-data';
const EXPIRATION_MINUTES = 30;

type StoredData = {
  angerText: string;
  mediaPreview: string | null;
  audioUrl: string | null;
  timestamp: number;
};

export default function HomePageClient() {
  const [angerText, setAngerText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flushAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  const isContentPresent = useMemo(() => {
    return angerText.trim().length > 0 || mediaPreview !== null || audioUrl !== null;
  }, [angerText, mediaPreview, audioUrl]);

  const toiletImage = PlaceHolderImages.find(img => img.id === 'toilet-background');

  const saveDataToLocalStorage = (data: Partial<Omit<StoredData, 'timestamp'>>) => {
    try {
      const currentDataString = localStorage.getItem(STORAGE_KEY);
      const currentData = currentDataString ? JSON.parse(currentDataString) : {};
      const newData = { ...currentData, ...data, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  };

  useEffect(() => {
    try {
      const storedDataString = localStorage.getItem(STORAGE_KEY);
      if (storedDataString) {
        const storedData: StoredData = JSON.parse(storedDataString);
        const now = Date.now();
        const thirtyMinutesInMillis = EXPIRATION_MINUTES * 60 * 1000;

        if (now - storedData.timestamp < thirtyMinutesInMillis) {
          setAngerText(storedData.angerText || '');
          setMediaPreview(storedData.mediaPreview || null);
          if (storedData.audioUrl) {
              setAudioUrl(storedData.audioUrl);
              setRecordingState('recorded');
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (isContentPresent) {
      saveDataToLocalStorage({ angerText, mediaPreview, audioUrl });
    }
  }, [angerText, mediaPreview, audioUrl, isContentPresent]);

  useEffect(() => {
    if (audioUrl) {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
        } else {
            audioRef.current.src = audioUrl;
        }

        const handleEnded = () => setIsAudioPlaying(false);
        const currentAudioRef = audioRef.current;
        currentAudioRef.addEventListener('ended', handleEnded);

        return () => {
            currentAudioRef.removeEventListener('ended', handleEnded);
        }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [audioUrl]);


  useEffect(() => {
    // Pre-load the flush audio
    const audio = new Audio('https://firebasestorage.googleapis.com/v0/b/prototyper-de2a8.appspot.com/o/public%2Ftoilet-flush-sound.mp3?alt=media&token=86a761ad-c841-499c-88e2-8874135d518d');
    audio.preload = 'auto';
    flushAudioRef.current = audio;

    return () => {
        if (flushAudioRef.current) {
            flushAudioRef.current.pause();
            flushAudioRef.current = null;
        }
    }
  }, []);

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

      if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, WEBP, GIF, or SVG file.',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageForCrop(reader.result as string);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageSave = (newImage: string | null) => {
    setMediaPreview(newImage);
    if (newImage) {
      saveDataToLocalStorage({ mediaPreview: newImage });
    }
    setIsCropDialogOpen(false);
    setRawImageForCrop(null);
  };

  const handleCropDialogClose = () => {
    setIsCropDialogOpen(false);
    setRawImageForCrop(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const startRecording = async () => {
    try {
      if (audioUrl) {
        setAudioUrl(null);
        saveDataToLocalStorage({ audioUrl: null });
      }
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setAudioUrl(base64Audio);
            saveDataToLocalStorage({ audioUrl: base64Audio });
            setRecordingState('recorded');
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      toast({ title: "Recording started" });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingState('denied');
      toast({
        variant: 'destructive',
        title: 'Microphone access denied',
        description: 'Please enable microphone permissions in your browser settings.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      toast({ title: "Recording stopped" });
    }
  };

  const handleRecordControl = () => {
    if (recordingState === 'idle' || recordingState === 'denied' || recordingState === 'recorded') {
      startRecording();
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  };
  
  const handleListen = () => {
    if (audioRef.current) {
        if (isAudioPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsAudioPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            setIsAudioPlaying(true);
        }
    }
  };

  const handleDiscardAudio = () => {
    if (audioRef.current && isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
    }
    setAudioUrl(null);
    saveDataToLocalStorage({ audioUrl: null });
    setRecordingState('idle');
    audioChunksRef.current = [];
  }

  const handleDiscardImage = () => {
    setMediaPreview(null);
    saveDataToLocalStorage({ mediaPreview: null });
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }


  const handleFlush = async () => {
    setPageState('flushing');

    if (flushAudioRef.current) {
        flushAudioRef.current.play().catch(e => console.error("Error playing flush sound:", e));
    }

    // Stop listening audio if playing
    if (audioRef.current && isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
    }

    setTimeout(() => {
      setPageState('flushed');
      setAngerText('');
      setMediaPreview(null);
      setAudioUrl(null); // This will also trigger the useEffect to nullify audioRef
      setRecordingState('idle');

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error removing from local storage:", error);
      }
    }, 5000); // Wait for flush animation and sound to finish
  };

  const handleReset = () => {
    setPageState('idle');
  }

  const contentVariants = {
    initial: { opacity: 1, y: 0, scale: 1 },
    flushing: { opacity: 0, y: '100vh', scale: 0.2, transition: { duration: 2, ease: "easeInOut" } },
  };

  const handleConfirm = () => {
    setPageState('confirming');
  }

  
  const renderMediaContent = (isFlushing = false) => {
    if (mediaPreview) {
        return (
          <div className="w-full h-full relative group">
            <Image src={mediaPreview} alt="Anger media preview" fill className="object-contain rounded-md" />
            {!isFlushing && pageState === 'idle' && (
              <div className="absolute top-2 right-2 z-10">
                  <Button size="icon" variant="destructive" onClick={handleDiscardImage} className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Discard Image</span>
                  </Button>
              </div>
            )}
          </div>
        );
      }

    if (recordingState === 'recording' && !isFlushing) {
        return (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-center">
            <Mic className="h-16 w-16 text-red-500 animate-pulse" />
            <p className="mt-4 text-lg">Recording in progress...</p>
          </div>
        );
    }
    
    if (audioUrl) {
        return (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-center p-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="relative bg-primary/20 rounded-full p-6">
                    <Mic className="h-16 w-16 text-primary" />
                </div>
            </div>
            <p className="text-lg mt-4 mb-4">Your recording is ready.</p>
             {pageState === 'idle' && !isFlushing && (
                <div className="border-t pt-4 flex gap-4 w-full">
                    <Button variant="outline" onClick={handleDiscardAudio} className="w-full justify-center">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Discard
                    </Button>
                    <Button onClick={handleListen} variant="outline" className="w-full justify-center">
                        {isAudioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isAudioPlaying ? 'Stop' : 'Listen'}
                    </Button>
                </div>
            )}
          </div>
        );
      }

    return (
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12" />
          <p className="mt-2">Upload a photo to express your feelings.</p>
        </div>
      );
  };

  const renderIdleState = () => (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
        >
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">Angry</h1>
            <p className="mt-2 text-lg text-muted-foreground">Write or record why you're angry.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
            <Card className="shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <FileText className="text-accent" />
                    Write it down
                </CardTitle>
                </CardHeader>
                <CardContent>
                <Textarea
                    placeholder="Describe why you’re angry…"
                    className="min-h-[500px] resize-none"
                    value={angerText}
                    onChange={(e) => setAngerText(e.target.value)}
                    aria-label="Write your anger"
                />
                </CardContent>
            </Card>
            
            <Card className="shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Mic className="text-accent" />
                    Upload or Record
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col space-y-4 h-full justify-between min-h-[500px]">
                    <div className="relative flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 overflow-hidden h-full">
                        {renderMediaContent()}
                    </div>
                    
                    <div className="flex-shrink-0 flex flex-col gap-4 mt-4">
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-center">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {mediaPreview ? 'Change Image' : 'Upload Image'}
                            </Button>
                            <input 
                            type="file" 
                            accept={SUPPORTED_IMAGE_FORMATS.join(',')} 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            />
                            <Button variant={recordingState === 'recording' ? 'destructive' : 'outline'} onClick={handleRecordControl} className="w-full justify-center">
                            {recordingState === 'recording' ? (
                                <>
                                    <Square className="mr-2 h-4 w-4" />
                                    Stop Recording
                                </>
                            ) : (
                                <>
                                    <Mic className="mr-2 h-4 w-4" />
                                    {audioUrl ? 'Re-record' : 'Record Audio'}
                                </>
                            )}
                            </Button>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="mt-12 text-center">
            <Button 
                size="lg" 
                className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 text-xl" 
                onClick={handleConfirm}
                disabled={!isContentPresent}
            >
                <Check className="mr-3 h-8 w-8" />
                Done Sharing
            </Button>
        </div>
        
        {rawImageForCrop && (
            <ImageCropDialog 
            isOpen={isCropDialogOpen}
            onClose={handleCropDialogClose}
            imageSrc={rawImageForCrop}
            onSave={handleImageSave}
            />
        )}
        </motion.div>
    </AnimatePresence>
  );

  const renderConfirmingState = () => (
     <motion.div 
        key="confirming"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
    >
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">Ready to let it go?</h1>
            <p className="mt-2 text-lg text-muted-foreground">This action cannot be undone.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <FileText className="text-accent" />
                    Your Words
                </CardTitle>
                </CardHeader>
                <CardContent>
                <Textarea
                    readOnly
                    value={angerText}
                    className="min-h-[500px] resize-none"
                />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Mic className="text-accent" />
                    Your Media
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col space-y-4 h-full justify-between min-h-[500px]">
                    <div className="relative flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 overflow-hidden h-full">
                        {renderMediaContent(true)}
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="mt-12 text-center flex flex-col items-center gap-4">
            <Button 
                size="lg" 
                className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 text-xl" 
                onClick={handleFlush}
            >
                <ToiletIcon className="mr-3 h-8 w-8" />
                Flush It Out
            </Button>
             <Button variant="link" onClick={() => setPageState('idle')}>Go back and edit</Button>
        </div>
    </motion.div>
  );

  const renderFlushingState = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      {toiletImage && (
        <Image
          src={toiletImage.imageUrl}
          alt={toiletImage.description}
          fill
          className="object-cover"
          data-ai-hint={toiletImage.imageHint}
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-6xl mx-auto h-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full h-full items-center">
          <motion.div
            animate={angerText ? "flushing" : "initial"}
            variants={contentVariants}
            className="w-full"
          >
            {angerText && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <FileText className="text-accent" />
                    Your Words
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    readOnly
                    value={angerText}
                    className="min-h-[500px] resize-none"
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
          <motion.div
            animate={mediaPreview || audioUrl ? "flushing" : "initial"}
            variants={contentVariants}
            className="w-full"
          >
            {(mediaPreview || audioUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    {(mediaPreview || audioUrl) && <ImageIcon className="text-accent" />}
                    Your Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 h-full justify-between min-h-[500px]">
                    <div className="relative flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 overflow-hidden h-full">
                      {renderMediaContent(true)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
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
        <PleasantSmileyIcon className="w-48 h-48" />
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
        {pageState === 'idle' && <motion.div key="idle-container" className="w-full">{renderIdleState()}</motion.div>}
        {pageState === 'confirming' && <motion.div key="confirming-container" className="w-full">{renderConfirmingState()}</motion.div>}
        {pageState === 'flushing' && <motion.div key="flushing-container" className="w-full">{renderFlushingState()}</motion.div>}
        {pageState === 'flushed' && <motion.div key="flushed-container">{renderFlushedState()}</motion.div>}
      </AnimatePresence>
       <footer className="w-full mt-12 text-center text-muted-foreground text-sm">
        <p>Disclaimer: None of your message, uploaded images or recording will be saved on this page after 30 minutes</p>
      </footer>
    </div>
  );
}
