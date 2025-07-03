export const MOBILE_CONFIG = {
  // Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  
  // Configuración específica para pedidos
  pedidos: {
    breakpoint: 768,
    includeTablet: true,
    forceMobile: false
  },
  
  // User agents para detectar dispositivos móviles
  mobileUserAgents: [
    'Android',
    'webOS', 
    'iPhone',
    'iPad',
    'iPod',
    'BlackBerry',
    'IEMobile',
    'Opera Mini'
  ],
  
  // Configuración de touch
  touchConfig: {
    enableTouchDetection: true,
    minTouchPoints: 1
  }
};

// Función helper para detectar si es un dispositivo móvil por User Agent
export const isMobileByUserAgent = (): boolean => {
  const userAgent = navigator.userAgent;
  return MOBILE_CONFIG.mobileUserAgents.some(agent => 
    userAgent.includes(agent)
  );
};

// Función helper para detectar si tiene capacidades touch
export const hasTouchCapabilities = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Función helper para obtener el breakpoint actual
export const getCurrentBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  
  if (width <= MOBILE_CONFIG.breakpoints.mobile) return 'mobile';
  if (width <= MOBILE_CONFIG.breakpoints.tablet) return 'tablet';
  return 'desktop';
}; 