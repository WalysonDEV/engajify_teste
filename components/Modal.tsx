import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, containerClassName }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        style={{ animation: 'fadeInFast 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
        onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`modal-surface rounded-[16px] shadow-lg shadow-black/30 w-full max-w-lg m-4 ${containerClassName || ''}`}
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-center flex-grow ml-8">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--button-secondary-bg)] transition-colors">
                <XIcon className="w-5 h-5 text-gray-400" />
            </button>
        </div>
        <div className="p-6">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;