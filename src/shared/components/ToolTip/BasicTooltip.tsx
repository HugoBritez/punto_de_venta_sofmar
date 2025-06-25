import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  tooltipClassName?: string;
  disabled?: boolean;
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0.3,
  className = '',
  tooltipClassName = '',
  disabled = false,
  maxWidth = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.top - tooltipRect.height - 8 + scrollY;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.bottom + 8 + scrollY;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
      case 'right':
        x = triggerRect.right + 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
    }

    // Ajustar posición para evitar que se salga de la pantalla
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setTooltipPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => calculatePosition(), 10);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
    setTimeout(() => calculatePosition(), 10);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-gray-800';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-gray-800';
      case 'left':
        return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-l-gray-800';
      case 'right':
        return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-r-gray-800';
      default:
        return '';
    }
  };

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    };

    switch (position) {
      case 'top':
        return {
          hidden: { opacity: 0, y: 10, scale: 0.8 },
          visible: { opacity: 1, y: 0, scale: 1 }
        };
      case 'bottom':
        return {
          hidden: { opacity: 0, y: -10, scale: 0.8 },
          visible: { opacity: 1, y: 0, scale: 1 }
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: 10, scale: 0.8 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -10, scale: 0.8 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      default:
        return baseVariants;
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`fixed z-10 pointer-events-none ${tooltipClassName}`}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              maxWidth: maxWidth
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={getAnimationVariants()}
            transition={{
              duration: 0.2,
              ease: "easeOut"
            }}
          >
            <div className="relative">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg">
                {content}
              </div>
              <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowPosition()}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de tooltip simplificado para casos básicos
export const SimpleTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ content, children, position = 'top' }) => {
  return (
    <Tooltip content={content} position={position}>
      {children}
    </Tooltip>
  );
};
