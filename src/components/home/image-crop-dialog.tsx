
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
import { getCroppedImg } from '@/lib/image-utils';
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
                const blobUrl = URL.createObjectURL(croppedImageBlob);
                onSave(blobUrl);
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
     onSave(imageSrc);
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

    