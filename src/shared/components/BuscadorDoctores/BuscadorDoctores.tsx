import { useGetDoctores } from "@/shared/hooks/querys/useDoctores";
import { Doctor } from "@/shared/types/doctores";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BottomSheetComponent } from "../BottomSheet/BottomSheetComponent";
import Modal from "@/ui/modal/Modal";
import { useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";

interface BuscadorDoctoresProps {
    onSelect: (doctor: Doctor) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const BuscadorDoctores = ({ onSelect, onClose, isOpen }: BuscadorDoctoresProps) => {
    const { data: doctores } = useGetDoctores();
    const isMobile = useIsMobile({ breakpoint: 768 });
    const [busqueda, setBusqueda] = useState("");

    // Memoizar el handleSelect para evitar re-renderizados
    const handleSelect = useCallback((doctor: Doctor) => {
        console.log('BuscadorDoctores - handleSelect llamado con:', doctor);
        onSelect(doctor);
        onClose();
        setBusqueda("");
    }, [onSelect, onClose]);

    // Memoizar el filtrado de doctores
    const doctoresFiltrados = useMemo(() => {
        return doctores?.filter(doctor => 
            doctor.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
            doctor.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
            doctor.documento?.includes(busqueda) ||
            doctor.matricula?.toLowerCase().includes(busqueda.toLowerCase())
        ) || [];
    }, [doctores, busqueda]);

    // Memoizar el contenido del buscador
    const BuscadorContent = useMemo(() => (
        <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Buscar doctor..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Lista simple */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
                {doctoresFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {busqueda ? "No se encontraron doctores" : "No hay doctores disponibles"}
                    </div>
                ) : (
                    doctoresFiltrados.map((doctor) => (
                        <div
                            key={doctor.codigo}
                            onClick={() => handleSelect(doctor)}
                            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="font-medium text-gray-900">
                                {doctor.nombres} {doctor.apellidos}
                            </div>
                            {doctor.matricula && (
                                <div className="text-sm text-gray-600 mt-1">
                                    Mat. {doctor.matricula}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    ), [doctoresFiltrados, handleSelect, busqueda]);

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
            title="Seleccionar Doctor"
            maxWidth="max-w-7xl"
        >
            {BuscadorContent}
        </Modal>
    );
};