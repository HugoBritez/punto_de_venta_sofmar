import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, useMediaQuery } from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

// Interfaz para cada acción del menú
export interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Props del componente
export interface MobileActionMenuProps {
  actions: ActionItem[];
  className?: string;
  variant?: 'default' | 'floating';
  hideOnScroll?: boolean;
  scrollThreshold?: number;
}

export const MobileActionMenu: React.FC<MobileActionMenuProps> = ({
  actions,
  className = '',
  variant = 'default',
  hideOnScroll = true,
  scrollThreshold = 10
}) => {
  const [isMobile] = useMediaQuery('(max-width: 48em)');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Control de visibilidad basado en scroll
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar si se hace scroll hacia arriba o si está en la parte superior
      if (currentScrollY < lastScrollY || currentScrollY < scrollThreshold) {
        setIsVisible(true);
      } 
      // Ocultar si se hace scroll hacia abajo más allá del umbral
      else if (currentScrollY > lastScrollY + scrollThreshold) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle para mejorar rendimiento
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [hideOnScroll, lastScrollY, scrollThreshold]);

  // Solo mostrar en dispositivos móviles
  if (!isMobile) {
    return null;
  }

  // Limitar a máximo 4 acciones
  const limitedActions = actions.slice(0, 4);

  const getVariantStyles = () => {
    const baseTransition = 'transition-all duration-300 ease-in-out';
    
    switch (variant) {
      case 'floating':
        return {
          container: `fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${baseTransition}`,
          menu: 'bg-white shadow-2xl rounded-2xl border border-gray-200 p-2',
          item: 'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95'
        };
      default:
        return {
          container: `fixed bottom-0 left-0 right-0 z-50 ${baseTransition}`,
          menu: 'bg-white border-t border-gray-200 px-4 py-2',
          item: 'flex flex-col items-center justify-center p-2 transition-all duration-200 hover:bg-gray-50 active:scale-95'
        };
    }
  };

  const getActionStyles = (action: ActionItem) => {
    const baseStyles = 'flex flex-col items-center justify-center min-w-0 flex-1';
    
    if (action.disabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed`;
    }

    switch (action.variant) {
      case 'danger':
        return `${baseStyles} text-red-600 hover:text-red-700`;
      case 'primary':
        return `${baseStyles} text-blue-600 hover:text-blue-700`;
      case 'secondary':
        return `${baseStyles} text-gray-600 hover:text-gray-700`;
      default:
        return `${baseStyles} text-gray-700 hover:text-gray-900`;
    }
  };

  const styles = getVariantStyles();

  // Clases para controlar la visibilidad
  const visibilityClasses = hideOnScroll 
    ? isVisible 
      ? 'translate-y-0 opacity-100' 
      : 'translate-y-full opacity-0'
    : 'translate-y-0 opacity-100';

  return (
    <Box className={`${styles.container} ${visibilityClasses} ${className}`}>
      <Flex className={styles.menu}>
        {limitedActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`${styles.item} ${getActionStyles(action)}`}
              title={action.label}
            >
              <IconComponent 
                size={24} 
                className="mb-1"
              />
              <Text 
                fontSize="xs" 
                fontWeight="medium" 
                textAlign="center"
                className="truncate max-w-full"
              >
                {action.label}
              </Text>
            </button>
          );
        })}
      </Flex>
    </Box>
  );
};

export default MobileActionMenu;