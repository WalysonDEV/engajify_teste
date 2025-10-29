import React, { useState, useEffect } from 'react';
import { CheckIcon, XIcon } from './Icons'; // Import XIcon

interface SnackbarProps {
  message: string;
  onClose: () => void;
  status?: 'success' | 'remove'; // New prop to determine type of notification
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose, status = 'success' }) => {
  const [animationState, setAnimationState] = useState('enter'); // 'enter', 'stamped', 'exit'

  useEffect(() => {
    // Start stamp animation shortly after entering
    const stampTimer = setTimeout(() => {
      setAnimationState('stamped');
    }, 100);

    // Start exit animation after a delay
    const exitTimer = setTimeout(() => {
      setAnimationState('exit');
    }, 3000);

    // Unmount component after exit animation finishes
    const cleanupTimer = setTimeout(() => {
      onClose();
    }, 3400); // 3000ms visible + 400ms exit animation

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(exitTimer);
      clearTimeout(cleanupTimer);
    };
  }, [onClose]);

  const getAnimationClass = () => {
    if (animationState === 'exit') return 'snackbar-exit-stamp';
    return 'snackbar-enter-stamp';
  };

  const getSnackbarClasses = () => {
    let classes = `snackbar fixed bottom-8 left-1/2 flex items-center gap-3 p-3 px-4 rounded-lg shadow-lg shadow-black/40 text-sm font-medium z-[100] overflow-hidden`;
    classes += ` ${getAnimationClass()}`;
    if (animationState === 'stamped') {
      classes += ` ${status === 'success' ? 'stamped' : 'removed'}`;
    }
    return classes;
  };

  return (
    <div
      className={getSnackbarClasses()}
      style={{
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'var(--text-primary)',
        transform: 'translateX(-50%)', // Initial transform, animations will override
      }}
    >
      {status === 'success' ? (
        <CheckIcon className="snackbar-icon-stamp w-5 h-5 text-green-400 flex-shrink-0" />
      ) : (
        <XIcon className="snackbar-icon-stamp w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};

export default Snackbar;