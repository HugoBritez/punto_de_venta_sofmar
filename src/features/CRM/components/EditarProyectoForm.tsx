import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Search } from 'lucide-react';
import { useActualizarOportunidad, useContactos } from '../hooks/useCRM';
import { OportunidadViewModel, ActualizarOportunidadCRM } from '../types/oportunidades.type';
import { ContactoCRM } from '../types/contactos.type';
import { useUsuarios } from '@/shared/hooks/querys/useUsuarios';
import { UsuarioViewModel } from '@/shared/types/operador';

interface EditarProyectoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  oportunidad: OportunidadViewModel;
  operador: number;
  esAdmin: boolean;
}

export const EditarProyectoForm: React.FC<EditarProyectoFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  oportunidad,
  operador,
  esAdmin
}) => {
  const [formData, setFormData] = useState<Partial<ActualizarOportunidadCRM>>({
    codigo: oportunidad.codigo,
    titulo: oportunidad.titulo || '',
    descripcion: oportunidad.descripcion || '',
    valorNegociacion: oportunidad.valorNegociacion,
    fechaInicio: oportunidad.fechaInicio,
    fechaFin: oportunidad.fechaFin,
    cliente: oportunidad.cliente,
    operador: oportunidad.operador,
    estado: oportunidad.estado,
    general: oportunidad.general,
    autorizadoPor: oportunidad.autorizadoPor,
    colaboradores: oportunidad.colaboradores?.map(c => c.colaborador) || [],
    archivado: oportunidad.archivado
  });

  const [busquedaCliente, setBusquedaCliente] = useState(oportunidad.clienteNombre || '');
  const [, setContactoSeleccionado] = useState<ContactoCRM | null>(null);
  const [mostrarDropdownContactos, setMostrarDropdownContactos] = useState(false);
  const [mostrarDropdownColaboradores, setMostrarDropdownColaboradores] = useState(false);
  const [colaboradoresSeleccionados, setColaboradorSeleccionado] = useState<UsuarioViewModel[]>([]);
  const [busquedaColaborador, setBusquedaColaborador] = useState('');

  const actualizarOportunidadMutation = useActualizarOportunidad();
  const { data: contactos, isLoading: cargandoContactos } = useContactos(operador, esAdmin);
  const { data: colaboradores, isLoading: cargandoColaboradores} = useUsuarios(busquedaColaborador);

  // Inicializar colaboradores seleccionados desde la oportunidad
  useEffect(() => {
    if (oportunidad.colaboradores && oportunidad.colaboradores.length > 0) {
      // Convertir los colaboradores de la oportunidad a UsuarioViewModel
      const colaboradoresIniciales = oportunidad.colaboradores.map(col => ({
        op_codigo: col.colaborador,
        op_nombre: col.nombre,
        op_documento: '',
        op_rol: '',
        op_sucursal: '',
        op_autorizar: 0,
        op_ver_utilidad: 0,
        op_ver_proveedor: 0,
        op_aplicar_descuento: 0,
        op_movimiento: 0
      }));
      setColaboradorSeleccionado(colaboradoresIniciales);
    }
  }, [oportunidad.colaboradores]);

  // Filtrar contactos basado en la búsqueda
  const contactosFiltrados = contactos?.filter(contacto => 
    contacto.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    contacto.empresa?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    contacto.ruc?.includes(busquedaCliente)
  ) || [];

  const handleInputChange = (field: keyof ActualizarOportunidadCRM, value: any) => {
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

  const handleSeleccionarColaborador = (colaborador: UsuarioViewModel) => {
    // Verificar que no esté ya seleccionado
    if (colaboradoresSeleccionados.some(c => c.op_codigo === colaborador.op_codigo)) {
      return;
    }
    
    setColaboradorSeleccionado([...colaboradoresSeleccionados, colaborador]);
    setBusquedaColaborador(''); // Limpiar búsqueda
    handleInputChange('colaboradores', [...(formData.colaboradores || []), colaborador.op_codigo]);
    setMostrarDropdownColaboradores(false);
  };

  const handleEliminarColaborador = (codigoColaborador: number) => {
    setColaboradorSeleccionado(colaboradoresSeleccionados.filter(c => c.op_codigo !== codigoColaborador));
    handleInputChange('colaboradores', (formData.colaboradores || []).filter(c => c !== codigoColaborador));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.cliente) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await actualizarOportunidadMutation.mutateAsync(formData as ActualizarOportunidadCRM);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
    }
  };

  const handleClose = () => {
    if (!actualizarOportunidadMutation.isPending) {
      onClose();
    }
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.contacto-dropdown')) {
        setMostrarDropdownContactos(false);
        setMostrarDropdownColaboradores(false);
      }
    };

    if (mostrarDropdownContactos || mostrarDropdownColaboradores) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdownContactos, mostrarDropdownColaboradores]);

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
                  Editar Proyecto
                </h2>
                <button
                  onClick={handleClose}
                  disabled={actualizarOportunidadMutation.isPending}
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
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
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
                <div className='flex items-center justify-center'>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="archivar-proyecto"
                      checked={!!formData.archivado}
                      onChange={(e) => handleInputChange('archivado', e.target.checked ? 1 : 0)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="archivar-proyecto" className="ml-2 block text-md text-gray-700 font-medium">
                      Archivar este proyecto
                    </label>
                  </div>
                </div>
                
                </div>
                {/* Colaboradores */}
                <div className="contacto-dropdown relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colaboradores 
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={busquedaColaborador}
                      onChange={(e) => setBusquedaColaborador(e.target.value)}
                      onFocus={() => setMostrarDropdownColaboradores(true)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Buscar colaborador por nombre..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {cargandoColaboradores ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown de colaboradores - arriba del input */}
                  {mostrarDropdownColaboradores && (busquedaColaborador.trim() || colaboradores?.length || 0 > 0) && (
                    <div className="absolute z-10 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cargandoColaboradores ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                          Cargando colaboradores...
                        </div>
                      ) : colaboradores?.length || 0 > 0 ? (
                        <div>
                          {colaboradores
                            ?.filter(colaborador => 
                              !colaboradoresSeleccionados.some(c => c.op_codigo === colaborador.op_codigo)
                            )
                            .map((colaborador) => (
                            <button
                              key={colaborador.op_codigo}
                              type="button"
                              onClick={() => handleSeleccionarColaborador(colaborador)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">
                                {colaborador.op_nombre || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {colaborador.op_rol}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : busquedaColaborador.trim() ? (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron colaboradores
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Badges de colaboradores seleccionados */}
                  {colaboradoresSeleccionados.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colaboradoresSeleccionados.map((colaborador) => (
                        <div
                          key={colaborador.op_codigo}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{colaborador.op_nombre}</span>
                          <button
                            type="button"
                            onClick={() => handleEliminarColaborador(colaborador.op_codigo)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={actualizarOportunidadMutation.isPending}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actualizarOportunidadMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actualizarOportunidadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Actualizar Proyecto
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