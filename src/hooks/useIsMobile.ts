import { useState, useEffect } from 'react';

interface UseIsMobileOptions {
  breakpoint?: number;
  includeTablet?: boolean;
  forceMobile?: boolean;
}

export const useIsMobile = (options: UseIsMobileOptions = {}) => {
  const {
    breakpoint = 768,
    includeTablet = false,
    forceMobile = false
  } = options;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Si se fuerza móvil, siempre retornar true
      if (forceMobile) {
        setIsMobile(true);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detectar por ancho de pantalla (criterio principal)
      const isMobileByWidth = width <= breakpoint;
      
      // Detectar por User Agent
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileByUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Detectar por orientación y tamaño (para tablets)
      const isTablet = includeTablet && width <= 1024 && height <= 1366;
      
      // Detectar por touch capabilities (solo para pantallas pequeñas)
      const hasTouchScreen = width <= breakpoint && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      // Priorizar el ancho de pantalla, solo considerar touch si la pantalla es pequeña
      setIsMobile(isMobileByWidth || isMobileByUA || isTablet || hasTouchScreen);
    };

    // Verificar al cargar
    checkIsMobile();

    // Verificar al cambiar tamaño de ventana
    window.addEventListener('resize', checkIsMobile);
    
    // Verificar al cambiar orientación
    window.addEventListener('orientationchange', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, [breakpoint, includeTablet, forceMobile]);

  return isMobile;
};

// Hook específico para pedidos - versión simplificada
export const useIsMobileForPedidos = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Inicializar con el valor correcto desde el principio
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1600;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const newIsMobile = width <= 1600;
      
      console.log('useIsMobileForPedidos:', {
        width,
        breakpoint: 1600,
        isMobile: newIsMobile,
        currentState: isMobile
      });
      
      setIsMobile(newIsMobile);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [isMobile]);

  return isMobile;
}; 