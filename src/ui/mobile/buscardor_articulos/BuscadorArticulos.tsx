import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuscadorArticulos } from '../../articulos/hooks/useBuscadorArticulos';
import { Articulo } from '../../articulos/types/articulo.type';
import { X, Check } from 'lucide-react';
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
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [successItem, setSuccessItem] = useState<number | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    if (editingItem === articulo.id_lote) {
      const cantidadValida = Math.max(1, cantidad || 1);
      onSeleccionarArticulo({ ...articulo, cantidad: cantidadValida });
      setEditingItem(null);
      setCantidad(1);
      setSuccessItem(articulo.id_lote);
      setTimeout(() => {
        setSuccessItem(null);
      }, 1500);
    } else {
      setEditingItem(articulo.id_lote);
    }
  };

  const handleLimpiar = () => {
    setTermino('');
    setMostrarResultados(false);
    setEditingItem(null);
    setCantidad(1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
        setEditingItem(null);
        setCantidad(1);
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
            <X className="w-5 h-5" />
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
                    <X className="w-5 h-5" />
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
                  {resultados.map((articulo) => (
                    <motion.div
                      key={articulo.id_lote}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-gray-50 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                        editingItem === articulo.id_lote ? 'ring-2 ring-blue-500' : ''
                      } ${
                        successItem === articulo.id_lote ? 'bg-green-50 ring-2 ring-green-500' : ''
                      }`}
                      onClick={() => handleSeleccionarArticulo(articulo)}
                    >
                      {editingItem === articulo.id_lote ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {articulo.descripcion}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCantidad(prev => Math.max(1, prev - 1));
                              }}
                              className="bg-gray-200 text-gray-600 rounded-md p-1 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="w-12 text-center bg-white rounded-md p-1 border border-gray-300 text-sm"
                              value={cantidad}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                setCantidad(Math.max(1, value));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const cantidadValida = Math.max(1, cantidad || 1);
                                  onSeleccionarArticulo({ ...articulo, cantidad: cantidadValida });
                                  setEditingItem(null);
                                  setCantidad(1);
                                  setSuccessItem(articulo.id_lote);
                                  setTimeout(() => {
                                    setSuccessItem(null);
                                  }, 1500);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCantidad(prev => prev + 1);
                              }}
                              className="bg-gray-200 text-gray-600 rounded-md p-1 hover:bg-gray-300"
                            >
                              +
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const cantidadValida = Math.max(1, cantidad || 1);
                                onSeleccionarArticulo({ ...articulo, cantidad: cantidadValida });
                                setEditingItem(null);
                                setCantidad(1);
                                setSuccessItem(articulo.id_lote);
                                setTimeout(() => {
                                  setSuccessItem(null);
                                }, 1500);
                              }}
                              className="ml-auto bg-green-500 text-white rounded-md p-1 hover:bg-green-600"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
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
