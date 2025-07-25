import { useState} from "react";
import { Calendar, Clock, CheckCircle, AlertCircle, X, Plus, CalendarDays, ListTodo, Bell } from "lucide-react";
import { AgendamientoForm } from "./AgendamientoForm";
import { useAgendamientos, useRecordatorios } from "../hooks/useCRM";
import { AgendamientoCRM} from "../types/agendamientos.type";
import { RecordatorioViewModel } from "../types/recordatorios.type";
import { RecordatorioForm } from "./RecordatorioForm";

type TabType = "tareas" | "agendamientos" | "recordatorios";

export const TareasDiaModal = ({ 
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
    const [activeTab, setActiveTab] = useState<TabType>("tareas");
    const [showAgendamientoForm, setShowAgendamientoForm] = useState(false);
    const [selectedAgendamiento, setSelectedAgendamiento] = useState<AgendamientoCRM | null>(null);

    const [showRecordatorioForm, setShowRecordatorioForm] = useState(false);
    const [selectedRecordatorio, setSelectedRecordatorio] = useState<RecordatorioViewModel | null>(null);

    // Obtener todos los agendamientos y filtrar por fecha
    const { data: agendamientos = [] } = useAgendamientos();
    const { data: recordatorios = [] } = useRecordatorios();

    // Filtrar agendamientos por fecha
    const agendamientosDelDia = agendamientos.filter(agendamiento => {
        const agendamientoDate = new Date(agendamiento.fechaAgendamiento);
        return agendamientoDate.toDateString() === fecha.toDateString();
    });

    // Filtrar recordatorios por fecha
    const recordatoriosDelDia = recordatorios.filter(recordatorio => {
        const recordatorioDate = new Date(recordatorio.fechaLimite);
        return recordatorioDate.toDateString() === fecha.toDateString();
    });

    if (!isOpen) return null

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (time: string) => {
        return time.substring(0, 5); // Formato HH:MM
    };

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

    const getEstadoAgendamientoText = (estado: number) => {
        switch (estado) {
            case 0:
                return "Pendiente";
            case 1:
                return "Confirmado";
            case 2:
                return "Cancelado";
            case 3:
                return "Completado";
            default:
                return "Desconocido";
        }
    };

    const getEstadoAgendamientoColor = (estado: number) => {
        switch (estado) {
            case 0:
                return "bg-yellow-100 text-yellow-800";
            case 1:
                return "bg-green-100 text-green-800";
            case 2:
                return "bg-red-100 text-red-800";
            case 3:
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleAgendamientoClick = (agendamiento: AgendamientoCRM) => {
        setSelectedAgendamiento(agendamiento);
        setShowAgendamientoForm(true);
    };

    const handleCreateAgendamiento = () => {
        setSelectedAgendamiento(null);
        setShowAgendamientoForm(true);
    };

    const handleFormClose = () => {
        setShowAgendamientoForm(false);
        setSelectedAgendamiento(null);
        setShowRecordatorioForm(false);
        setSelectedRecordatorio(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        // Opcional: también cerrar el modal principal después de guardar exitosamente
        // onClose();
    };

    const handleRecordatorioClick = (recordatorio: RecordatorioViewModel) => {
        setSelectedRecordatorio(recordatorio);
        setShowRecordatorioForm(true);
    };

    const handleCreateRecordatorio = () => {
        setSelectedRecordatorio(null);
        setShowRecordatorioForm(true);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Actividades del {formatDate(fecha)}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} y {agendamientosDelDia.length} agendamiento{agendamientosDelDia.length !== 1 ? 's' : ''}
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

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("tareas")}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === "tareas"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <ListTodo className="w-4 h-4" />
                            Tareas ({tareas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("agendamientos")}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === "agendamientos"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Agendamientos ({agendamientosDelDia.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("recordatorios")}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === "recordatorios"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Bell className="w-4 h-4" />
                            Recordatorios ({recordatoriosDelDia.length})
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                        {/* Botón de crear solo para agendamientos */}
                        {activeTab === "agendamientos" && (
                            <div className="mb-4">
                                <button
                                    onClick={handleCreateAgendamiento}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Agendamiento
                                </button>
                            </div>
                        )}

                        {/* Botón de crear solo para recordatorios */}
                        {activeTab === "recordatorios" && (
                            <div className="mb-4">
                                <button
                                    onClick={handleCreateRecordatorio}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Recordatorio
                                </button>
                            </div>
                        )}

                        {/* Contenido de Tareas - MANTENIDO INTACTO */}
                        {activeTab === "tareas" && (
                            <div>
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
                        )}

                        {/* Contenido de Agendamientos - NUEVO */}
                        {activeTab === "agendamientos" && (
                            <div className="space-y-4">
                                {agendamientosDelDia.length > 0 ? (
                                    agendamientosDelDia.map((agendamiento) => (
                                        <div
                                            key={agendamiento.codigo}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleAgendamientoClick(agendamiento)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        <h3 className="font-medium text-gray-900">
                                                            {agendamiento.titulo || 'Sin título'}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span>#{agendamiento.codigo}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(agendamiento.horaAgendamiento)}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getEstadoAgendamientoColor(agendamiento.estado)}`}>
                                                            {getEstadoAgendamientoText(agendamiento.estado)}
                                                        </span>
                                                    </div>
                                                   

                                                    {agendamiento.descripcion && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {agendamiento.descripcion}
                                                        </p>
                                                    )}

                                                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                        {agendamiento.doctorNombre && (
                                                            <div>Doctor: {agendamiento.doctorNombre}</div>
                                                        )}
                                                        {agendamiento.pacienteNombre && (
                                                            <div>Paciente: {agendamiento.pacienteNombre}</div>
                                                        )}
                                                        {agendamiento.clienteNombre && (
                                                            <div>Cliente: {agendamiento.clienteNombre}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No hay agendamientos programados
                                        </h3>
                                        <p className="text-gray-500">
                                            No tienes agendamientos para el {formatDate(fecha)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contenido de Recordatorios - NUEVO */}
                        {activeTab === "recordatorios" && (
                            <div className="space-y-4">
                                {recordatoriosDelDia.length > 0 ? (
                                    recordatoriosDelDia.map((recordatorio) => (
                                        <div key={recordatorio.codigo}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleRecordatorioClick(recordatorio)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        <h3 className="font-medium text-gray-900">
                                                            {recordatorio.titulo || 'Sin título'}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span>#{recordatorio.codigo}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(recordatorio.hora)}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getEstadoTareaColor(recordatorio.estado)}`}>
                                                            {getEstadoTareaText(recordatorio.estado)}
                                                        </span>
                                                    </div>

                                                    {recordatorio.descripcion && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {recordatorio.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No hay recordatorios programados
                                        </h3>
                                        <p className="text-gray-500">
                                            No tienes recordatorios para el {formatDate(fecha)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}  
                    </div>
                </div>
            </div>

            {/* Formulario de Agendamiento */}
            {showAgendamientoForm && (
                <AgendamientoForm
                    agendamiento={selectedAgendamiento || undefined}
                    fechaSeleccionada={fecha}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}

            {showRecordatorioForm && (
                <RecordatorioForm
                    recordatorio={selectedRecordatorio || undefined}
                    fechaSeleccionada={fecha}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </>
    )
}