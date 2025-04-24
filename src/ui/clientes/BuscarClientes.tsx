import { useEffect, useState, useRef } from "react";
import { BusquedaDTO } from "./types/BusquedaDTO.type";
import { useGetClientes } from "./hooks/useGetClientes";
import { Users, AlertCircle, Loader2 } from "lucide-react";

interface BuscarClientesProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect?: (cliente: any) => void;
}

const TablaClientes = ({ clientes, onSelect, selectedIndex }: { 
  clientes: any[], 
  onSelect?: (cliente: any) => void,
  selectedIndex: number 
}) => {
  return (
    <table className="w-full border-collapse">
      <thead className="bg-blue-500 sticky top-0">
        <tr className="[&>th]:p-3 [&>th]:text-left [&>th]:font-bold [&>th]:text-white [&>th]:border-b [&>th]:border-gray-200 [&>th]:text-sm [&>th]:border-x">
          <th>Código</th>
          <th>Código Interno</th>
          <th>Razón Social</th>
          <th>RUC</th>
          <th>Teléfono</th>
          <th>Dirección</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente, index) => (
          <tr 
            key={cliente.cli_codigo}
            onClick={() => onSelect?.(cliente)}
            className={`
              hover:bg-blue-50 cursor-pointer transition-colors duration-150 
              [&>td]:p-3 [&>td]:border-b [&>td]:border-gray-200 [&>td]:border-x
              ${
                index === selectedIndex ? 'bg-blue-100' :
                cliente.estado === 0 ? 'bg-purple-300' :
                cliente.estado === 1 ? 'bg-white' :
                cliente.estado === 2 ? 'bg-red-300' : ''
              }
            `}
          >
            <td>{cliente.cli_codigo}</td>
            <td>{cliente.cli_interno}</td>
            <td className="font-medium">{cliente.cli_razon}</td>
            <td>{cliente.cli_ruc}</td>
            <td>{cliente.cli_tel}</td>
            <td>{cliente.cli_dir}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const NoClientesComponent = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Users className="w-8 h-8" />
        <p className="font-medium">No se encontraron clientes</p>
      </div>
    </div>
  );
};

const ErrorComponent = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="font-medium">Error al cargar los clientes</p>
      </div>
    </div>
  );
};

const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin text-blue-500">
          <Loader2 className="w-8 h-8" />
        </div>
        <p className="text-gray-600 font-medium">Cargando clientes...</p>
      </div>
    </div>
  );
};

const LayoutTablaClientes = ({ loading, error, clientes, onSelect, selectedIndex }: { 
  loading: boolean, 
  error: any, 
  clientes: any[],
  onSelect?: (cliente: any) => void,
  selectedIndex: number 
}) => {
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent />;
  if (clientes.length === 0) return <NoClientesComponent />;
  return <TablaClientes clientes={clientes} onSelect={onSelect} selectedIndex={selectedIndex} />;
};

const BuscarClientes = ({
  isOpen,
  setIsOpen,
  onSelect,
}: BuscarClientesProps) => {
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
        case 'Tab':
        case 'Escape':
          e.preventDefault();
          inputRef.current?.focus();
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

  return (
    <div 
      className="flex flex-col h-full w-full p-2 gap-2"
      tabIndex={-1}
    >
      <div className="flex flex-row gap-2 w-full bg-blue-200 rounded-lg p-2 items-end">
        <input
          ref={inputRef}
          type="text"
          value={busquedaParams.busqueda}
          onChange={handleInputChange}
          id="busqueda"
          autoComplete="off"
          className="flex-1 rounded-md p-2 border-2 outline-none focus:border-blue-500 bg-white text-gray-600 font-semibold text-lg focus:shadow-lg transition-all duration-300"
          placeholder="Buscar Cliente por nombre o CI"
        />
        <div className="flex flex-col gap-2 ">
          <label
            htmlFor="cantidad"
            className="text-gray-600 font-semibold text-md"
          >
            Cant. Lim.
          </label>
          <input
            type="number"
            value={busquedaParams.limite}
            onChange={handleInputChange}
            id="limite"
            className="w-[5rem] rounded-md p-2 border-2 outline-none focus:border-blue-500 bg-white text-gray-600 font-semibold text-lg focus:shadow-lg transition-all duration-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <input
              className="w-4 h-4 cursor-pointer "
              type="checkbox"
              id="inactivos"
              checked={busquedaParams.inactivos}
              onChange={handleInputChange}
            />
            <label
              className="text-gray-600 font-semibold text-lg"
              htmlFor="inactivos"
            >
              Inactivos e Inhabilitados
            </label>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <input
              className="w-4 h-4 cursor-pointer "
              type="checkbox"
              id="saldocero"
              checked={busquedaParams.saldocero}
              onChange={handleInputChange}
            />
            <label
              className="text-gray-600 font-semibold text-lg"
              htmlFor="saldocero"
            >
              Solo saldo &lt; 0
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-md p-2 bg-white shadow-sm items-">
          <div className="flex flex-row gap-1 items-center">
            <div className="rounded-full w-4 h-4 bg-white shadow-sm border border-gray-300" />
            <label className="text-gray-600 font-semibold text-md">
              Activos
            </label>
          </div>
          <div className="flex flex-row gap-1 items-center  ">
            <div className="rounded-full w-4 h-4 bg-purple-400   shadow-sm border border-gray-300" />
            <label className="text-gray-600 font-semibold text-md">
              Inactivos
            </label>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <div className="rounded-full w-4 h-4 bg-red-400 shadow-sm border border-gray-300" />
            <label className="text-gray-600 font-semibold text-md">
              Inhabilitados
            </label>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <div className="rounded-full w-4 h-4 bg-orange-400 shadow-sm border border-gray-300" />
            <label className="text-gray-600 font-semibold text-md">
              Cons. en Administración
            </label>
          </div>
        </div>
      </div>
      <div className="h-[35rem] bg-white rounded-lg shadow-sm overflow-y-auto border border-gray-300">
        <LayoutTablaClientes
          loading={loading}
          error={error}
          clientes={clientes}
          onSelect={onSelect}
          selectedIndex={selectedIndex}
        />
      </div>
      <div className="flex justify-end mt-2 bg-blue-200 rounded-lg p-2 items-end gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-150 font-medium"
        >
          Cerrar
        </button>
        <button
          onClick={handleSeleccionarCliente}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 font-medium"
        >
          Seleccionar Cliente
        </button>
      </div>
    </div>
  );
};

export default BuscarClientes;
