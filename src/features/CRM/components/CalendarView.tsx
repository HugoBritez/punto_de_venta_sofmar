import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Bell, Clock, CheckCircle, AlertCircle, X } from "lucide-react"
import { useTareasByOperador } from "../hooks/useCRM"
import { useAuth } from "@/services/AuthContext"
import { DetalleProyectoModal } from "./DetalleProyectoModal"
import { OportunidadViewModel } from "../types/oportunidades.type"

interface CalendarViewProps {
    oportunidades: OportunidadViewModel[]
}

// Modal para mostrar tareas del día seleccionado
const TareasDiaModal = ({ 
    isOpen, 
    onClose, 
    tareas, 
    fecha, 
    onTareaClick 
}: { 
    isOpen: boolean
    onClose: () => void
    tareas: any[]
    fecha: Date
    onTareaClick: (tarea: any) => void
}) => {
    if (!isOpen) return null

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getEstadoTareaIcon = (estado: number) => {
        switch (estado) {
            case 0:
                return <Clock className="w-4 h-4 text-yellow-500" />
            case 1:
                return <AlertCircle className="w-4 h-4 text-blue-500" />
            case 2:
                return <CheckCircle className="w-4 h-4 text-green-500" />
            default:
                return <Clock className="w-4 h-4 text-gray-500" />
        }
    }

    const getEstadoTareaText = (estado: number) => {
        switch (estado) {
            case 0:
                return "Pendiente"
            case 1:
                return "En Progreso"
            case 2:
                return "Completada"
            default:
                return "Desconocido"
        }
    }

    const getEstadoTareaColor = (estado: number) => {
        switch (estado) {
            case 0:
                return "bg-yellow-100 text-yellow-800"
            case 1:
                return "bg-blue-100 text-blue-800"
            case 2:
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Tareas del {formatDate(fecha)}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} encontrada{tareas.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {tareas.length > 0 ? (
                        <div className="space-y-4">
                            {tareas.map((tarea) => (
                                <div
                                    key={tarea.codigo}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => onTareaClick(tarea)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getEstadoTareaIcon(tarea.estado)}
                                                <h3 className="font-medium text-gray-900">
                                                    {tarea.titulo || 'Sin título'}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                <span>#{tarea.codigo}</span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getEstadoTareaColor(tarea.estado)}`}>
                                                    {getEstadoTareaText(tarea.estado)}
                                                </span>
                                            </div>

                                            {tarea.descripcion && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {tarea.descripcion}
                                                </p>
                                            )}

                                            {tarea.oportunidad && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Proyecto: #{tarea.oportunidad}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay tareas programadas
                            </h3>
                            <p className="text-gray-500">
                                No tienes tareas pendientes para el {formatDate(fecha)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const CalendarView = ({ oportunidades }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedOportunidad, setSelectedOportunidad] = useState<OportunidadViewModel | null>(null)
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false)
    const [isTareasDiaModalOpen, setIsTareasDiaModalOpen] = useState(false)

    const auth = useAuth()
    const operador = Number(auth.auth?.userId)

    // Obtener tareas del operador
    const { data: tareas = [], isLoading: isLoadingTareas } = useTareasByOperador(operador)

    // Obtener el primer día del mes y el número de días
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())
        
        const days = []
        const current = new Date(startDate)
        
        while (current <= lastDay || current.getDay() !== 0) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
        
        return days
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        const dayTareas = getTareasForDate(date)
        
        // Si hay tareas para ese día, abrir el modal
        if (dayTareas.length > 0) {
            setIsTareasDiaModalOpen(true)
        }
    }

    // Obtener tareas para una fecha específica
    const getTareasForDate = (date: Date) => {
        return tareas.filter(tarea => {
            // Usar fechaLimite si existe, sino usar fecha
            const tareaDate = tarea.fechaLimite ? new Date(tarea.fechaLimite) : new Date(tarea.fecha)
            return tareaDate.toDateString() === date.toDateString()
        })
    }

    // Obtener tareas para recordatorios (próximas 7 días)
    const getTareasProximas = () => {
        const hoy = new Date()
        const proximaSemana = new Date()
        proximaSemana.setDate(hoy.getDate() + 7)

        return tareas
            .filter(tarea => {
                // Usar fechaLimite si existe, sino usar fecha
                const tareaDate = tarea.fechaLimite ? new Date(tarea.fechaLimite) : new Date(tarea.fecha)
                return tareaDate >= hoy && tareaDate <= proximaSemana
            })
            .sort((a, b) => {
                // Ordenar por fechaLimite si existe, sino por fecha
                const fechaA = a.fechaLimite ? new Date(a.fechaLimite) : new Date(a.fecha)
                const fechaB = b.fechaLimite ? new Date(b.fechaLimite) : new Date(b.fecha)
                return fechaA.getTime() - fechaB.getTime()
            })
            .slice(0, 5) // Mostrar solo las próximas 5
    }

    // Función helper para obtener el icono del estado de la tarea
    const getEstadoTareaIcon = (estado: number) => {
        switch (estado) {
            case 0:
                return <Clock className="w-3 h-3" />
            case 1:
                return <AlertCircle className="w-3 h-3" />
            case 2:
                return <CheckCircle className="w-3 h-3" />
            default:
                return <Clock className="w-3 h-3" />
        }
    }

    // Función helper para obtener el color del estado
    const getEstadoTareaColor = (estado: number) => {
        switch (estado) {
            case 0:
                return 'bg-yellow-500' // Pendiente
            case 1:
                return 'bg-red-500' // En progreso
            case 2:
                return 'bg-green-500' // Completada
            default:
                return 'bg-gray-500'
        }
    }

    // Función helper para formatear fecha
    const formatDate = (date: Date | string) => {
        const fecha = new Date(date)
        const hoy = new Date()
        const ayer = new Date(hoy)
        ayer.setDate(hoy.getDate() - 1)
        const manana = new Date(hoy)
        manana.setDate(hoy.getDate() + 1)

        if (fecha.toDateString() === hoy.toDateString()) {
            return 'Hoy'
        } else if (fecha.toDateString() === ayer.toDateString()) {
            return 'Ayer'
        } else if (fecha.toDateString() === manana.toDateString()) {
            return 'Mañana'
        } else {
            return fecha.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            })
        }
    }

    const days = getDaysInMonth(currentDate)
    const tareasProximas = getTareasProximas()

    // Función para manejar el clic en una tarea/recordatorio
    const handleTareaClick = (tarea: any) => {
        // Buscar la oportunidad asociada en los datos ya cargados
        const oportunidad = oportunidades.find(op => op.codigo === tarea.oportunidad)
        
        if (oportunidad) {
            setSelectedOportunidad(oportunidad)
            setIsDetalleModalOpen(true)
        } else {
            console.warn('No se encontró la oportunidad asociada a la tarea:', tarea.oportunidad)
        }
    }

    // Función para manejar el clic en una tarea del modal de día
    const handleTareaDiaClick = (tarea: any) => {
        // Buscar la oportunidad asociada en los datos ya cargados
        const oportunidad = oportunidades.find(op => op.codigo === tarea.oportunidad)
        
        if (oportunidad) {
            setSelectedOportunidad(oportunidad)
            setIsDetalleModalOpen(true)
            setIsTareasDiaModalOpen(false) // Cerrar el modal de día
        } else {
            console.warn('No se encontró la oportunidad asociada a la tarea:', tarea.oportunidad)
        }
    }

    const handleCloseDetalleModal = () => {
        setIsDetalleModalOpen(false)
        setSelectedOportunidad(null)
    }

    const handleCloseTareasDiaModal = () => {
        setIsTareasDiaModalOpen(false)
        setSelectedDate(null)
    }

    return (
        <>
            <div className="flex flex-col gap-4 p-4 bg-white shadow-sm w-1/3 rounded-md">
                {/* Sección del Calendario */}
                <div className="flex flex-col gap-3">
                    {/* Header del calendario */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Calendario</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-700 min-w-[70px] text-center">
                                {currentDate.toLocaleDateString('es-ES', { 
                                    month: 'short', 
                                    year: 'numeric' 
                                })}
                            </span>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7">
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                            <div key={day} className="p-2 text-center">
                                <span className="text-xs text-gray-500">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7">
                        {days.map((day, index) => {
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                            const isToday = day.toDateString() === new Date().toDateString()
                            const isSelected = selectedDate?.toDateString() === day.toDateString()
                            const dayTareas = getTareasForDate(day)
                            
                            // Solo mostrar indicador si hay tareas pendientes (estado 0 o 1)
                            const hasPendingTasks = dayTareas.some(tarea => tarea.estado === 0 || tarea.estado === 1)
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        aspect-square p-1 cursor-pointer transition-colors
                                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                        ${isToday ? 'bg-gray-200 rounded-md font-bold' : ''}
                                        ${isSelected ? 'bg-blue-500 text-white rounded font-bold' : ''}
                                        ${!isCurrentMonth ? '' : 'hover:bg-gray-50 rounded'}
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span className="text-sm">
                                            {day.getDate()}
                                        </span>
                                        
                                        {/* Indicador de tareas pendientes */}
                                        {hasPendingTasks && (
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1" />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200"/>

                {/* Sección de Recordatorios */}
                <div className="flex flex-col gap-3">
                    {/* Header de recordatorios */}
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-gray-900">Recordatorios</h3>
                    </div>

                    {/* Lista de recordatorios */}
                    <div className="space-y-2">
                        {isLoadingTareas ? (
                            <div className="text-center py-4 text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-xs">Cargando tareas...</p>
                            </div>
                        ) : tareasProximas.length > 0 ? (
                            tareasProximas.map(tarea => (
                                <div 
                                    key={tarea.codigo} 
                                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleTareaClick(tarea)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {tarea.titulo || 'Sin título'}
                                            </h4>
                                                                                         <p className="text-xs text-gray-600">
                                                 {formatDate(tarea.fechaLimite ? new Date(tarea.fechaLimite) : new Date(tarea.fecha))}
                                             </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getEstadoTareaIcon(tarea.estado)}
                                            <div className={`w-2 h-2 rounded-full ${getEstadoTareaColor(tarea.estado)}`} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-xs">No hay tareas programadas</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de tareas del día */}
            <TareasDiaModal
                isOpen={isTareasDiaModalOpen}
                onClose={handleCloseTareasDiaModal}
                tareas={selectedDate ? getTareasForDate(selectedDate) : []}
                fecha={selectedDate || new Date()}
                onTareaClick={handleTareaDiaClick}
            />

            <DetalleProyectoModal
                oportunidad={selectedOportunidad}
                isOpen={isDetalleModalOpen}
                onClose={handleCloseDetalleModal}
                onSuccess={() => {
                    // Los hooks de React Query manejan automáticamente la invalidación
                }}
            />
        </>
    )
}