import { useState, useEffect } from "react";
import { RecordatorioViewModel, CreateRecordatorioCRMDTO } from "../types/recordatorios.type";
import { useCrearRecordatorio, useActualizarRecordatorio } from "../hooks/useCRM";
import { X, Save, Calendar, User, Building, FileText } from "lucide-react";
import { ClienteViewModel } from "@/shared/types/clientes";
import { useAuth } from "@/services/AuthContext";
import BuscadorClientes from "@/ui/clientes/BuscadorClientes";

interface RecordatorioFormProps {
    recordatorio?: RecordatorioViewModel;
    fechaSeleccionada?: Date; // Nueva prop para la fecha del padre
    onClose: () => void;
    onSuccess?: () => void;
}

interface ValidationErrors {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    fechaLimite?: string;
    hora?: string;
    operador?: string;
    cliente?: string;
    tipoRecordatorio?: string;
}

export const RecordatorioForm = ({ recordatorio, fechaSeleccionada, onClose, onSuccess }: RecordatorioFormProps) => {
    const isEditing = !!recordatorio;
    const crearRecordatorio = useCrearRecordatorio();
    const actualizarRecordatorio = useActualizarRecordatorio();
    const auth = useAuth();
    const user = Number(auth.auth?.userId);

    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });

    const [formData, setFormData] = useState<CreateRecordatorioCRMDTO>({
        titulo: recordatorio?.titulo || "",
        descripcion: recordatorio?.descripcion || "",
        fecha:  fechaActual,
        fechaLimite: fechaSeleccionada ? fechaSeleccionada.toISOString().split('T')[0] : recordatorio?.fechaLimite,
        hora: recordatorio?.hora || horaActual,
        operador: recordatorio?.operador || user,
        cliente: recordatorio?.cliente || 0,
        estado: recordatorio?.estado || 0,
        tipoRecordatorio: recordatorio?.tipoRecordatorio || 1,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isBuscadorClientesOpen, setIsBuscadorClientesOpen] = useState(false);
    const [clienteSelected, setClienteSelected] = useState<ClienteViewModel | null>(null);

    // Efecto para inicializar los datos del cliente cuando se está editando
    useEffect(() => {
        if (isEditing && recordatorio) {
            // En un caso real, aquí harías una llamada a la API para obtener los datos del cliente
            // Por ahora, creamos un objeto básico con los datos disponibles
            if (recordatorio.cliente) {
                setClienteSelected({
                    cli_codigo: recordatorio.cliente,
                    cli_razon: recordatorio.clienteNombre || "Cliente",
                    cli_interno: "0",
                    cli_dir: "",
                    cli_tel: "",
                    cli_mail: "",
                    cli_estado: 1,
                    vendedor_cliente: 0,
                    cli_descripcion: "",
                    cli_ruc: "",
                    cli_ciudad: 0,
                    cli_ciudad_interno: 0,
                    zona: "",
                    cli_ciudad_descripcion: "",
                    cli_departamento: 0,
                    dep_descripcion: "",
                    cli_distrito: 0,
                    cli_distrito_descripcion: "",
                    cli_limitecredito: 0,
                    deuda_actual: "",
                    credito_disponible: "",
                    cli_ci: "",
                    cli_tipo_doc: 0,
                });
            }
        }
    }, [isEditing, recordatorio]);

    // Función de validación
    const validateField = (field: keyof CreateRecordatorioCRMDTO, value: any): string | undefined => {
        switch (field) {
            case 'titulo':
                if (!value || value.trim().length === 0) {
                    return 'El título es obligatorio';
                }
                break;
            
            case 'descripcion':
                if (!value || value.trim().length === 0) {
                    return 'La descripción es obligatoria';
                }
                break;
            
            case 'fecha':
                if (!value || value.trim().length === 0) {
                    return 'La fecha es obligatoria';
                }
                break;
            
            case 'fechaLimite':
                if (!value || value.trim().length === 0) {
                    return 'La fecha límite es obligatoria';
                }
                break;
            
            case 'hora':
                if (!value || value.trim().length === 0) {
                    return 'La hora es obligatoria';
                }
                break;
            
            case 'cliente':
                // El cliente es opcional, no validar
                break;
            
            case 'tipoRecordatorio':
                break;
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CreateRecordatorioCRMDTO, value: any) => {
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
        
        // Validar solo los campos editables
        newErrors.titulo = validateField('titulo', formData.titulo);
        newErrors.descripcion = validateField('descripcion', formData.descripcion);
        newErrors.fecha = validateField('fecha', formData.fecha);
        newErrors.fechaLimite = validateField('fechaLimite', formData.fechaLimite);
        newErrors.hora = validateField('hora', formData.hora);
        
        // Cliente es opcional, no validar
        // newErrors.cliente = validateField('cliente', formData.cliente);
        

        setErrors(newErrors);
        
        // Retornar true si no hay errores
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit iniciado');
        console.log('formData:', formData);
        
        const isValid = validateForm();
        console.log('validateForm resultado:', isValid);
        console.log('errores después de validar:', errors);
        
        if (!isValid) {
            console.log('Formulario no válido, deteniendo envío');
            return; // No continuar si hay errores de validación
        }
        
        console.log('Formulario válido, procediendo con envío');
        
        try {
            if (isEditing && recordatorio) {
                console.log('Actualizando recordatorio existente');
                await actualizarRecordatorio.mutateAsync({
                    codigo: recordatorio.codigo,
                    ...formData
                });
            } else {
                console.log('Creando nuevo recordatorio');
                await crearRecordatorio.mutateAsync(formData);
            }
            
            console.log('Recordatorio guardado exitosamente');
            console.log('Ejecutando onSuccess...');
            onSuccess?.();
            console.log('Ejecutando onClose...');
            onClose();
            console.log('Modal cerrado');
        } catch (error) {
            console.error("Error al guardar recordatorio:", error);
        }
    };

    const isLoading = crearRecordatorio.isPending || actualizarRecordatorio.isPending;

    // Función helper para obtener clases CSS de los inputs
    const getInputClasses = (field: keyof ValidationErrors) => {
        const baseClasses = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        return errors[field] 
            ? `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500` 
            : `${baseClasses} border-gray-300`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? "Editar Recordatorio" : "Crear Nuevo Recordatorio"}
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
                            Información del Recordatorio
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
                                    placeholder="Ingrese el título del recordatorio"
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
                                    placeholder="Describa los detalles del recordatorio..."
                                />
                                {errors.descripcion && (
                                    <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fechas y Horarios */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Fechas y Horarios
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Límite *
                                </label>
                                <input
                                    type="date"
                                    value={formData.fechaLimite}
                                    onChange={(e) => handleInputChange("fechaLimite", e.target.value)}
                                    className={getInputClasses('fechaLimite')}
                                />
                                {errors.fechaLimite && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fechaLimite}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora *
                                </label>
                                <input
                                    type="time"
                                    value={formData.hora}
                                    onChange={(e) => handleInputChange("hora", e.target.value)}
                                    className={getInputClasses('hora')}
                                />
                                {errors.hora && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hora}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cliente y Tipo */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Cliente y Tipo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cliente
                                </label>
                                {isEditing ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                                        {clienteSelected ? 
                                            `${clienteSelected.cli_razon}` : 
                                            "Sin cliente asignado"
                                        }
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsBuscadorClientesOpen(true)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                                    >
                                        {clienteSelected ? 
                                            `${clienteSelected.cli_razon}` : 
                                            "Seleccionar cliente (opcional)..."
                                        }
                                    </button>
                                )}
                                {errors.cliente && (
                                    <p className="text-red-500 text-sm mt-1">{errors.cliente}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Recordatorio (opcional)
                                </label>
                                <select
                                    value={formData.tipoRecordatorio}
                                    onChange={(e) => handleInputChange("tipoRecordatorio", parseInt(e.target.value))}
                                    className={getInputClasses('tipoRecordatorio')}
                                >
                                    <option value={0}>Seleccionar tipo...</option>
                                    <option value={1}>Llamada</option>
                                    <option value={2}>Email</option>
                                    <option value={3}>Reunión</option>
                                    <option value={4}>Seguimiento</option>
                                    <option value={5}>Otro</option>
                                </select>
                                {errors.tipoRecordatorio && (
                                    <p className="text-red-500 text-sm mt-1">{errors.tipoRecordatorio}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-500" />
                            Estado
                        </h3>
                        <div>
                            <select
                                value={formData.estado}
                                onChange={(e) => handleInputChange("estado", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={0}>Pendiente</option>
                                <option value={1}>En Progreso</option>
                                <option value={2}>Completado</option>
                                <option value={3}>Cancelado</option>
                            </select>
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
            {/* Solo mostrar el buscador si no estamos editando */}
            {!isEditing && (
                <BuscadorClientes
                    onSelect={(cliente) => {
                        console.log('Cliente seleccionado:', cliente);
                        setClienteSelected(cliente);
                        handleInputChange("cliente", cliente.cli_codigo);
                    }}
                    isOpen={isBuscadorClientesOpen}
                    setIsOpen={setIsBuscadorClientesOpen}
                />
            )}
        </div>
    );
};