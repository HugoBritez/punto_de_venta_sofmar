import { MessageCircle, Phone, Building2, MapPin, FileText, BadgeCheck, Clock, CheckCircle, AlertCircle, Loader2, Edit, X, ArrowLeft } from "lucide-react";
import { ContactoCRM } from "../../types/contactos.type";
import { TareaCRM } from "../../types/tareas.type";
import { useTareasByContacto } from "../../hooks/useCRM";
import { useState } from "react";
import { ContactoForm } from "../CreateContactoForm";

interface MobileContactoCardProps {
    contacto: ContactoCRM;
    onContactoUpdated?: () => void;
    onBack?: () => void;
}

export const MobileContactoCard = ({ contacto, onContactoUpdated, onBack }: MobileContactoCardProps) => {
    const [isEditing, setIsEditing] = useState(false);

    // Función helper para formatear la fecha de manera segura
    const formatDate = (dateString: string | Date) => {
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no disponible';
        }
    };

    // Función helper para obtener el texto del estado de la tarea
    const getEstadoTareaText = (estado: number): string => {
        switch (estado) {
            case 0:
                return "Pendiente";
            case 1:
                return "En proceso";
            case 2:
                return "Completada";
            default:
                return "Desconocido";
        }
    };

    // Función helper para obtener el color del estado de la tarea
    const getEstadoTareaColor = (estado: number): string => {
        switch (estado) {
            case 0:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 1:
                return "bg-red-100 text-red-800 border-red-200";
            case 2:
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Función helper para obtener el icono del estado de la tarea
    const getEstadoTareaIcon = (estado: number) => {
        switch (estado) {
            case 0:
                return <Clock className="w-4 h-4" />;
            case 1:
                return <Loader2 className="w-4 h-4" />;
            case 2:
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Función helper para obtener el texto del tipo de tarea
    const getTipoTareaText = (tipoTarea: number): string => {
        switch (tipoTarea) {
            case 1:
                return "Llamada";
            case 2:
                return "Reunión";
            case 3:
                return "Email";
            case 4:
                return "Seguimiento";
            case 5:
                return "Propuesta";
            default:
                return "Otro";
        }
    };

    const handleEditarContacto = () => {
        setIsEditing(true);
    }

    const handleCloseEdit = () => {
        setIsEditing(false);
    }

    const handleEditSuccess = () => {
        setIsEditing(false);    
        onContactoUpdated?.();
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Solo cerrar si se hace clic en el backdrop, no en el contenido del modal
        if (e.target === e.currentTarget) {
            handleCloseEdit();
        }
    }

    const handleModalContentClick = (e: React.MouseEvent) => {
        // Prevenir que el clic en el contenido del modal cierre el modal
        e.stopPropagation();
    }

    const { data: tareas = [], isLoading: isLoadingTareas, isError: isErrorTareas, error } = useTareasByContacto(contacto.codigo);

    return (
        <>
                <div className="min-h-screen bg-gray-50 z-[9999] relative">
                {/* Header móvil fijo */}
                <div className="sticky top-0 z-[10000] bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={onBack}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Volver"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <h1 className="text-lg font-semibold text-gray-800 truncate flex-1 text-center mx-2">
                            {contacto.nombre}
                        </h1>
                        
                        <button
                            onClick={handleEditarContacto}
                            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                            title="Editar contacto"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="px-4 py-6 space-y-6">
                    {/* Información básica del contacto */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-center space-y-3">
                            <span className="text-sm text-gray-500 block">
                                {contacto.general === 1 ? "Contacto General" : `Contacto de: ${contacto.operadorNombre}`}
                            </span>
                            
                            <a 
                                href={`mailto:${contacto.eMail}`} 
                                className="text-blue-500 text-sm block break-all"
                            >
                                {contacto.eMail}
                            </a>
                            
                            {/* Botones de acción táctiles */}
                            <div className="flex gap-3 justify-center pt-2">
                                <a 
                                    href={`tel:${contacto.telefono}`} 
                                    className="flex-1 flex flex-col items-center gap-2 bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-red-500" />
                                    <span className="text-sm font-medium text-red-600">Llamar</span>
                                </a>
                                
                                <a 
                                    href={`https://wa.me/${contacto.telefono}`} 
                                    className="flex-1 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 rounded-lg p-3 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-green-600">WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Datos del Contacto */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Datos del Contacto</h2>
                        
                        <div className="space-y-3">
                            {/* Información empresarial */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold text-gray-700">Información Empresarial</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">RUC</span>
                                        <span className="font-medium">{contacto.ruc}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Empresa</span>
                                        <span className="font-medium">{contacto.empresa}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Cargo</span>
                                        <span className="font-medium">{contacto.cargo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Estado del cliente */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <BadgeCheck className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold text-gray-700">Estado</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Es Cliente</span>
                                        <span className={`font-medium ${contacto.esCliente ? 'text-green-600' : 'text-orange-600'}`}>
                                            {contacto.esCliente ? "Sí" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Fecha de Contacto</span>
                                        <span className="font-medium">{formatDate(contacto.fechaContacto)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold text-gray-700">Ubicación</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Departamento</span>
                                        <span className="font-medium">{contacto.departamentoDescripcion}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Ciudad</span>
                                        <span className="font-medium">{contacto.ciudadDescripcion}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Zona</span>
                                        <span className="font-medium">{contacto.zonaDescripcion}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs">Dirección</span>
                                        <span className="font-medium">{contacto.direccion}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            {contacto.notas && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold text-gray-700">Notas</span>
                                    </div>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                                        {contacto.notas}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Últimas Interacciones */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Últimas Interacciones</h2>
                        
                        {isLoadingTareas && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                <span className="ml-3 text-sm text-gray-600">Cargando tareas...</span>
                            </div>
                        )}

                        {isErrorTareas && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <span className="text-sm font-medium text-red-700">Error al cargar tareas</span>
                                </div>
                                <p className="text-xs text-red-600 mt-2">
                                    {error?.message || 'No se pudieron cargar las tareas del contacto'}
                                </p>
                            </div>
                        )}

                        {!isLoadingTareas && !isErrorTareas && tareas.length === 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Sin interacciones</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    No hay tareas registradas para este contacto
                                </p>
                            </div>
                        )}

                        {!isLoadingTareas && !isErrorTareas && tareas.length > 0 && (
                            <div className="space-y-3">
                                {tareas.slice(0, 5).map((tarea: TareaCRM) => (
                                    <div key={tarea.codigo} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getEstadoTareaIcon(tarea.estado)}
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoTareaColor(tarea.estado)}`}>
                                                    {getEstadoTareaText(tarea.estado)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(tarea.fecha)}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {tarea.titulo && (
                                                <h4 className="font-medium text-sm text-gray-800">
                                                    {tarea.titulo}
                                                </h4>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Tipo:</span>
                                                <span className="text-xs font-medium text-blue-600">
                                                    {getTipoTareaText(tarea.tipoTarea)}
                                                </span>
                                            </div>
                                            
                                            {tarea.descripcion && (
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {tarea.descripcion}
                                                </p>
                                            )}
                                            
                                            {tarea.resultado && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <span className="text-xs font-medium text-green-700">Resultado:</span>
                                                    <p className="text-xs text-green-600 mt-1 leading-relaxed">
                                                        {tarea.resultado}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {tareas.length > 5 && (
                                    <div className="text-center py-4">
                                        <span className="text-xs text-gray-500">
                                            Mostrando 5 de {tareas.length} tareas
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de edición adaptado para móvil */}
            {isEditing && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                    onClick={handleBackdropClick}
                >
                    <div 
                        className="bg-white rounded-lg shadow-2xl w-full max-h-[95vh] overflow-y-auto relative"
                        onClick={handleModalContentClick}
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Editar Contacto
                                </h2>
                                <button
                                    onClick={handleCloseEdit}
                                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <ContactoForm
                                contacto={contacto}
                                onClose={handleCloseEdit}
                                onSuccess={handleEditSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
