import React, { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      setIsClosing(true);
      setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300); // Duración de la animación
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 150) {
      onClose();
    }
    setCurrentY(0);
  };

  if (!isVisible && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-4 right-4 bg-white rounded-2xl shadow-xl transition-all duration-300 ease-out pointer-events-auto z-[9999] ${
          isDragging ? 'transition-none' : ''
        } ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: isDragging ? `translateY(${currentY}px)` : undefined,
          height: '70vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-4" />
        
        {/* Content */}
        <div className="px-4 pb-4 h-[calc(70vh-3rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
