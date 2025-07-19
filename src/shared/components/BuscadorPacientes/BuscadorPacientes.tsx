import { useGetPacientes } from "@/shared/hooks/querys/usePacientes";
import { Paciente } from "@/shared/types/paciente";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BottomSheetComponent } from "../BottomSheet/BottomSheetComponent";
import Modal from "@/ui/modal/Modal";
import { useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";

interface BuscadorPacientesProps {
    onSelect: (paciente: Paciente) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const BuscadorPacientes = ({ onSelect, onClose, isOpen }: BuscadorPacientesProps) => {
    const { data: pacientes, isLoading, error } = useGetPacientes();
    const isMobile = useIsMobile({ breakpoint: 768 });
    const [busqueda, setBusqueda] = useState("");

    // Memoizar el handleSelect para evitar re-renderizados
    const handleSelect = useCallback((paciente: Paciente) => {
        console.log('BuscadorPacientes - handleSelect llamado con:', paciente);
        
        // Simplemente pasar el paciente al padre y cerrar
        onSelect(paciente);
        onClose();
        setBusqueda("");
    }, [onSelect, onClose]);

    // Memoizar el filtrado de pacientes
    const pacientesFiltrados = useMemo(() => {
        return pacientes?.filter(paciente => 
            paciente.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
            paciente.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
            paciente.documento?.includes(busqueda) ||
            paciente.celular?.includes(busqueda)
        ) || [];
    }, [pacientes, busqueda]);

    // Memoizar el contenido del buscador
    const BuscadorContent = useMemo(() => (
        <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Mostrar estado de carga o error */}
            {isLoading && (
                <div className="text-center py-8 text-gray-500">
                    Cargando pacientes...
                </div>
            )}

            {error && (
                <div className="text-center py-8 text-red-500">
                    Error al cargar pacientes: {error.message}
                </div>
            )}

            {/* Lista simple */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
                {!isLoading && !error && pacientesFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {busqueda ? "No se encontraron pacientes" : "No hay pacientes disponibles"}
                    </div>
                ) : (
                    pacientesFiltrados.map((paciente) => (
                        <div
                            key={paciente.codigo}
                            onClick={() => handleSelect(paciente)}
                            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="font-medium text-gray-900">
                                {paciente.nombres} {paciente.apellidos}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                Doc. {paciente.documento}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    ), [busqueda, isLoading, error, pacientesFiltrados, handleSelect]);

    // Solo renderizar si está abierto
    if (!isOpen) return null;

    // Renderizar según dispositivo
    if (isMobile) {
        return (
            <BottomSheetComponent
                isOpen={isOpen}
                onClose={onClose}
                snapPoints={[25, 75, 90]}
                initialSnapPoint={1}
            >
                {BuscadorContent}
            </BottomSheetComponent>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Seleccionar Paciente"
            maxWidth="max-w-7xl"
        >
            {BuscadorContent}
        </Modal>
    );
};