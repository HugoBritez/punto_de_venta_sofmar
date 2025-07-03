import { useEffect, useState, useRef } from "react";
import { BusquedaDTO } from "./types/BusquedaDTO.type";
import { useGetClientes } from "./hooks/useGetClientes";
import { Users, AlertCircle, Loader2, Search,  ArrowLeft } from "lucide-react";

interface BuscadorClientesMobileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect?: (cliente: any) => void;
}

const BuscadorClientesMobile = ({ isOpen, setIsOpen, onSelect }: BuscadorClientesMobileProps) => {
  const [busquedaParams, setBusquedaParams] = useState<BusquedaDTO>({
    busqueda: "",
    limite: 25,
    inactivos: false,
    saldocero: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { clientes, loading, error, getClientes } = useGetClientes();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setBusquedaParams((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSeleccionarCliente = () => {
    if (clientes && clientes.length > 0) {
      onSelect?.(clientes[selectedIndex]);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen || !clientes?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < clientes.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        handleSeleccionarCliente();
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [busquedaParams]);

  useEffect(() => {
    if (isOpen) {
      getClientes(busquedaParams);
    }
  }, [busquedaParams, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full h-[90%] rounded-t-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Buscar Cliente</h2>
          <div className="w-10"></div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={busquedaParams.busqueda}
                onChange={handleInputChange}
                id="busqueda"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar por nombre o CI..."
              />
            </div>
            <button
              onClick={() => getClientes(busquedaParams)}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Filtros simplificados */}
          <div className="mt-3 flex gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="inactivos"
                checked={busquedaParams.inactivos}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span>Inactivos</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="saldocero"
                checked={busquedaParams.saldocero}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span>Saldo &lt; 0</span>
            </label>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <AlertCircle className="w-8 h-8" />
              <p className="font-medium">Error al cargar clientes</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <Users className="w-8 h-8" />
              <p className="font-medium">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="p-2">
              {clientes.map((cliente, index) => (
                <div
                  key={cliente.cli_codigo}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                  className={`
                    p-4 border-b border-gray-100 cursor-pointer transition-colors
                    ${index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                    ${cliente.cli_estado === 0 ? 'bg-purple-50' : 
                      cliente.cli_estado === 2 ? 'bg-red-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{cliente.cli_razon}</p>
                      <p className="text-sm text-gray-500">Código: {cliente.cli_codigo}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Int: {cliente.cli_interno}</p>
                      <p>RUC: {cliente.cli_ruc}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="truncate">📞 {cliente.cli_tel}</p>
                    <p className="truncate">📍 {cliente.cli_dir}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSeleccionarCliente}
              disabled={clientes.length === 0}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscadorClientesMobile;