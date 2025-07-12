import { UsuarioViewModel } from "../../types/operador";
import { useUsuarios } from "../../hooks/querys/useUsuarios";
import { useEffect, useRef, useState } from "react";
import { Search, Users, AlertCircle, Loader2 } from "lucide-react";

interface TablaVendedoresMobileProps {
    onSelect?: (vendedor: UsuarioViewModel) => void;
}

export const TablaVendedoresMobile = ({ onSelect }: TablaVendedoresMobileProps) => {
    const { data: vendedores, isLoading, error, refetch } = useUsuarios();
    const [busqueda, setBusqueda] = useState("");
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState<UsuarioViewModel | null>(null);
    const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1);
    const inputBusquedaRef = useRef<HTMLInputElement>(null);

    // Filtrar vendedores basado en la búsqueda
    const vendedoresFiltrados = vendedores?.filter((vendedor) =>
        vendedor.op_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        vendedor.op_codigo.toString().includes(busqueda) ||
        vendedor.op_documento?.toLowerCase().includes(busqueda.toLowerCase())
    ) || [];

    useEffect(() => {
        if (inputBusquedaRef.current) {
            inputBusquedaRef.current.focus();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (vendedoresFiltrados.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setIndiceSeleccionado((prev) =>
                    prev < vendedoresFiltrados.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setIndiceSeleccionado((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                e.preventDefault();
                if (indiceSeleccionado >= 0) {
                    const vendedorSeleccionadoPorTeclado = vendedoresFiltrados[indiceSeleccionado];
                    handleVendedorSeleccionado(vendedorSeleccionadoPorTeclado);
                }
                break;
        }
    };

    const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setBusqueda(valor);
        setIndiceSeleccionado(-1);
    };

    const handleVendedorSeleccionado = (vendedor: UsuarioViewModel) => {
        setVendedorSeleccionado(vendedor);
        onSelect?.(vendedor);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Error al cargar vendedores</p>
                <button
                    onClick={() => refetch?.()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!vendedores?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <Users className="w-8 h-8" />
                <p className="font-medium">No hay vendedores disponibles</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Barra de búsqueda */}
            <div className="p-4 bg-gray-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        ref={inputBusquedaRef}
                        value={busqueda}
                        onChange={handleBusqueda}
                        onKeyDown={handleKeyDown}
                        type="text"
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Buscar vendedores..."
                    />
                </div>
            </div>

            {/* Lista de vendedores */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {vendedoresFiltrados.map((vendedor, index) => (
                        <div
                            key={vendedor.op_codigo}
                            onClick={() => handleVendedorSeleccionado(vendedor)}
                            className={`
                                p-4 border-b border-gray-100 cursor-pointer transition-colors
                                ${vendedorSeleccionado?.op_codigo === vendedor.op_codigo ? 'bg-blue-50 border-blue-200' : 
                                  indiceSeleccionado === index ? 'bg-blue-100' : 'hover:bg-gray-50'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">{vendedor.op_nombre}</p>
                                    <p className="text-xs text-gray-500">Código: {vendedor.op_codigo}</p>
                                    {vendedor.op_documento && (
                                        <p className="text-xs text-gray-500">Documento: {vendedor.op_documento}</p>
                                    )}
                                </div>
                                <div className="text-right text-sm">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {vendedor.op_rol || 'Vendedor'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};