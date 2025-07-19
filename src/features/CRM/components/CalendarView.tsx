import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Bell, Clock, CheckCircle, AlertCircle, ListTodo, CalendarDays } from "lucide-react"
import { useTareasByOperador, useRecordatorios } from "../hooks/useCRM"
import { useAuth } from "@/services/AuthContext"
import { DetalleProyectoModal } from "./DetalleProyectoModal"
import { OportunidadViewModel } from "../types/oportunidades.type"
import { TareasDiaModal } from "./TareasDiasModal"
import { AgendamientosCRMModel } from "../types/agendamientos.type"

interface CalendarViewProps {
    oportunidades: OportunidadViewModel[]
    agendamientos: AgendamientosCRMModel[]
}

// Modal para mostrar tareas del día seleccionado


export const CalendarView = ({ oportunidades, agendamientos }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedOportunidad, setSelectedOportunidad] = useState<OportunidadViewModel | null>(null)
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false)
    const [isTareasDiaModalOpen, setIsTareasDiaModalOpen] = useState(false)

    // Agregar estado para el tab activo
    const [activeTab, setActiveTab] = useState<'tareas' | 'agendamientos' | 'recordatorios'>('tareas')

    const auth = useAuth()
    const operador = Number(auth.auth?.userId)

    // Obtener tareas del operador
    const { data: tareas = [], isLoading: isLoadingTareas } = useTareasByOperador(operador)
    
    // Obtener recordatorios
    const { data: recordatorios = [] } = useRecordatorios()

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
        setIsTareasDiaModalOpen(true)        
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

    // Obtener agendamientos para una fecha específica
    const getAgendamientosForDate = (date: Date) => {
        return agendamientos.filter(agendamiento => {
            const agendamientoDate = new Date(agendamiento.fechaAgendamiento)
            return agendamientoDate.toDateString() === date.toDateString()
        })
    }

    // Obtener agendamientos próximos (próximos 7 días)
    const getAgendamientosProximos = () => {
        const hoy = new Date()
        const proximaSemana = new Date()
        proximaSemana.setDate(hoy.getDate() + 7)

        return agendamientos
            .filter(agendamiento => {
                const agendamientoDate = new Date(agendamiento.fechaAgendamiento)
                return agendamientoDate >= hoy && agendamientoDate <= proximaSemana
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fechaAgendamiento)
                const fechaB = new Date(b.fechaAgendamiento)
                return fechaA.getTime() - fechaB.getTime()
            })
            .slice(0, 5) // Mostrar solo los próximos 5
    }

    // Obtener recordatorios para una fecha específica
    const getRecordatoriosForDate = (date: Date) => {
        return recordatorios.filter(recordatorio => {
            const recordatorioDate = new Date(recordatorio.fechaLimite)
            return recordatorioDate.toDateString() === date.toDateString()
        })
    }

    // Obtener recordatorios próximos (próximos 7 días)
    const getRecordatoriosProximos = () => {
        const hoy = new Date()
        const proximaSemana = new Date()
        proximaSemana.setDate(hoy.getDate() + 7)

        return recordatorios
            .filter(recordatorio => {
                const recordatorioDate = new Date(recordatorio.fechaLimite)
                return recordatorioDate >= hoy && recordatorioDate <= proximaSemana
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fechaLimite)
                const fechaB = new Date(b.fechaLimite)
                return fechaA.getTime() - fechaB.getTime()
            })
            .slice(0, 5) // Mostrar solo los próximos 5
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

    // Función helper para obtener el icono del estado del agendamiento
    const getEstadoAgendamientoIcon = (estado: number) => {
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

    // Función helper para obtener el color del estado del agendamiento
    const getEstadoAgendamientoColor = (estado: number) => {
        switch (estado) {
            case 0:
                return 'bg-blue-500' // Programado
            case 1:
                return 'bg-orange-500' // En curso
            case 2:
                return 'bg-green-500' // Completado
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

    // Función helper para formatear hora
    const formatTime = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(':')
            return `${hours}:${minutes}`
        } catch {
            return timeString
        }
    }

    // Función helper para obtener el icono del estado del recordatorio
    const getEstadoRecordatorioIcon = (estado: number) => {
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

    // Función helper para obtener el color del estado del recordatorio
    const getEstadoRecordatorioColor = (estado: number) => {
        switch (estado) {
            case 0:
                return 'bg-orange-500' // Pendiente
            case 1:
                return 'bg-blue-500' // En progreso
            case 2:
                return 'bg-green-500' // Completado
            default:
                return 'bg-gray-500'
        }
    }

    const days = getDaysInMonth(currentDate)
    const tareasProximas = getTareasProximas()
    const agendamientosProximos = getAgendamientosProximos()
    const recordatoriosProximos = getRecordatoriosProximos()

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

    // Función para manejar el clic en un agendamiento
    const handleAgendamientoClick = (agendamiento: AgendamientosCRMModel) => {
        // Aquí puedes implementar la lógica para mostrar detalles del agendamiento
        console.log('Agendamiento seleccionado:', agendamiento)
        // Por ahora solo mostramos en consola, pero puedes crear un modal específico
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
                        {['D', 'L', 'M', 'MI', 'J', 'V', 'S'].map(day => (
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
                            const dayAgendamientos = getAgendamientosForDate(day)
                            const dayRecordatorios = getRecordatoriosForDate(day)
                            
                            // Mostrar indicador si hay tareas pendientes, agendamientos o recordatorios
                            const hasPendingTasks = dayTareas.some(tarea => tarea.estado === 0 || tarea.estado === 1)
                            const hasAgendamientos = dayAgendamientos.length > 0
                            const hasRecordatorios = dayRecordatorios.length > 0
                            
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
                                        
                                        {/* Indicadores de tareas y agendamientos */}
                                        <div className="flex gap-1 mt-1">
                                            {hasPendingTasks && (
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                            )}
                                            {hasAgendamientos && (
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            )}
                                            {hasRecordatorios && (
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200"/>

                {/* Sistema de Tabs Compacto */}
                <div className="border-t border-gray-200 pt-3">
                    {/* Tabs */}
                    <div className="flex space-x-1 mb-3">
                        <button
                            onClick={() => setActiveTab('tareas')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                activeTab === 'tareas'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <ListTodo className="w-3 h-3" />
                            Tareas ({tareasProximas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('agendamientos')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                activeTab === 'agendamientos'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <CalendarDays className="w-3 h-3" />
                            Agendas ({agendamientosProximos.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('recordatorios')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                activeTab === 'recordatorios'
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Bell className="w-3 h-3" />
                            Record. ({recordatoriosProximos.length})
                        </button>
                    </div>

                    {/* Contenido de los Tabs */}
                    <div className="overflow-y-auto max-h-[300px]">
                        {/* Tab Tareas */}
                        {activeTab === 'tareas' && (
                            <div className="space-y-2">
                                {isLoadingTareas ? (
                                    <div className="text-center py-4 text-gray-500">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mx-auto mb-2"></div>
                                        <p className="text-xs">Cargando tareas...</p>
                                    </div>
                                ) : tareasProximas.length > 0 ? (
                                    tareasProximas.map(tarea => (
                                        <div 
                                            key={tarea.codigo} 
                                            className="p-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border-l-2 border-red-300"
                                            onClick={() => handleTareaClick(tarea)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-900 truncate">
                                                        {tarea.titulo || 'Sin título'}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {formatDate(tarea.fechaLimite ? new Date(tarea.fechaLimite) : new Date(tarea.fecha))}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    {getEstadoTareaIcon(tarea.estado)}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getEstadoTareaColor(tarea.estado)}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <ListTodo className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                                        <p className="text-xs">No hay tareas próximas</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Agendamientos */}
                        {activeTab === 'agendamientos' && (
                            <div className="space-y-2">
                                {agendamientosProximos.length > 0 ? (
                                    agendamientosProximos.map(agendamiento => (
                                        <div 
                                            key={agendamiento.codigo} 
                                            className="p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-l-2 border-blue-300"
                                            onClick={() => handleAgendamientoClick(agendamiento)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-900 truncate">
                                                        {agendamiento.titulo || 'Sin título'}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-xs text-gray-600">
                                                            {formatDate(new Date(agendamiento.fechaAgendamiento))}
                                                        </p>
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            {formatTime(agendamiento.horaAgendamiento)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    {getEstadoAgendamientoIcon(agendamiento.estado)}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getEstadoAgendamientoColor(agendamiento.estado)}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <CalendarDays className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                                        <p className="text-xs">No hay agendamientos próximos</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Recordatorios */}
                        {activeTab === 'recordatorios' && (
                            <div className="space-y-2">
                                {recordatoriosProximos.length > 0 ? (
                                    recordatoriosProximos.map(recordatorio => (
                                        <div 
                                            key={recordatorio.codigo} 
                                            className="p-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border-l-2 border-orange-300"
                                            onClick={() => handleTareaDiaClick(recordatorio)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-medium text-gray-900 truncate">
                                                        {recordatorio.titulo || 'Sin título'}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-xs text-gray-600">
                                                            {formatDate(new Date(recordatorio.fechaLimite))}
                                                        </p>
                                                        <span className="text-xs text-orange-600 font-medium">
                                                            {formatTime(recordatorio.hora)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    {getEstadoRecordatorioIcon(recordatorio.estado)}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getEstadoRecordatorioColor(recordatorio.estado)}`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <Bell className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                                        <p className="text-xs">No hay recordatorios próximos</p>
                                    </div>
                                )}
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