import { useEffect, useRef } from "react";
import { useState } from "react";


interface Preparador {
  op_codigo: number;
  op_nombre: string;
}


interface BusquedaPreparadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preparador: Preparador) => void;
  items: Preparador[];
  onSearch: (searchTerm: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
}


const BusquedaPreparador = ({
  isOpen,
  onClose,
  onSelect,
  items,
  onSearch,
  searchPlaceholder = "Buscar preparador...",
  isLoading = false,
}: BusquedaPreparadorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Un solo efecto para manejar la búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Limpiar el timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Solo buscar si hay al menos 3 caracteres
    if (value.trim().length >= 3) {
      timeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    }
  };

  // Limpiar al desmontar o cerrar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Limpiar al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            <button
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : items.length > 0 ? (
            <div className="divide-y">
              {items.map((preparador) => (
                <div
                  key={preparador.op_codigo}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onSelect(preparador);
                    onClose();
                  }}
                >
                  <div className="font-medium">{preparador.op_nombre}</div>
                </div>
              ))}
            </div>
          ) : searchTerm.length >= 3 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron preparadores
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Ingrese al menos 3 caracteres para buscar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusquedaPreparador;
