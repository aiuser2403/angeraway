
'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Mic, FileText, Smile, Square, Trash2, X, Music, RefreshCw } from 'lucide-react';
import FlushPotIcon from '@/components/icons/flush-pot-icon';
import { useToast } from '@/hooks/use-toast';
import * as Tone from 'tone';
import Image from 'next/image';
import ImageCropDialog from './image-crop-dialog';
import { getCroppedImg } from '@/lib/image-utils';

type PageState = 'idle' | 'flushing' | 'flushed';
type RecordingState = 'idle' | 'recording' | 'recorded' | 'denied';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const SUPPORTED_AUDIO_FORMATS = ['audio/wav', 'audio/x-aiff', 'audio/x-pcm', 'audio/mpeg', 'audio/webm'];


export default function HomePageClient() {
  const [angerText, setAngerText] = useState('');
  const [angerMedia, setAngerMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const showFlushButton = useMemo(() => {
    return angerText.length > 0 || angerMedia !== null || audioUrl !== null;
  }, [angerText, angerMedia, audioUrl]);

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

  const onCropComplete = useCallback(async (croppedAreaPixels: any) => {
    if (!rawImageForCrop) return;
    try {
      const croppedImageBlob = await getCroppedImg(rawImageForCrop, croppedAreaPixels);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(croppedImageBlob);

      const file = new File([croppedImageBlob], 'cropped-image.jpeg', { type: 'image/jpeg' });
      setAngerMedia(file);
      setIsCropDialogOpen(false);
      setRawImageForCrop(null);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error cropping image',
        description: 'Something went wrong while cropping the image. Please try again.',
      });
      setIsCropDialogOpen(false);
      setRawImageForCrop(null);
      setMediaPreview(null);
    }
  }, [rawImageForCrop, toast]);
  
  const handleCropDialogClose = () => {
    setIsCropDialogOpen(false);
    if (!angerMedia) { // If crop was cancelled without saving
      handleDiscardImage();
    }
  }

  const startRecording = async () => {
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
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
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
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
  
  const handleRerecord = () => {
    if(audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingState('idle');
    audioChunksRef.current = [];
    startRecording();
  };

  const handleDiscardAudio = () => {
    if(audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingState('idle');
    audioChunksRef.current = [];
  }

  const handleDiscardImage = () => {
    setAngerMedia(null);
    setMediaPreview(null);
    setRawImageForCrop(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }


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
      handleDiscardImage();
      handleDiscardAudio();
    }, 2000);
  };
  
  const handleReset = () => {
    setPageState('idle');
  }
  
  const renderMediaContent = () => {
    if (mediaPreview) {
      return (
        <div className="w-full h-full relative group">
          <Image src={mediaPreview} alt="Anger media preview" fill className="object-contain rounded-md" />
          <div className="absolute top-2 right-2 z-10">
              <Button size="icon" variant="destructive" onClick={handleDiscardImage} className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Discard Image</span>
              </Button>
          </div>
        </div>
      )
    }

    if (recordingState === 'recording') {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Mic className="h-16 w-16 text-red-500 animate-pulse" />
            <p className="mt-4 text-lg">Recording in progress...</p>
          </div>
        );
    }

    if (audioUrl) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Music className="h-16 w-16 text-primary" />
            <p className="text-lg mt-4 mb-4">Listen to your recording:</p>
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
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
    <>
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
                  
                  {audioUrl && recordingState !== 'recording' && (
                     <div className="border-t pt-4 flex gap-4 w-full">
                        <Button variant="outline" onClick={handleDiscardAudio} className="w-full justify-center">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Discard Audio
                        </Button>
                        <Button onClick={handleRerecord} className="w-full justify-center">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-record
                        </Button>
                      </div>
                  )}

                  {recordingState !== 'recording' && (
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
                         <Button variant="outline" onClick={handleRecordControl} className="w-full justify-center">
                          <Mic className="mr-2 h-4 w-4" />
                          {audioUrl ? 'Re-record' : 'Record Audio'}
                        </Button>
                    </div>
                  )}

                  {recordingState === 'recording' && (
                      <Button variant="destructive" onClick={handleRecordControl} className="w-full justify-center">
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                      </Button>
                  )}
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
      
      {rawImageForCrop && (
        <ImageCropDialog 
          isOpen={isCropDialogOpen}
          onClose={handleCropDialogClose}
          imageSrc={rawImageForCrop}
          onCropComplete={onCropComplete}
        />
      )}
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
