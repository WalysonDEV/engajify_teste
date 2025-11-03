import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, XIcon } from './Icons';

interface ImageUploaderProps {
  onImageChange: (file: File, base64: string, mimeType: string) => void;
  onClear: () => void;
}

// Função auxiliar para comprimir imagens
const compressImage = (file: File, maxSizeKB: number = 500, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcula as novas dimensões mantendo a proporção
        // Limite máximo: 1920px na maior dimensão
        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converte para blob e verifica o tamanho
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Se falhar, retorna o arquivo original
              return;
            }
            
            const sizeKB = blob.size / 1024;
            
            // Se ainda for maior que o limite, reduz a qualidade
            if (sizeKB > maxSizeKB && quality > 0.1) {
              compressImage(file, maxSizeKB, quality - 0.1).then(resolve);
            } else {
              // Cria um novo File com o blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          file.type,
          quality
        );
      };
    };
  });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, onClear }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setIsCompressing(true);
    
    try {
      // Comprime a imagem antes de converter para base64
      // Limite de 500KB (ajuste conforme necessário, mas lembre-se do limite do Vercel)
      const compressedFile = await compressImage(file, 500, 0.8);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = compressedFile.type;
        setPreview(reader.result as string);
        onImageChange(compressedFile, base64String, mimeType);
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      // Se a compressão falhar, tenta com o arquivo original
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPreview(reader.result as string);
        onImageChange(file, base64String, file.type);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
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
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const clearImage = () => {
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onClear();
    setIsCompressing(false);
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
            {isCompressing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-[10px]">
                <span className="text-white text-sm">Comprimindo imagem...</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <UploadIcon className="w-10 h-10 text-gray-500 mb-2 mx-auto" />
              <span className="text-sm text-[var(--text-secondary)]">Arraste e solte ou <span className="font-semibold text-[var(--accent-primary)]">clique para enviar</span></span>
              <span className="text-xs text-gray-500 mt-1 block">PNG, JPG, WEBP (máx. recomendado: 2MB)</span>
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