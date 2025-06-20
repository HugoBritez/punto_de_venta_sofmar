import { createContext, useContext, useState, useCallback } from 'react';
import { Toast, type ToastType, type ToastPosition } from '../components/Notification/Toast';
import type { ReactNode } from 'react';

interface ToastContextType {
  showToast: (
    type: ToastType, 
    message: string, 
    description?: string, 
    position?: ToastPosition
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    description?: string;
    isVisible: boolean;
    position: ToastPosition;
  }>({
    type: 'info',
    message: '',
    isVisible: false,
    position: 'top-right',
  });

  const showToast = useCallback((
    type: ToastType, 
    message: string, 
    description?: string,
    position: ToastPosition = 'top-right'
  ) => {
    setToast({ type, message, description, isVisible: true, position });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        type={toast.type}
        message={toast.message}
        description={toast.description}
        isVisible={toast.isVisible}
        onClose={hideToast}
        position={toast.position}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};