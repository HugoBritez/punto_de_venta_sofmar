import { useState, useEffect } from "react";
import { AgendamientoCRM, CreateAgendamientoCRMDTO } from "../types/agendamientos.type";
import { useCrearAgendamiento, useActualizarAgendamiento } from "../hooks/useCRM";
import { X, Save, Calendar, User, Building, FileText } from "lucide-react";
import { BuscadorPacientes } from "@/shared/components/BuscadorPacientes/BuscadorPacientes";
import { BuscadorDoctores } from "@/shared/components/BuscadorDoctores/BuscadorDoctores";
import { Doctor } from "@/shared/types/doctores";
import { Paciente } from "@/shared/types/paciente";
import { useAuth } from "@/services/AuthContext";
import { useGetDoctorById } from "@/shared/hooks/querys/useDoctores";
import { useGetPacienteById } from "@/shared/hooks/querys/usePacientes";


interface AgendamientoFormProps {
    agendamiento?: AgendamientoCRM;
    fechaSeleccionada?: Date; // Nueva prop para la fecha del padre
    onClose: () => void;
    onSuccess?: () => void;
}

interface ValidationErrors {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaAgendamiento?: string;
    horaAgendamiento?: string;
    doctor?: string;
    paciente?: string;
    cliente?: string;
    operador?: string;
}

