import React, { ReactNode, useEffect } from 'react';
import './SideMenu.css';

interface SideMenuProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  width?: number;
}

const DEFAULT_MENU_WIDTH = 280;

export const SideMenu: React.FC<SideMenuProps> = ({
  children,
  isOpen,
  onClose,
  width = DEFAULT_MENU_WIDTH,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`side-menu-overlay ${isOpen ? 'overlay-visible' : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Menú lateral */}
      <div 
        className={`side-menu ${isOpen ? 'menu-visible' : ''}`}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </>
  );
};
