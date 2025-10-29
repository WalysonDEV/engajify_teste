import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, XIcon } from './Icons';

interface ImageUploaderProps {
  onImageChange: (file: File, base64: string, mimeType: string) => void;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, onClear }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPreview(reader.result as string);
        onImageChange(file, base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setPreview(reader.result as string);
            onImageChange(file, base64String, file.type);
        };
        reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const clearImage = () => {
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onClear();
  }

  return (
    <div>
      <label 
        htmlFor="file-upload" 
        className={`relative block w-full h-48 border-2 border-dashed rounded-[12px] cursor-pointer transition-all duration-300 ${isDragging ? 'border-[var(--accent-primary)]' : 'border-[var(--border-color)]'} ${preview ? 'p-0 border-solid hover:border-gray-400' : 'flex flex-col items-center justify-center text-center p-4 hover:bg-[var(--button-secondary-bg)]'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-[10px]" />
            <button
              onClick={(e) => { e.preventDefault(); clearImage(); }}
              className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full p-1.5 transition-all transform hover:scale-110"
              aria-label="Remove image"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <UploadIcon className="w-10 h-10 text-gray-500 mb-2 mx-auto" />
              <span className="text-sm text-[var(--text-secondary)]">Arraste e solte ou <span className="font-semibold text-[var(--accent-primary)]">clique para enviar</span></span>
              <span className="text-xs text-gray-500 mt-1 block">PNG, JPG, WEBP</span>
            </div>
          </>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;