export const AgendamientoForm = ({ agendamiento, fechaSeleccionada, onClose, onSuccess }: AgendamientoFormProps) => {
    const isEditing = !!agendamiento;
    const crearAgendamiento = useCrearAgendamiento();
    const actualizarAgendamiento = useActualizarAgendamiento();
    const auth = useAuth();
    const user = Number(auth.auth?.userId);

    const [formData, setFormData] = useState<CreateAgendamientoCRMDTO>({
        fechaInicio: new Date(), // Siempre fecha actual
        fechaAgendamiento: fechaSeleccionada || agendamiento?.fechaAgendamiento || new Date(), // Usar la fecha del padre
        horaAgendamiento: agendamiento?.horaAgendamiento || "",
        titulo: agendamiento?.titulo || "",
        descripcion: agendamiento?.descripcion || "",
        doctor: agendamiento?.doctor || 0,
        paciente: agendamiento?.paciente || 0,
        cliente: agendamiento?.cliente || 0,
        operador: agendamiento?.operador || user,
        estado: agendamiento?.estado || 0,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isBuscadorPacientesOpen, setIsBuscadorPacientesOpen] = useState(false);
    const [isBuscadorDoctoresOpen, setIsBuscadorDoctoresOpen] = useState(false);    

    const [doctorSelected, setDoctorSelected] = useState<Doctor | null>(null);
    const [pacienteSelected, setPacienteSelected] = useState<Paciente | null>(null);

    // Hooks para obtener datos cuando se está editando
    const { data: doctorData } = useGetDoctorById(isEditing && agendamiento?.doctor ? agendamiento.doctor : 0);
    const { data: pacienteData } = useGetPacienteById(isEditing && agendamiento?.paciente ? agendamiento.paciente : 0);

    // Efecto para inicializar los datos del doctor y paciente cuando se está editando
    useEffect(() => {
        if (isEditing) {
            if (doctorData) {
                setDoctorSelected(doctorData);
            }
            if (pacienteData) {
                setPacienteSelected(pacienteData);
            }
        }
    }, [isEditing, doctorData, pacienteData]);

    // Función de validación simplificada
    const validateField = (field: keyof CreateAgendamientoCRMDTO, value: any): string | undefined => {
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
            
            // Fecha de inicio siempre es la actual, no validamos
            case 'fechaInicio':
                break;
            
            // Fecha de agendamiento viene del padre, no validamos
            case 'fechaAgendamiento':
                break;
            
            case 'horaAgendamiento':
                if (!value || value.trim().length === 0) {
                    return 'La hora de agendamiento es obligatoria';
                }
                break;
            
            case 'doctor':
                // Solo validar doctor si no estamos editando
                if (!isEditing && (!value || value === 0)) {
                    return 'Debe seleccionar un doctor';
                }
                break;
            
            case 'paciente':
                // Solo validar paciente si no estamos editando
                if (!isEditing && (!value || value === 0)) {
                    return 'Debe seleccionar un paciente';
                }
                break;
            
            // Cliente es nullable, no validamos
            case 'cliente':
                break;
            
            case 'operador':
                if (!value || value === 0) {
                    return 'Debe seleccionar un operador';
                }
                break;
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CreateAgendamientoCRMDTO, value: any) => {
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
        // newErrors.fechaInicio = validateField('fechaInicio', formData.fechaInicio); // No editable
        // newErrors.fechaAgendamiento = validateField('fechaAgendamiento', formData.fechaAgendamiento); // Viene del padre
        newErrors.horaAgendamiento = validateField('horaAgendamiento', formData.horaAgendamiento);
        
        // Solo validar doctor y paciente si no estamos editando
        if (!isEditing) {
            newErrors.doctor = validateField('doctor', formData.doctor);
            newErrors.paciente = validateField('paciente', formData.paciente);
        }
        
        // newErrors.cliente = validateField('cliente', formData.cliente); // Cliente es nullable
        newErrors.operador = validateField('operador', formData.operador);

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
            if (isEditing && agendamiento) {
                console.log('Actualizando agendamiento existente');
                await actualizarAgendamiento.mutateAsync({
                    codigo: agendamiento.codigo,
                    ...formData
                });
            } else {
                console.log('Creando nuevo agendamiento');
                await crearAgendamiento.mutateAsync(formData);
            }
            
            console.log('Agendamiento guardado exitosamente');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error al guardar agendamiento:", error);
        }
    };

    const isLoading = crearAgendamiento.isPending || actualizarAgendamiento.isPending;

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
                        {isEditing ? "Editar Agendamiento" : "Crear Nuevo Agendamiento"}
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
                            Información del Agendamiento
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
                                    placeholder="Ingrese el título del agendamiento"
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
                                    placeholder="Describa los detalles del agendamiento..."
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Agendamiento
                                </label>
                                <input
                                    type="date"
                                    value={formData.fechaAgendamiento instanceof Date ? formData.fechaAgendamiento.toISOString().split('T')[0] : ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">Fecha seleccionada desde el calendario</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora de Agendamiento *
                                </label>
                                <input
                                    type="time"
                                    value={formData.horaAgendamiento}
                                    onChange={(e) => handleInputChange("horaAgendamiento", e.target.value)}
                                    className={getInputClasses('horaAgendamiento')}
                                />
                                {errors.horaAgendamiento && (
                                    <p className="text-red-500 text-sm mt-1">{errors.horaAgendamiento}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Participantes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Participantes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor {!isEditing && '*'}
                                </label>
                                {isEditing ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                                        {doctorSelected ? 
                                            `${doctorSelected.apellidos} ${doctorSelected.nombres} - ${doctorSelected.matricula}` : 
                                            "Cargando doctor..."
                                        }
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsBuscadorDoctoresOpen(true)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                                    >
                                        {doctorSelected ? 
                                            `${doctorSelected.apellidos} ${doctorSelected.nombres} - ${doctorSelected.matricula}` : 
                                            "Seleccionar doctor..."
                                        }
                                    </button>
                                )}
                                {errors.doctor && (
                                    <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paciente {!isEditing && '*'}
                                </label>
                                {isEditing ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                                        {pacienteSelected ? 
                                            `${pacienteSelected.apellidos} ${pacienteSelected.nombres} - ${pacienteSelected.documento}` : 
                                            "Cargando paciente..."
                                        }
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsBuscadorPacientesOpen(true)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                                    >
                                        {pacienteSelected ? 
                                            `${pacienteSelected.apellidos} ${pacienteSelected.nombres} - ${pacienteSelected.documento}` : 
                                            "Seleccionar paciente..."
                                        }
                                    </button>
                                )}
                                {errors.paciente && (
                                    <p className="text-red-500 text-sm mt-1">{errors.paciente}</p>
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
                                <option value={1}>Confirmado</option>
                                <option value={2}>Cancelado</option>
                                <option value={3}>Completado</option>
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
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
                        </button>
                    </div>
                </form>
            </div>
            {/* Solo mostrar los buscadores si no estamos editando */}
            {!isEditing && (
                <>
                    <BuscadorPacientes
                        onSelect={(paciente) => {
                            console.log('Paciente seleccionado:', paciente);
                            setPacienteSelected(paciente);
                            handleInputChange("paciente", paciente.codigo);
                        }}
                        onClose={() => {
                            console.log('Cerrando buscador pacientes');
                            setIsBuscadorPacientesOpen(false);
                        }}
                        isOpen={isBuscadorPacientesOpen}
                    />
                    <BuscadorDoctores
                        onSelect={(doctor) => {
                            console.log('Doctor seleccionado:', doctor);
                            setDoctorSelected(doctor);
                            handleInputChange("doctor", doctor.codigo);
                        }}
                        onClose={() => {
                            console.log('Cerrando buscador doctores');
                            setIsBuscadorDoctoresOpen(false);
                        }}
                        isOpen={isBuscadorDoctoresOpen}
                    />
                </>
            )}
        </div>
    );
};
