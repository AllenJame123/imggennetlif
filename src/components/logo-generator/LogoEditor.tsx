import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from 'sonner';
import LogoCropper from './LogoCropper';
import LoadingOverlay from './LoadingOverlay';
import LogoPreview from './LogoPreview';
import DownloadOptions from './DownloadOptions';

interface LogoEditorProps {
  logoUrl: string;
  onClose: () => void;
}

const LogoEditor = ({ logoUrl, onClose }: LogoEditorProps) => {
  const [showCropper, setShowCropper] = useState(false);
  const [editedLogo, setEditedLogo] = useState('');
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [downloadSize, setDownloadSize] = useState("512");
  const [downloadShape, setDownloadShape] = useState("square");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let objectUrl = '';

    const loadImage = async () => {
      if (!logoUrl) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // Create a new image element to test loading
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const loadImageDirectly = async (): Promise<string> => {
          return new Promise((resolve, reject) => {
            img.onload = () => {
              resolve(logoUrl);
            };
            img.onerror = (error) => {
              console.error('Direct image load failed:', error);
              reject(error);
            };
            img.src = logoUrl;
          });
        };

        const loadImageViaBlob = async (): Promise<string> => {
          const response = await fetch(logoUrl);
          if (!response.ok) throw new Error('Failed to fetch image');
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          return objectUrl;
        };

        try {
          // First try loading directly
          const directUrl = await loadImageDirectly();
          setEditedLogo(directUrl);
        } catch (directError) {
          // If direct loading fails, try via blob
          const blobUrl = await loadImageViaBlob();
          setEditedLogo(blobUrl);
        }
      } catch (error) {
        console.error('Error in image loading process:', error);
        toast.error('Failed to load image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setEditedLogo('');
      setIsLoading(false);
    };
  }, [logoUrl]);

  const handleCropComplete = (croppedImageUrl: string) => {
    setEditedLogo(croppedImageUrl);
    setShowCropper(false);
    toast.success('Logo cropped successfully!');
  };

  const handleDownload = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const size = parseInt(downloadSize);
      canvas.width = downloadShape === 'rectangle' ? size * 1.5 : size;
      canvas.height = downloadShape === 'rectangle' ? size : size;

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = editedLogo;
      });

      if (downloadShape === 'circle') {
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, `image/${downloadFormat}`)
      );

      if (!blob) throw new Error('Failed to create image blob');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logo-${Date.now()}.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Logo downloaded successfully!');
    } catch (error) {
      console.error('Error downloading logo:', error);
      toast.error('Failed to download logo');
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg max-w-xl w-full mx-auto space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Logo</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>



        <LogoPreview editedLogo={editedLogo} />

        <DownloadOptions
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          downloadSize={downloadSize}
          setDownloadSize={setDownloadSize}
          downloadShape={downloadShape}
          setDownloadShape={setDownloadShape}
          onCrop={() => setShowCropper(true)}
          onDownload={handleDownload}
          isEnabled={!!editedLogo}
        />
      </Card>

      {showCropper && editedLogo && (
        <LogoCropper
          imageUrl={editedLogo}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default LogoEditor;