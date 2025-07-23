import Modal from "@/ui/modal/Modal"
import { Trash2, AlertTriangle } from "lucide-react"

interface DeleteFileConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onDelete: () => void
    fileName?: string
    isLoading?: boolean
}

export const DeleteFileConfirmModal = ({ 
    isOpen, 
    onClose, 
    onDelete, 
    fileName,
    isLoading = false 
}: DeleteFileConfirmModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Eliminar archivo"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
                {/* Icono de advertencia */}
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                {/* Contenido */}
                <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                        ¿Eliminar archivo?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {fileName ? (
                            <>
                                ¿Estás seguro de que quieres eliminar <span className="font-medium text-gray-900">"{fileName}"</span>?
                            </>
                        ) : (
                            "¿Estás seguro de que quieres eliminar este archivo?"
                        )}
                        <br />
                        <span className="text-sm text-gray-500">
                            Esta acción no se puede deshacer.
                        </span>
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={onDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}