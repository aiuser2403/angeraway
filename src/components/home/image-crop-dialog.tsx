
'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { type Point, type Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg, blobToBase64 } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';

type ImageCropDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (newImage: string | null) => void;
};

export default function ImageCropDialog({ isOpen, onClose, imageSrc, onSave }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const { toast } = useToast();

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels) {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImageBlob) {
                // For persistence, we convert to base64. For display, blob URL would be more performant
                // but adds complexity with cleanup. Base64 is more stable for this use case.
                const base64 = await blobToBase64(croppedImageBlob);
                onSave(base64);
            } else {
                onSave(null);
            }
          } catch (e) {
            console.error(e);
            toast({
              variant: 'destructive',
              title: 'Error cropping image',
              description: 'Something went wrong. Please try again.',
            });
            onSave(null);
          }
    }
  };

  const handleUseFullImage = () => {
     // If the src is already a data URL, just use it.
    if (!imageSrc.startsWith('blob:')) {
        onSave(imageSrc);
        return;
    }
    // If it's a blob, we need to convert it to save it.
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => blobToBase64(blob))
      .then(base64 => {
        onSave(base64);
      })
      .catch(err => {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error processing image' });
        onSave(null);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="relative h-96 w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleUseFullImage} className="w-full sm:w-auto">Use Full Image</Button>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} className="w-full">Cancel</Button>
                <Button onClick={handleSave} className="w-full">Save Crop</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    