import Modal from "@/ui/modal/Modal"
import { AlertTriangle } from "lucide-react"
import { ProyectoForm } from "./ProyectoForm"
import { useState } from "react"
import { ContactoCRM } from "../types/contactos.type"

interface AsociarProyectoAClienteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    operador: number
    esAdmin: boolean
    contactoCreado?: ContactoCRM
}

export const AsociarProyectoAClienteConfirmModal = ({ 
    isOpen,
    onClose,
    operador,
    esAdmin,
    contactoCreado
}: AsociarProyectoAClienteConfirmModalProps) => {
    const [isOpenFormProyecto, setIsOpenFormProyecto] = useState(false)
    
    const handleAsociarProyecto = () => {
        setIsOpenFormProyecto(true);
        // No cerrar el modal de confirmación aquí
        // onClose(); // Comentar esta línea
    };

    const handleCloseProyectoForm = () => {
        setIsOpenFormProyecto(false);
        onClose(); // Solo cerrar cuando se cierre el formulario de proyecto
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asociar proyecto a contacto"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
                {/* Icono de advertencia */}
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-blue-600" />
                </div>

                {/* Contenido */}
                <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                        ¿Asociar proyecto a contacto?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        ¿Quieres crear y asociar un nuevo proyecto a este contacto?
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleAsociarProyecto}
                    >
                        Asociar
                    </button>
                </div>
            </div>
            <ProyectoForm 
                isOpen={isOpenFormProyecto}
                onClose={handleCloseProyectoForm}
                operador={operador}
                esAdmin={esAdmin}
                contactoDefault={contactoCreado}
            /> 
        </Modal>
    )
}