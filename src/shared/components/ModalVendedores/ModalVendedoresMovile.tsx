import { UsuarioViewModel } from "../../types/operador";
import { ArrowLeft } from "lucide-react";
import { TablaVendedoresMobile } from "./TablaVendedoresMobile";

interface ModalVendedoresMobileProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSelect?: (vendedor: UsuarioViewModel) => void;
}

export const ModalVendedoresMobile = ({
    isOpen,
    setIsOpen,
    onSelect,
}: ModalVendedoresMobileProps) => {
    const handleVendedorSeleccionado = (vendedor: UsuarioViewModel) => {
        onSelect?.(vendedor);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end transition-all ease-in-out duration-300">
            <div className="bg-white w-full h-[95%] rounded-t-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800">Seleccionar Vendedor</h2>
                    <div className="w-10"></div> {/* Espaciador para centrar el título */}
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-hidden">
                    <TablaVendedoresMobile onSelect={handleVendedorSeleccionado} />
                </div>
            </div>
        </div>
    );
};