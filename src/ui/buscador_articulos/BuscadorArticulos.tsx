import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuscadorArticulos } from './hooks/useBuscadorArticulos';
import { Articulo } from './types/articulo';

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
    setTermino(articulo.descripcion);
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
    <div ref={contenedorRef} className="relative w-full flex-1 rounded-lg">
      <div className="relative">
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
        {(mostrarResultados && (resultados.length > 0 || error)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              <ul className="py-2">
                {resultados.map((articulo) => (
                  <motion.li
                    key={articulo.id_articulo}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={() => handleSeleccionarArticulo(articulo)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{articulo.descripcion}</span>
                      <span className="text-gray-500">
                        Stock: {articulo.stock.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {articulo.codigo_barra && `Cod. Barras: ${articulo.codigo_barra} | `}
                      {articulo.precio_venta && `Cod. Interno: ${articulo.id_articulo} `}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
