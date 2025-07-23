import { useState } from "react"
import { OportunidadViewModel } from "../../types/oportunidades.type"
import { COLUMNAS_TABLERO } from "../../const/boardColumns"
import { ChevronRight, Filter, MoreVertical } from "lucide-react"
import { formatCurrency } from "@/ui/articulos/utils/formatCurrency"
import { EstadoChangeModal } from "./EstadoChangeModal"

interface MobileKanbanListProps {
    oportunidades: OportunidadViewModel[]
    onOportunidadClick: (oportunidad: OportunidadViewModel) => void
    onOportunidadMove: (oportunidadId: number, nuevoEstado: number, autorizadoPor: number) => void
}

export const MobileKanbanList = ({ 
    oportunidades, 
    onOportunidadClick,
    onOportunidadMove 
}: MobileKanbanListProps) => {
    const [selectedEstado, setSelectedEstado] = useState<number | 'todos'>('todos')
    const [showEstadoFilter, setShowEstadoFilter] = useState(false)
    const [oportunidadParaCambiar, setOportunidadParaCambiar] = useState<OportunidadViewModel | null>(null)
    const [showEstadoModal, setShowEstadoModal] = useState(false)

    const oportunidadesFiltradas = selectedEstado === 'todos' 
        ? oportunidades 
        : oportunidades.filter(op => op.estado === selectedEstado)

    const getEstadoInfo = (estado: number) => {
        return COLUMNAS_TABLERO.find(col => col.estado === estado) || {
            titulo: 'Desconocido',
            color: '#6B7280'
        }
    }

    const handleOpenEstadoModal = (oportunidad: OportunidadViewModel, event: React.MouseEvent) => {
        event.stopPropagation() // Evitar que se active el onClick del contenedor
        setOportunidadParaCambiar(oportunidad)
        setShowEstadoModal(true)
    }

    const handleEstadoChange = (oportunidadId: number, nuevoEstado: number, autorizadoPor: number) => {
        onOportunidadMove(oportunidadId, nuevoEstado, autorizadoPor)
    }

    return (
        <div className="space-y-4 mb-16 md:mb-0">
            {/* Filtro de Estado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Proyectos</h3>
                    <button
                        onClick={() => setShowEstadoFilter(!showEstadoFilter)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        {selectedEstado === 'todos' ? 'Todos' : getEstadoInfo(selectedEstado).titulo}
                    </button>
                </div>

                {/* Filtros de Estado */}
                {showEstadoFilter && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedEstado('todos')}
                            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                selectedEstado === 'todos'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todos ({oportunidades.length})
                        </button>
                        {COLUMNAS_TABLERO.map(columna => (
                            <button
                                key={columna.id}
                                onClick={() => setSelectedEstado(columna.estado)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                                    selectedEstado === columna.estado
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: columna.color }}
                                />
                                {columna.titulo} ({oportunidades.filter(op => op.estado === columna.estado).length})
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lista de Proyectos */}
            <div className="space-y-3">
                {oportunidadesFiltradas.map(oportunidad => {
                    const estadoInfo = getEstadoInfo(oportunidad.estado)
                    return (
                        <div 
                            key={oportunidad.codigo}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => onOportunidadClick(oportunidad)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: estadoInfo.color }}
                                        />
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                            {oportunidad.titulo}
                                        </h4>
                                    </div>
                                    
                                    <p className="text-xs text-gray-600 mb-2">
                                        {oportunidad.cliente}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{formatCurrency(oportunidad.valorNegociacion)}</span>
                                        <span>{estadoInfo.titulo}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Botón para cambiar estado */}
                                    <button
                                        onClick={(e) => handleOpenEstadoModal(oportunidad, e)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Cambiar estado"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                    
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {oportunidadesFiltradas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay proyectos en este estado</p>
                </div>
            )}

            {/* Modal para cambiar estado */}
            <EstadoChangeModal
                isOpen={showEstadoModal}
                onClose={() => setShowEstadoModal(false)}
                oportunidad={oportunidadParaCambiar}
                onEstadoChange={handleEstadoChange}
            />
        </div>
    )
}