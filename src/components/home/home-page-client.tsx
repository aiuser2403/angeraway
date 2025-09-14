
'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Mic, FileText, Trash2, X, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ImageCropDialog from './image-crop-dialog';
import PleasantSmileyIcon from '@/components/icons/pleasant-smiley-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ToiletIcon from '../icons/toilet-icon';
import { blobToBase64 } from '@/lib/image-utils';

type PageState = 'idle' | 'confirming' | 'flushing' | 'flushed';
type RecordingState = 'idle' | 'recording' | 'recorded' | 'denied';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const STORAGE_KEY = 'anger-away-data';

type StoredData = {
  angerText: string;
  mediaPreview: string | null;
  audioUrl: string | null;
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
  const [audioKey, setAudioKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const flushAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  const isContentPresent = useMemo(() => {
    return angerText.trim().length > 0 || mediaPreview !== null || audioUrl !== null;
  }, [angerText, mediaPreview, audioUrl]);

  const toiletImage = PlaceHolderImages.find(img => img.id === 'toilet-background');

  const saveDataToLocalStorage = useCallback(() => {
    try {
      const data: StoredData = {
        angerText,
        mediaPreview,
        audioUrl,
      };
      
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to session storage:", error);
    }
  }, [angerText, mediaPreview, audioUrl]);
  
  const handleFile = (file: File) => {
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
    
    const imageUrl = URL.createObjectURL(file);
    setRawImageForCrop(imageUrl);
    setIsCropDialogOpen(true);
  };
  
  const handlePastedFile = async (file: File) => {
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
    
    const imageUrl = URL.createObjectURL(file);
    setRawImageForCrop(imageUrl);
    setIsCropDialogOpen(true);
  }

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handlePastedFile(file);
          event.preventDefault();
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  useEffect(() => {
    try {
      const storedDataString = sessionStorage.getItem(STORAGE_KEY);
      if (storedDataString) {
        const storedData: StoredData = JSON.parse(storedDataString);
        setAngerText(storedData.angerText || '');
        setMediaPreview(storedData.mediaPreview || null);
        if (storedData.audioUrl) {
            setAudioUrl(storedData.audioUrl);
            setRecordingState('recorded');
        }
      }
    } catch (error) {
      console.error("Error loading from session storage:", error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaPreview && mediaPreview.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreview);
      }
      if (rawImageForCrop && rawImageForCrop.startsWith('blob:')) {
        URL.revokeObjectURL(rawImageForCrop);
      }
    };
  }, [mediaPreview, rawImageForCrop]);

  useEffect(() => {
    if (pageState === 'idle') {
      saveDataToLocalStorage();
    }
  }, [angerText, mediaPreview, audioUrl, pageState, saveDataToLocalStorage]);

  useEffect(() => {
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
      handleFile(file);
    }
    event.target.value = '';
  };
  
  const handleImageSave = useCallback(async (imageBlob: Blob | null) => {
    setIsCropDialogOpen(false);
    
    if (mediaPreview && mediaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview);
    }
    
    if (rawImageForCrop) {
      URL.revokeObjectURL(rawImageForCrop);
      setRawImageForCrop(null);
    }
  
    if (imageBlob) {
      const base64 = await blobToBase64(imageBlob);
      setMediaPreview(base64);

    } else {
      setMediaPreview(null);
    }
  }, [mediaPreview, rawImageForCrop]);

  const handleCropDialogClose = () => {
    setIsCropDialogOpen(false);
    if(rawImageForCrop) {
      URL.revokeObjectURL(rawImageForCrop);
      setRawImageForCrop(null);
    }
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const startRecording = async () => {
    handleDiscardAudio();
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setAudioUrl(base64Audio);
            setAudioKey(prev => prev + 1);
        };
        reader.readAsDataURL(audioBlob);
        setRecordingState('recorded');

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

  const handleDiscardAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setRecordingState('idle');
    audioChunksRef.current = [];
    setIsAudioPlaying(false);
  }

  const handleDiscardImage = () => {
    if (mediaPreview && mediaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFlush = () => {
    if (flushAudioRef.current) {
        flushAudioRef.current.play().catch(e => console.error("Error playing flush sound:", e));
    }
    
    setPageState('flushing');

    setTimeout(() => {
      setPageState('flushed');
      setAngerText('');
      handleDiscardImage();
      handleDiscardAudio();

      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error removing from session storage:", error);
      }
    }, 5000);
  };

  const handleReset = () => {
    setPageState('idle');
  }

  const handleConfirm = () => {
    setPageState('confirming');
  }
  
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => setIsAudioPlaying(true);
      const handlePause = () => setIsAudioPlaying(false);
      const handleEnded = () => setIsAudioPlaying(false);

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioKey]);


  const renderMediaContent = () => {
    const imageContent = (
        <div className="relative flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 overflow-hidden">
        {mediaPreview ? (
            <div className="w-full h-full relative group">
            <Image src={mediaPreview} alt="Anger media preview" layout="fill" className="object-contain rounded-md" />
            {pageState === 'idle' && (
                <div className="absolute top-2 right-2 z-10">
                <Button size="icon" variant="destructive" onClick={handleDiscardImage} className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Discard Image</span>
                </Button>
                </div>
            )}
            </div>
        ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Upload or paste an image.</p>
            </div>
        )}
        </div>
    );
  
    const audioContent = recordingState === 'recording' ? (
      <div className="pt-4 flex flex-col items-center justify-center w-full">
        <Mic className="h-10 w-10 text-red-500 animate-pulse" />
        <p className="mt-2 text-lg">Recording...</p>
      </div>
    ) : audioUrl ? (
      <div className="border-t mt-4 pt-4 flex flex-col gap-2 w-full">
         <div className="flex items-center justify-center gap-2">
            <Button onClick={toggleAudioPlayback} size="sm" variant="outline">
              {isAudioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isAudioPlaying ? 'Pause' : 'Listen'}
            </Button>
            <Button onClick={handleDiscardAudio} size="sm" variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Discard
            </Button>
        </div>

        {audioUrl && (
          <audio
            key={audioKey}
            ref={audioRef}
            src={audioUrl}
            className="hidden"
          />
        )}
      </div>
    ) : null;
  
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="flex-grow flex flex-col">{imageContent}</div>
        {audioContent && (
          <div className="flex-shrink-0 flex items-center justify-center">
              {audioContent}
          </div>
        )}
      </div>
    );
  };
  
  const renderConfirmMediaContent = () => {
    const imageContent = mediaPreview ? (
        <div className="w-full h-full relative group">
          <Image src={mediaPreview} alt="Anger media preview" layout="fill" className="object-contain rounded-md" />
        </div>
    ) : (
      <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
        <ImageIcon className="mx-auto h-12 w-12" />
        <p className="mt-2">No image was uploaded.</p>
      </div>
    );
  
    const audioContent = audioUrl ? (
      <div className="border-t pt-4 mt-4 flex flex-col gap-2 w-full justify-center items-center">
        <p className="text-sm text-center text-muted-foreground">Your recording is ready.</p>
        <div className="flex items-center justify-center gap-2">
            <Button onClick={toggleAudioPlayback} size="sm" variant="outline">
              {isAudioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isAudioPlaying ? 'Pause' : 'Listen'}
            </Button>
        </div>
        <audio
            key={`confirm-${audioKey}`}
            ref={audioRef}
            src={audioUrl}
            className="hidden"
          />
      </div>
    ) : (
        <div className="border-t pt-4 mt-4 text-center text-muted-foreground flex flex-col items-center justify-center w-full">
            <Mic className="h-10 w-10" />
            <p className="mt-2">No recording was made.</p>
        </div>
    );
  
    return (
      <div className="flex flex-col h-full border-2 border-dashed border-gray-300 rounded-md p-4 overflow-hidden">
        <div className="flex-grow">
            {imageContent}
        </div>
        <div className="flex-shrink-0">
            {audioContent}
        </div>
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
            <p className="mt-2 text-lg text-muted-foreground">Write, record, or paste an image of why you're angry.</p>
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
            
            <Card className="shadow-lg transform hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Mic className="text-accent" />
                    Upload or Record
                </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                <div className="flex flex-col flex-grow justify-between min-h-[500px]">
                    <div className="flex-grow flex flex-col">
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
                                    <X className="mr-2 h-4 w-4" />
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
            
            <Card className="flex flex-col">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Mic className="text-accent" />
                    Your Media
                </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                <div className="flex flex-col h-full justify-between min-h-[500px]">
                    {renderConfirmMediaContent()}
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

  const renderFlushingState = () => {
    const flushingContentVariants = (from: 'top-left' | 'top-right' | 'bottom-center') => ({
      key: from,
      initial: {
        opacity: 1,
        x: from === 'top-left' ? '-150%' : from === 'top-right' ? '150%' : '0%',
        y: from.includes('top') ? '-150%' : '150%',
        scale: 1,
        rotate: Math.random() * 180 - 90,
      },
      animate: {
        x: '0%',
        y: '0%',
        scale: [1, 0.5, 0],
        rotate: [0, 360, 1080],
        transition: {
          duration: 2.5,
          ease: 'circIn',
          times: [0, 0.5, 1],
        },
      },
    });
  
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {toiletImage && (
          <Image
            src={toiletImage.imageUrl}
            alt={toiletImage.description}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 w-full h-full"
            unoptimized
            data-ai-hint={toiletImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative w-full h-full flex items-center justify-center">
          {angerText && (
            <motion.div
              className="w-40 sm:w-60 absolute"
              custom={'top-left'}
              variants={flushingContentVariants('top-left')}
              initial="initial"
              animate="animate"
            >
              <Card>
                <CardContent className="h-32 sm:h-48 p-2 rounded-md overflow-hidden">
                  <p className="text-sm line-clamp-[8]">{angerText}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {mediaPreview && (
            <motion.div
              className="w-40 sm:w-60 absolute"
              custom={'top-right'}
              variants={flushingContentVariants('top-right')}
              initial="initial"
              animate="animate"
            >
              <Card>
                <CardContent className="h-32 sm:h-48 p-1 rounded-md overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaPreview}
                      layout="fill"
                      className="object-cover rounded-md"
                      alt="anger media"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {audioUrl && (
            <motion.div
              className="w-40 sm:w-60 absolute"
              custom={'bottom-center'}
              variants={flushingContentVariants('bottom-center')}
              initial="initial"
              animate="animate"
            >
              <Card>
                <CardContent className="h-32 sm:h-48 p-2 rounded-md overflow-hidden flex items-center justify-center">
                  <Mic className="h-16 w-16 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  };
  
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
        <p>Note: Your Messages, images and recording are not saved on this page.</p>
      </footer>
    </div>
  );
}

    
    

    