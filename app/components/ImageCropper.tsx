import React, { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useTheme } from "next-themes";

interface ImageCropperProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
}) => {
  const { theme } = useTheme();
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const calculateSquareCrop = useCallback((img: HTMLImageElement) => {
    const { width, height } = img;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    return {
      unit: "px" as const,
      x,
      y,
      width: size,
      height: size,
    };
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return resolve("");

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve("");
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
    onCropComplete(croppedImage);
    onClose();
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  const handleClose = useCallback(() => {
    setCrop({
      unit: "%",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    setCompletedCrop(undefined);
    onClose();
  }, [onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className={`${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        } rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Crop Avatar</h3>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className={`mb-4 ${theme === "dark" ? "crop-dark" : ""}`}>
            <ReactCrop
              crop={crop}
              onChange={(c: Crop) => setCrop(c)}
              onComplete={(c: PixelCrop) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-w-full max-h-64 object-contain"
                onLoad={() => {
                  if (imgRef.current) {
                    const squareCrop = calculateSquareCrop(imgRef.current);
                    setCrop(squareCrop);
                    setCompletedCrop(squareCrop as PixelCrop);
                  }
                }}
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete} disabled={!completedCrop}>
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(ImageCropper);
