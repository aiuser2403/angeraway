
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
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type ImageCropDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: Area) => void;
};

export default function ImageCropDialog({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  const onRotationChange = useCallback((value: number[]) => {
    setRotation(value[0]);
  }, []);

  const onCropCompleteInternal = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop and Adjust Image</DialogTitle>
        </DialogHeader>
        <div className="relative h-96 w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            onCropChange={onCropChange}
            onZoomChange={(zoom) => setZoom(zoom)}
            onRotationChange={(rotation) => setRotation(rotation)}
            onCropComplete={onCropCompleteInternal}
            aspect={undefined}
          />
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoom" className="text-right">
              Zoom
            </Label>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={onZoomChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rotation" className="text-right">
              Rotation
            </Label>
            <Slider
              id="rotation"
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={onRotationChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
