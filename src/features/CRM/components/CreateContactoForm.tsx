import { useState } from "react";
import { CrearContactoCRM,  ContactoCRMModel } from "../types/contactos.type";
import { useCrearContacto, useActualizarContacto } from "../hooks/useCRM";
import { X, Save, User, Building2, MapPin, FileText, Calendar } from "lucide-react";
import { useGetCiudades } from "@/shared/hooks/querys/useCiudades";
import { useZonas } from "@/shared/hooks/querys/useZonas";
import { useGetDepartamento } from "@/shared/hooks/querys/useDepartamentos";
import { Autocomplete } from "@/shared/components/Autocomplete/AutocompleteComponent";
import { Ciudad } from "@/shared/types/ciudad";
import BuscadorClientes from "@/ui/clientes/BuscadorClientes";
import { ClienteViewModel } from "@/shared/types/clientes";
import { useAuth } from "@/services/AuthContext";

interface ContactoFormProps {
    contacto?: ContactoCRMModel;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ValidationErrors {
    nombre?: string;
    eMail?: string;
    telefono?: string;
    ruc?: string;
    departamento?: string;
    ciudad?: string;
}

export const ContactoForm = ({ contacto, onClose, onSuccess }: ContactoFormProps) => {
    const isEditing = !!contacto;
    const crearContacto = useCrearContacto();
    const actualizarContacto = useActualizarContacto();

    const auth = useAuth();

    const operador = Number(auth.auth?.userId);
    
    const [formData, setFormData] = useState<CrearContactoCRM>({
        nombre: contacto?.nombre || "",
        eMail: contacto?.eMail || "",
        telefono: contacto?.telefono || "",
        ruc: contacto?.ruc || "",
        empresa: contacto?.empresa || "",
        cargo: contacto?.cargo || "",
        direccion: contacto?.direccion || "",
        notas: contacto?.notas || "",
        fechaContacto: contacto?.fechaContacto || new Date(),
        esCliente: contacto?.esCliente || 0,
        departamento: contacto?.departamento || 1,
        ciudad: contacto?.ciudad || 1,
        zona: contacto?.zona || 1,
        estado:  1,
        general: contacto?.general || 1,
        operador: contacto?.operador || operador,
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isOpen, setIsOpen] = useState(false);

    const { data: ciudades = [], isLoading: isLoadingCiudades, isError: isErrorCiudades } = useGetCiudades();
    const { data: zonas = []} = useZonas();
    const { data: departamentos = []} = useGetDepartamento();

    // Función de validación
    const validateField = (field: keyof CrearContactoCRM, value: any): string | undefined => {
        switch (field) {
            case 'nombre':
                if (!value || value.trim().length === 0) {
                    return 'El nombre es obligatorio';
                }
                if (value.trim().length < 2) {
                    return 'El nombre debe tener al menos 2 caracteres';
                }
                break;
            
            case 'eMail':
                if (value && value.trim().length > 0) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'El formato del email no es válido';
                    }
                }
                break;
            
            case 'telefono':
                if (value && value.trim().length > 0) {
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(value)) {
                        return 'El formato del teléfono no es válido';
                    }
                    if (value.replace(/\D/g, '').length < 7) {
                        return 'El teléfono debe tener al menos 7 dígitos';
                    }
                }
                break;
            
            case 'ruc':
                if (value && value.trim().length > 0) {
                    const rucRegex = /^\d{5,15}$/;
                    if (!rucRegex.test(value.replace(/\D/g, ''))) {
                        return 'El RUC debe tener entre 5 y 15 dígitos';
                    }
                }
                break;
            
            case 'departamento':
                if (!value || value === 0) {
                    return 'Debe seleccionar un departamento';
                }
                break;
            
            case 'ciudad':
                if (!value || value === 0) {
                    return 'Debe seleccionar una ciudad';
                }
                break;
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CrearContactoCRM, value: any) => {
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

    const handleSelectCliente = (cliente: ClienteViewModel) => {
        const newFormData = {
            ...formData,
            nombre: cliente.cli_razon,
            eMail: cliente.cli_mail,
            telefono: cliente.cli_tel,
            ruc: cliente.cli_ruc,
            direccion: cliente.cli_dir,
            fechaContacto: new Date(),
            esCliente: 1,
            departamento: cliente.cli_departamento,
            ciudad: cliente.cli_ciudad,
        };

        setFormData(newFormData);

        // Limpiar errores de los campos que se actualizaron
        setErrors(prev => ({
            ...prev,
            nombre: undefined,
            eMail: undefined,
            telefono: undefined,
            ruc: undefined,
            departamento: undefined,
            ciudad: undefined,
        }));
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        // Validar todos los campos obligatorios
        newErrors.nombre = validateField('nombre', formData.nombre);
        newErrors.eMail = validateField('eMail', formData.eMail);
        newErrors.telefono = validateField('telefono', formData.telefono);
        newErrors.ruc = validateField('ruc', formData.ruc);
        newErrors.departamento = validateField('departamento', formData.departamento);
        newErrors.ciudad = validateField('ciudad', formData.ciudad);

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
            if (isEditing && contacto) {
                await actualizarContacto.mutateAsync({
                    codigo: contacto.codigo,
                    ...formData
                });
            } else {
                await crearContacto.mutateAsync(formData);
            }
            
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error al guardar contacto:", error);
        }
    };

