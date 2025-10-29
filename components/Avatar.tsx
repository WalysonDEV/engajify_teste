import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserIcon, UploadIcon } from './Icons';
import Loader from './Loader';

interface AvatarProps {
  uid: string;
  url: string | null;
  size: number;
  onUpload?: (filePath: string) => void;
}

const Avatar: React.FC<AvatarProps> = ({ uid, url, size, onUpload }) => {
  const [avatarLocalUrl, setAvatarLocalUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditable = !!onUpload;

  const downloadImage = useCallback(async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      }

      // Validate the Blob data before creating a URL
      if (data && data.size > 0 && data.type.startsWith('image/')) {
        const newUrl = URL.createObjectURL(data);
        setAvatarLocalUrl(prevUrl => {
            if (prevUrl) URL.revokeObjectURL(prevUrl); // Revoke previous Blob URL to prevent memory leaks
            return newUrl;
        });
      } else {
        console.warn('Downloaded avatar data is empty or not an image:', data);
        setAvatarLocalUrl(prevUrl => {
            if (prevUrl) URL.revokeObjectURL(prevUrl); // Revoke if data is invalid
            return null;
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error downloading image: ', error.message);
      }
      setAvatarLocalUrl(prevUrl => {
          if (prevUrl) URL.revokeObjectURL(prevUrl); // Revoke on error
          return null;
      });
    }
  }, []);

  useEffect(() => {
    if (url) {
      downloadImage(url);
    } else {
      setAvatarLocalUrl(prevUrl => {
          if (prevUrl) URL.revokeObjectURL(prevUrl); // Revoke if URL becomes null
          return null;
      });
    }

    // Cleanup function to revoke the last created URL when component unmounts
    return () => {
        setAvatarLocalUrl(prevUrl => {
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            return null; // Ensure state is cleaned
        });
    };
  }, [url, downloadImage]);


  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>) => {
    if (!isEditable || !onUpload) return;
    
    let file: File | undefined;

    if ('dataTransfer' in event) { // Drag event
      event.preventDefault(); // Prevent default browser behavior
      file = event.dataTransfer.files?.[0];
    } else { // Change event from input
      file = (event.target as HTMLInputElement).files?.[0];
    }

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`; // Unique file name
      const filePath = `${uid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      if (error instanceof Error) {
        alert('Erro ao enviar avatar: ' + error.message);
      } else {
        alert('Erro desconhecido ao enviar avatar.');
      }
    } finally {
      setUploading(false);
    }
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!isEditable) return;
    event.preventDefault();
    setIsDragging(true);
  }, [isEditable]);
  
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!isEditable) return;
    event.preventDefault();
    setIsDragging(false);
  }, [isEditable]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!isEditable) return;
    event.preventDefault();
    setIsDragging(false);
    uploadAvatar(event);
  }, [uploadAvatar, isEditable]);

  const Wrapper = isEditable ? 'label' : 'div';
  // Fix: Use `any` type for wrapperProps to accommodate conditional properties for `label` and `div` elements, resolving the TypeScript error.
  const wrapperProps: any = isEditable
    ? {
        htmlFor: `single-file-upload-${uid}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {};

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <Wrapper 
        {...wrapperProps}
        className={`absolute inset-0 rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden 
          ${isEditable ? 'cursor-pointer' : ''}
          ${isDragging ? 'border-[var(--accent-primary)]' : 'border-[var(--border-color)]'} 
          ${uploading ? 'opacity-60' : (isEditable ? 'hover:opacity-80' : '')}`}
      >
        {uploading ? (
          <div className="w-full h-full flex items-center justify-center"><Loader /></div>
        ) : avatarLocalUrl ? (
          <img
            src={avatarLocalUrl}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
            style={{ width: size, height: size }}
            onError={() => { // Final fallback if blob URL fails
                setAvatarLocalUrl(prevUrl => {
                    if (prevUrl) URL.revokeObjectURL(prevUrl);
                    return null;
                });
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-[var(--button-secondary-bg)] text-gray-400">
            <UserIcon className="w-2/3 h-2/3" />
          </div>
        )}
        {isEditable && !uploading && (
          <div className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 
            ${isDragging ? 'opacity-100' : 'hover:opacity-100'}`}>
            <UploadIcon className="w-8 h-8 text-white" />
          </div>
        )}
      </Wrapper>
      {isEditable && (
        <input
          type="file"
          id={`single-file-upload-${uid}`}
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          ref={fileInputRef}
          className="hidden"
        />
      )}
    </div>
  );
};

export default Avatar;