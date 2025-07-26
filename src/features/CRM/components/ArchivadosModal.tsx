import Modal from "@/ui/modal/Modal"
import { OportunidadViewModel } from "../types/oportunidades.type"
import { useOportunidadesArchivadas } from "../hooks/useCRM"
import { formatCurrency } from "@/ui/articulos/utils/formatCurrency"
import { Calendar, User, Clock, Loader2, Archive, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { DetalleProyectoModal } from "./DetalleProyectoModal"

interface ArchivadosModalProps {
    isOpen: boolean,
    onClose: ()=> void
    fechaDesde?: Date,
    fechaHasta?: Date,
    esAdmin: boolean,
    operador: number
}

export const ArchivadosModal = (
    {
        isOpen, onClose, fechaDesde, fechaHasta, esAdmin, operador
    } : ArchivadosModalProps
) => {

    const { data: oportunidadesArchivadas, isLoading: isLoadingOportunidadesArchivadas} = useOportunidadesArchivadas(
        esAdmin, operador, fechaDesde, fechaHasta
    )

    // Estado para controlar el modal de detalles
    const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState<OportunidadViewModel | null>(null)
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false)

    // Función para obtener el texto del estado de oportunidad
    const getEstadoOportunidadText = (estado: number): string => {
        switch (estado) {
            case 1: return 'En Planeación';
            case 2: return 'En Negociación';
            case 3: return 'Lograda';
            case 4: return 'Fallada';
            default: return 'Desconocido';
        }
    }

    // Función para obtener el color del estado
    const getEstadoColor = (estado: number): string => {
        switch (estado) {
            case 1: return 'bg-blue-100 text-blue-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-green-100 text-green-800';
            case 4: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    // Función para manejar el clic en una oportunidad
    const handleOportunidadClick = (oportunidad: OportunidadViewModel) => {
        setOportunidadSeleccionada(oportunidad)
        setIsDetalleModalOpen(true)
    }

    // Función para cerrar el modal de detalles
    const handleCloseDetalleModal = () => {
        setIsDetalleModalOpen(false)
        setOportunidadSeleccionada(null)
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Oportunidades archivadas"
            >
                <div className="flex flex-col gap-4 p-4 max-h-[70vh] overflow-y-auto">
                    {/* Estado de carga */}
                    {isLoadingOportunidadesArchivadas && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="text-gray-600 font-medium">
                                    Cargando oportunidades archivadas...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Lista de oportunidades archivadas */}
                    {!isLoadingOportunidadesArchivadas && oportunidadesArchivadas && (
                        <>
                            {/* Contador de resultados */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 border-b border-gray-200 pb-2">
                                <Archive className="w-4 h-4" />
                                <span>
                                    {oportunidadesArchivadas.length} oportunidad{oportunidadesArchivadas.length !== 1 ? 'es' : ''} archivada{oportunidadesArchivadas.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Lista de oportunidades */}
                            <div className="space-y-3">
                                {oportunidadesArchivadas.length > 0 ? (
                                    oportunidadesArchivadas.map((oportunidad, index) => (
                                        <motion.div
                                            key={oportunidad.codigo}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                                            onClick={() => handleOportunidadClick(oportunidad)}
                                        >
                                            {/* Header con título y estado */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                                        {oportunidad.titulo || 'Sin título'}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(oportunidad.estado)}`}>
                                                            {getEstadoOportunidadText(oportunidad.estado)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            #{oportunidad.codigo}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOportunidadClick(oportunidad)
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Información del cliente */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-1 bg-blue-100 rounded-md">
                                                    <User className="w-3 h-3 text-blue-700" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {oportunidad.clienteNombre}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        RUC: {oportunidad.clienteRuc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Información de fechas */}
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="p-1 bg-orange-100 rounded-md">
                                                        <Calendar className="w-3 h-3 text-orange-700" />
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        <span className="font-medium">Inicio:</span> {new Date(oportunidad.fechaInicio).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {oportunidad.fechaFin && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="p-1 bg-gray-100 rounded-md">
                                                            <Clock className="w-3 h-3 text-gray-600" />
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            <span className="font-medium">Fin:</span> {new Date(oportunidad.fechaFin).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información adicional */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-green-600">
                                                        {formatCurrency(oportunidad.valorNegociacion)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-medium">Operador:</span> {oportunidad.operadorNombre}
                                                </div>
                                            </div>

                                            {/* Información de autorización */}
                                            {oportunidad.autorizadoPor && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Autorizado por:</span> {oportunidad.autorizadoPorNombre} - {oportunidad.autorizadoPorCargo}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium mb-1">
                                            No hay oportunidades archivadas
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Las oportunidades archivadas aparecerán aquí
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal de detalles de la oportunidad */}
            <DetalleProyectoModal
                oportunidad={oportunidadSeleccionada}
                isOpen={isDetalleModalOpen}
                onClose={handleCloseDetalleModal}
            />
        </>
    )
}