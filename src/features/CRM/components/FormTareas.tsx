import { useState } from "react";
import { TareaCRM, CrearTareaCRM } from "../types/tareas.type";
import { useCrearTarea, useActualizarTarea, useTiposTareas } from "../hooks/useCRM";
import { X, Save, Calendar, FileText, CheckCircle } from "lucide-react";

interface TareaFormProps {
    tarea?: TareaCRM;
    onClose: () => void;
    onSuccess?: () => void;
    oportunidadId?: number;
}

interface ValidationErrors {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    fechaLimite?: string;
    tipoTarea?: string;
}

export const FormTareas = ({ tarea, onClose, onSuccess, oportunidadId }: TareaFormProps) => {
    const isEditing = !!tarea;
    const crearTarea = useCrearTarea();
    const actualizarTarea = useActualizarTarea();

    const { data: tiposTareas } = useTiposTareas();

    const [formData, setFormData] = useState<CrearTareaCRM>({
        titulo: tarea?.titulo || "",
        descripcion: tarea?.descripcion || "",
        resultado: tarea?.resultado || "",
        fecha: tarea?.fecha || new Date(),
        oportunidad: tarea?.oportunidad || oportunidadId || 0,
        tipoTarea: tarea?.tipoTarea || 1,
        fechaLimite: tarea?.fechaLimite || undefined,
        estado: tarea?.estado || 0,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});

    // Función de validación
    const validateField = (field: keyof CrearTareaCRM, value: any): string | undefined => {
        switch (field) {
            case 'titulo':
                if (!value || value.trim().length === 0) {
                    return 'El título es obligatorio';
                }
                if (value.trim().length < 3) {
                    return 'El título debe tener al menos 3 caracteres';
                }
                break;
            
            case 'descripcion':
                if (!value || value.trim().length === 0) {
                    return 'La descripción es obligatoria';
                }
                if (value.trim().length < 10) {
                    return 'La descripción debe tener al menos 10 caracteres';
                }
                break;
            
            case 'fecha':
                if (!value) {
                    return 'La fecha es obligatoria';
                }
                break;
            
            case 'fechaLimite':
                if (value && new Date(value) < new Date()) {
                    return 'La fecha límite no puede ser anterior a hoy';
                }
                break;
            
            case 'tipoTarea':
                if (!value || value === 0) {
                    return 'Debe seleccionar un tipo de tarea';
                }
                break;
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CrearTareaCRM, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validar el campo en tiempo real
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        // Validar todos los campos obligatorios
        newErrors.titulo = validateField('titulo', formData.titulo);
        newErrors.descripcion = validateField('descripcion', formData.descripcion);
        newErrors.fecha = validateField('fecha', formData.fecha);
        newErrors.tipoTarea = validateField('tipoTarea', formData.tipoTarea);

        setErrors(newErrors);
        
        // Retornar true si no hay errores
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return; // No continuar si hay errores de validación
        }
        
        try {
            if (isEditing && tarea) {
                await actualizarTarea.mutateAsync({
                    codigo: tarea.codigo,
                    ...formData
                });
            } else {
                await crearTarea.mutateAsync(formData);
            }
            
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error al guardar tarea:", error);
        }
    };

    const isLoading = crearTarea.isPending || actualizarTarea.isPending;

    // Función helper para obtener clases CSS de los inputs
    const getInputClasses = (field: keyof ValidationErrors) => {
        const baseClasses = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        return errors[field] 
            ? `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500` 
            : `${baseClasses} border-gray-300`;
    };
    return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? "Editar Tarea" : "Crear Nueva Tarea"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Información de la Tarea
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                                    className={getInputClasses('titulo')}
                                    placeholder="Ingrese el título de la tarea"
                                />
                                {errors.titulo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                                    className={getInputClasses('descripcion')}
                                    rows={4}
                                    placeholder="Describa los detalles de la tarea..."
                                />
                                {errors.descripcion && (
                                    <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fechas y Estado */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Fechas y Estado
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Creación *
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha instanceof Date ? formData.fecha.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleInputChange("fecha", new Date(e.target.value))}
                                    className={getInputClasses('fecha')}
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Límite
                                </label>
                                <input
                                    type="date"
                                    value={formData.fechaLimite instanceof Date ? formData.fechaLimite.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleInputChange("fechaLimite", e.target.value ? new Date(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.fechaLimite && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fechaLimite}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Tarea *
                                </label>
                                <select
                                    value={formData.tipoTarea}
                                    onChange={(e) => handleInputChange("tipoTarea", parseInt(e.target.value))}
                                    className={getInputClasses('tipoTarea')}
                                >
                                    {tiposTareas?.map((tipo) => (
                                        <option key={tipo.codigo} value={tipo.codigo}>{tipo.descripcion}</option>
                                    ))}
                                </select>
                                {errors.tipoTarea && (
                                    <p className="text-red-500 text-sm mt-1">{errors.tipoTarea}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange("estado", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>Pendiente</option>
                                    <option value={1}>En Progreso</option>
                                    <option value={2}>Completada</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Resultado */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            Resultado
                        </h3>
                        
                        <div>
                            <textarea
                                value={formData.resultado}
                                onChange={(e) => handleInputChange("resultado", e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describa el resultado de la tarea..."
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};