import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Search } from 'lucide-react';
import { useCrearOportunidad, useContactos } from '../hooks/useCRM';
import { CrearOportunidadCRM } from '../types/oportunidades.type';
import { ContactoCRM } from '../types/contactos.type';

interface ProyectoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  operador: number;
  esAdmin: boolean;
}

export const ProyectoForm: React.FC<ProyectoFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  operador,
  esAdmin
}) => {
  const [formData, setFormData] = useState<Partial<CrearOportunidadCRM>>({
    titulo: '',
    descripcion: '',
    valorNegociacion: 0,
    fechaInicio: new Date(),
    fechaFin: undefined,
    cliente: 0,
    operador: operador, // Usar el operador actual
    estado: 1, // En Planeación por defecto
    general: 0
  });

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [, setContactoSeleccionado] = useState<ContactoCRM | null>(null);
  const [mostrarDropdownContactos, setMostrarDropdownContactos] = useState(false);

  const crearOportunidadMutation = useCrearOportunidad();
  const { data: contactos, isLoading: cargandoContactos } = useContactos(operador, esAdmin);

  // Filtrar contactos basado en la búsqueda
  const contactosFiltrados = contactos?.filter(contacto => 
    contacto.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    contacto.empresa?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    contacto.ruc?.includes(busquedaCliente)
  ) || [];

  const handleInputChange = (field: keyof CrearOportunidadCRM, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusquedaCliente = (valor: string) => {
    setBusquedaCliente(valor);
    setMostrarDropdownContactos(true);
    
    if (!valor.trim()) {
      setContactoSeleccionado(null);
      handleInputChange('cliente', 0);
    }
  };

  const handleSeleccionarContacto = (contacto: ContactoCRM) => {
    setContactoSeleccionado(contacto);
    setBusquedaCliente(contacto.nombre || contacto.empresa || '');
    handleInputChange('cliente', contacto.codigo);
    setMostrarDropdownContactos(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.cliente) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await crearOportunidadMutation.mutateAsync(formData as CrearOportunidadCRM);
      onSuccess?.();
      onClose();
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        valorNegociacion: 0,
        fechaInicio: new Date(),
        fechaFin: undefined,
        cliente: 0,
        operador: operador,
        estado: 1,
        general: 1
      });
      setContactoSeleccionado(null);
      setBusquedaCliente('');
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  const handleClose = () => {
    if (!crearOportunidadMutation.isPending) {
      onClose();
      // Resetear formulario al cerrar
      setFormData({
        titulo: '',
        descripcion: '',
        valorNegociacion: 0,
        fechaInicio: new Date(),
        fechaFin: undefined,
        cliente: 0,
        operador: operador,
        estado: 1,
        general: 1
      });
      setContactoSeleccionado(null);
      setBusquedaCliente('');
    }
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.contacto-dropdown')) {
        setMostrarDropdownContactos(false);
      }
    };

    if (mostrarDropdownContactos) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdownContactos]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Crear Nuevo Proyecto
                </h2>
                <button
                  onClick={handleClose}
                  disabled={crearOportunidadMutation.isPending}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo || ''}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Venta de Software ERP"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el proyecto..."
                  />
                </div>

                {/* Cliente/Contacto con búsqueda */}
                <div className="contacto-dropdown relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente/Contacto *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={busquedaCliente}
                      onChange={(e) => handleBusquedaCliente(e.target.value)}
                      onFocus={() => setMostrarDropdownContactos(true)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Buscar contacto por nombre, empresa o RUC..."
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {cargandoContactos ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown de contactos */}
                  {mostrarDropdownContactos && (busquedaCliente.trim() || contactosFiltrados.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cargandoContactos ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                          Cargando contactos...
                        </div>
                      ) : contactosFiltrados.length > 0 ? (
                        <div>
                          {contactosFiltrados.map((contacto) => (
                            <button
                              key={contacto.codigo}
                              type="button"
                              onClick={() => handleSeleccionarContacto(contacto)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">
                                {contacto.nombre || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {contacto.empresa && `${contacto.empresa} • `}
                                {contacto.ruc && `RUC: ${contacto.ruc} • `}
                                {contacto.eMail && `${contacto.eMail}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : busquedaCliente.trim() ? (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron contactos
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Valor de Negociación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor de Negociación (₲)
                  </label>
                  <input
                    type="number"
                    value={formData.valorNegociacion || ''}
                    onChange={(e) => handleInputChange('valorNegociacion', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio ? new Date(formData.fechaInicio).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('fechaInicio', new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin (Opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin ? new Date(formData.fechaFin).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('fechaFin', e.target.value ? new Date(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Inicial
                  </label>
                  <select
                    value={formData.estado || 1}
                    onChange={(e) => handleInputChange('estado', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>En Planeación</option>
                    <option value={2}>En Negociación</option>
                    <option value={3}>Lograda</option>
                    <option value={4}>Fallada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compartir proyecto
                  </label>
                  <select
                    value={formData.general || 1}
                    onChange={(e) => handleInputChange('general', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Si</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={crearOportunidadMutation.isPending}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={crearOportunidadMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {crearOportunidadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Crear Proyecto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
