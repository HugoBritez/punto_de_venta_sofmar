import { OportunidadViewModel } from "../../types/oportunidades.type"
import { COLUMNAS_TABLERO } from "../../const/boardColumns"
import { X, ArrowRight } from "lucide-react"

interface EstadoChangeModalProps {
    isOpen: boolean
    onClose: () => void
    oportunidad: OportunidadViewModel | null
    onEstadoChange: (oportunidadId: number, nuevoEstado: number, autorizadoPor: number) => void
}

export const EstadoChangeModal = ({
    isOpen,
    onClose,
    oportunidad,
    onEstadoChange
}: EstadoChangeModalProps) => {
    if (!isOpen || !oportunidad) return null

    const getEstadoInfo = (estado: number) => {
        return COLUMNAS_TABLERO.find(col => col.estado === estado) || {
            titulo: 'Desconocido',
            color: '#6B7280'
        }
    }

    const estadoActual = getEstadoInfo(oportunidad.estado)

    const handleEstadoChange = (nuevoEstado: number) => {
        onEstadoChange(oportunidad.codigo, nuevoEstado, oportunidad.autorizadoPor || 0)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50  flex items-end justify-center">
            <div className="bg-white rounded-t-xl w-full max-w-md max-h-[100vh] overflow-hidden mb-24">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Cambiar Estado
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-4">
                    {/* Proyecto actual */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                            {oportunidad.titulo}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                            {oportunidad.cliente}
                        </p>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: estadoActual.color }}
                            />
                            <span className="text-sm text-gray-600">
                                Estado actual: {estadoActual.titulo}
                            </span>
                        </div>
                    </div>

                    {/* Opciones de estado */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Selecciona el nuevo estado:
                        </p>
                        
                        {COLUMNAS_TABLERO.map(columna => {
                            const isCurrentState = columna.estado === oportunidad.estado
                            return (
                                <button
                                    key={columna.id}
                                    onClick={() => handleEstadoChange(columna.estado)}
                                    disabled={isCurrentState}
                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                        isCurrentState
                                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                                            : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: columna.color }}
                                        />
                                        <div className="text-left">
                                            <p className={`font-medium ${
                                                isCurrentState ? 'text-gray-400' : 'text-gray-900'
                                            }`}>
                                                {columna.titulo}
                                            </p>
                                            {isCurrentState && (
                                                <p className="text-xs text-gray-400">
                                                    Estado actual
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {!isCurrentState && (
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}