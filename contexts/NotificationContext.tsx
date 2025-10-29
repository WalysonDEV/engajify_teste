import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Snackbar from '../components/Snackbar';

interface NotificationContextType {
  showNotification: (message: string, status?: 'success' | 'remove') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{ message: string; key: number; status?: 'success' | 'remove' } | null>(null);

  const showNotification = useCallback((message: string, status: 'success' | 'remove' = 'success') => {
    setNotification({ message, key: Date.now(), status });
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Snackbar 
          key={notification.key} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
          status={notification.status}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};