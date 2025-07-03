import { useState } from 'react';
import { useIsMobileForPedidos } from '@/hooks/useIsMobile';
import FormularioPedidos from './FormularioPedidos';
import FormularioPedidosMobile from './FormularioPedidosMobile';
import { Smartphone, Monitor } from 'lucide-react';

interface FormularioPedidosWrapperProps {
  forceVersion?: 'mobile' | 'desktop' | 'auto';
}

const FormularioPedidosWrapper = ({ forceVersion = 'auto' }: FormularioPedidosWrapperProps) => {
  const isMobile = useIsMobileForPedidos();
  const [manualVersion, setManualVersion] = useState<'mobile' | 'desktop' | null>(null);

  // Determinar qué versión mostrar
  const shouldShowMobile = () => {
    if (forceVersion === 'mobile') return true;
    if (forceVersion === 'desktop') return false;
    if (manualVersion === 'mobile') return true;
    if (manualVersion === 'desktop') return false;
    return isMobile;
  };

  const showMobile = shouldShowMobile();

  // Solo mostrar controles de alternancia en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="relative">
      {/* Controles de alternancia (solo en desarrollo) */}
      {isDevelopment && forceVersion === 'auto' && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 border">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">Versión:</span>
            <button
              onClick={() => setManualVersion('mobile')}
              className={`p-1 rounded ${manualVersion === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              title="Forzar versión móvil"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setManualVersion('desktop')}
              className={`p-1 rounded ${manualVersion === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              title="Forzar versión desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setManualVersion(null)}
              className={`p-1 rounded ${manualVersion === null ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              title="Auto-detectar"
            >
              Auto
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {showMobile ? 'Móvil' : 'Desktop'} 
            {manualVersion && ` (Forzado)`}
          </div>
        </div>
      )}

      {/* Renderizar la versión correspondiente */}
      {showMobile ? <FormularioPedidosMobile /> : <FormularioPedidos />}
    </div>
  );
};

export default FormularioPedidosWrapper; 