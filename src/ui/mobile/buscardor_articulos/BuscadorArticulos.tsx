import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuscadorArticulos } from '../../articulos/hooks/useBuscadorArticulos';
import { Articulo } from '../../articulos/types/articulo.type';
import { X } from 'lucide-react';
import { formatCurrency } from '@/ui/articulos/utils/formatCurrency';

interface BuscadorArticulosProps {
  onSeleccionarArticulo: (articulo: Articulo) => void;
  placeholder?: string;
  deposito?: number;
  stock?: boolean;
  moneda?: number;
}

export const BuscadorArticulos: React.FC<BuscadorArticulosProps> = ({
  onSeleccionarArticulo,
  placeholder = 'Buscar artículo...',
  deposito,
  stock,
  moneda
}) => {
  const { termino, setTermino, resultados, cargando, error } = useBuscadorArticulos({
    deposito,
    stock,
    moneda
  });
  const [mostrarResultados, setMostrarResultados] = React.useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    setMostrarResultados(false);
    onSeleccionarArticulo(articulo);
  };

  const handleLimpiar = () => {
    setTermino('');
    setMostrarResultados(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="relative w-full flex-1 rounded-lg">
        <input
          type="text"
          value={termino}
          onChange={(e) => {
            setTermino(e.target.value);
            setMostrarResultados(true);
          }}
          onFocus={() => setMostrarResultados(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
        />
        {termino && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleLimpiar}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
        {cargando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {mostrarResultados && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex flex-col"
          >
            <div className="bg-white p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Resultados de búsqueda</h2>
                <button 
                  onClick={() => setMostrarResultados(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={termino}
                  onChange={(e) => {
                    setTermino(e.target.value);
                  }}
                  placeholder={placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                  autoFocus
                />
                {termino && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleLimpiar}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
                {cargando && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {resultados.map((articulo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-gray-50 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => handleSeleccionarArticulo(articulo)}
                    >
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {articulo.descripcion}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {articulo.codigo_barra && (
                          <div className="truncate">Cod: {articulo.codigo_barra}</div>
                        )}
                        {articulo.cantidad_lote && (
                          <div className="truncate">Stock: {articulo.cantidad_lote}</div>
                        )}
                        {articulo.precio_venta_guaranies && (
                          <div className="font-semibold text-green-600">
                            ${formatCurrency(articulo.precio_venta_guaranies)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