    const isLoading = crearContacto.isPending || actualizarContacto.isPending;

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
                        {isEditing ? "Editar Contacto" : "Crear Nuevo Contacto"}
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
                    {/* Información Personal */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Información Personal
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                                    className={getInputClasses('nombre')}
                                />
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.eMail}
                                    onChange={(e) => handleInputChange("eMail", e.target.value)}
                                    className={getInputClasses('eMail')}
                                />
                                {errors.eMail && (
                                    <p className="text-red-500 text-sm mt-1">{errors.eMail}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                                    className={getInputClasses('telefono')}
                                />
                                {errors.telefono && (
                                    <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUC
                                </label>
                                <input
                                    type="text"
                                    value={formData.ruc}
                                    onChange={(e) => handleInputChange("ruc", e.target.value)}
                                    className={getInputClasses('ruc')}
                                />
                                {errors.ruc && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ruc}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información Empresarial */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            Información Empresarial
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Empresa
                                </label>
                                <input
                                    type="text"
                                    value={formData.empresa}
                                    onChange={(e) => handleInputChange("empresa", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    value={formData.cargo}
                                    onChange={(e) => handleInputChange("cargo", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            Ubicación
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Departamento *
                                </label>
                                <select
                                    value={formData.departamento}
                                    onChange={(e) => handleInputChange("departamento", parseInt(e.target.value))}
                                    className={getInputClasses('departamento')}
                                >
                                    <option value={0}>Seleccionar departamento</option>
                                    {
                                        departamentos.map((departamento) => (
                                            <option key={departamento.id} value={departamento.id}>
                                                {departamento.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                                {errors.departamento && (
                                    <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>
                                )}
                            </div>
                            <div>
                                <Autocomplete<Ciudad>
                                    data={ciudades || []}
                                    value={ciudades?.find(ciudad => ciudad.id === formData.ciudad) || null}
                                    onChange={(ciudad) => {
                                        handleInputChange("ciudad", ciudad?.id ?? 0)
                                    }}
                                    displayField="descripcion"
                                    searchFields={["descripcion", "id"]}
                                    additionalFields={[
                                        { field: "id", label: "Codigo" },
                                        { field: "descripcion", label: "Ciudad" }
                                    ]}
                                    label="Ciudad *"
                                    isLoading={isLoadingCiudades}
                                    isError={isErrorCiudades}
                                    errorMessage="Error al cargar las ciudades"
                                    disabled={isLoadingCiudades}
                                    key={`ciudad-${formData.ciudad}`}
                                />
                                {errors.ciudad && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zona
                                </label>
                                <select
                                    value={formData.zona}
                                    onChange={(e) => handleInputChange("zona", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {
                                        zonas.map((zona) => (
                                            <option key={zona.codigo} value={zona.codigo}>
                                                {zona.descripcion}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado y Fecha */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Estado y Fecha
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Es Cliente
                                </label>
                                <select
                                    value={formData.esCliente}
                                    onChange={(e) => {
                                        const valor = parseInt(e.target.value);
                                        if (valor === 1) {
                                            setIsOpen(true);
                                        } else {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>No</option>
                                    <option value={1}>Sí</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Contacto
                                </label>
                                <input
                                    type="date"
                                    value={formData.fechaContacto instanceof Date ? formData.fechaContacto.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleInputChange("fechaContacto", new Date(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Compartir contacto
                                </label>
                                <select
                                    value={formData.general}
                                    onChange={(e) => {
                                        const valor = parseInt(e.target.value);
                                        handleInputChange("general", valor);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>No</option>
                                    <option value={1}>Sí</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Notas
                        </h3>
                        
                        <div>
                            <textarea
                                value={formData.notas}
                                onChange={(e) => handleInputChange("notas", e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Agregar notas sobre el contacto..."
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
            <BuscadorClientes isOpen={isOpen} setIsOpen={setIsOpen} onSelect={handleSelectCliente} />
        </div>
    );
};