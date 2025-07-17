import Modal from "@/ui/modal/Modal";
import { OportunidadViewModel } from "../types/oportunidades.type";
import { useTareasByOportunidad } from "../hooks/useCRM";
import { 
  UserIcon, 
  CalendarIcon, 
  DollarSignIcon, 
  FileTextIcon,
  CheckCircleIcon,
  TagIcon,
  BuildingIcon,
  PlusIcon,
  EditIcon,
  ListIcon,
  BarChart3Icon
} from "lucide-react";
import { FormTareas } from "./FormTareas";
import { EditarProyectoForm } from "./EditarProyectoForm";
import { useState } from "react";
import { TareaCRM } from "../types/tareas.type";
import { useAuth } from "@/services/AuthContext";

export const DetalleProyectoModal = ({
  oportunidad, 
  isOpen, 
  onClose,
  onSuccess
}: {
  oportunidad: OportunidadViewModel | null, 
  isOpen: boolean, 
  onClose: () => void,
  onSuccess?: () => void
}) => {
  if (!oportunidad) return null;

  const auth = useAuth();
  const operador = Number(auth.auth?.userId);
  const esAdmin = auth.auth?.rol === 7;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const { data: tareas, refetch: refetchTareas } = useTareasByOportunidad(oportunidad.codigo);

  const [isOpenFormTareas, setIsOpenFormTareas] = useState(false);
  const [isOpenEditarProyecto, setIsOpenEditarProyecto] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<TareaCRM | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'lista' | 'grafico'>('lista');

  const handleCrearTarea = () => {
    setTareaToEdit(undefined); // Asegurar que no hay tarea para editar
    setIsOpenFormTareas(true);
  };

  const handleEditarTarea = (tarea: TareaCRM) => {
    setTareaToEdit(tarea);
    setIsOpenFormTareas(true);
  };

  const handleCloseFormTareas = () => {
    setIsOpenFormTareas(false);
    setTareaToEdit(undefined);
  };

  const handleTareaSuccess = () => {
    refetchTareas(); // Recargar las tareas después de crear/editar
  };

  const handleEditarProyecto = () => {
    setIsOpenEditarProyecto(true);
  };

  const handleCloseEditarProyecto = () => {
    setIsOpenEditarProyecto(false);
  };

  const handleProyectoEditado = () => {
    onSuccess?.(); // Notificar al componente padre que se actualizó el proyecto
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

  // Función helper para obtener el color del estado de la tarea
  const getEstadoTareaColor = (estado: number) => {
    switch (estado) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función helper para obtener el texto del estado de la tarea
  const getEstadoTareaText = (estado: number): string => {
    switch (estado) {
      case 0:
        return "Pendiente";
      case 1:
        return "En Progreso";
      case 2:
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${oportunidad.titulo || 'Sin título'}`}
        maxWidth="max-w-7xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Información del Proyecto */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Información del Proyecto</h2>
                <button 
                  className="px-3 py-1 rounded-md flex flex-row gap-2 items-center text-gray-700 border border-gray-300 bg-gray-100 hover:bg-blue-200 transition-colors duration-150 hover:text-blue-800 hover:border-blue-500" 
                  onClick={handleEditarProyecto}
                >
                  <EditIcon className="w-4 h-4" /> 
                  Editar Proyecto
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Código</label>
                    <p className="font-medium text-gray-900">#{oportunidad.codigo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BuildingIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Cliente</label>
                    <p className="font-medium text-gray-900">{oportunidad.clienteNombre}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Operador</label>
                    <p className="font-medium text-gray-900">
                      {oportunidad.general === 1 ? 'General' : oportunidad.operadorNombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex flex-row gap-2 items-center"> 
                    <label className="text-sm text-gray-500">Estado</label>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                      {oportunidad.estadoDescripcion}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                      <DollarSignIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Valor de Negociación</label>
                    <p className="font-medium text-green-600">{formatCurrency(oportunidad.valorNegociacion)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas del Proyecto</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Fecha de Inicio</label>
                    <p className="font-medium text-gray-900">{formatDate(oportunidad.fechaInicio)}</p>
                  </div>
                </div>

                {oportunidad.fechaFin && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm text-gray-500">Fecha de Fin</label>
                      <p className="font-medium text-gray-900">{formatDate(oportunidad.fechaFin)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {oportunidad.descripcion && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-gray-400" />
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">{oportunidad.descripcion}</p>
              </div>
            )}
          </div>

          {/* Tareas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-row gap-2 items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tareas del Proyecto</h2>
              <button 
                className="px-3 py-1 rounded-md flex flex-row gap-2 items-center text-gray-700 border border-gray-300 bg-gray-100 hover:bg-blue-200 transition-colors duration-150 hover:text-blue-800 hover:border-blue-500" 
                onClick={handleCrearTarea}
              >
                <PlusIcon className="w-4 h-4" /> 
                Crear Tarea
              </button>
            </div>

            {/* Pestañas */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('lista')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                    activeTab === 'lista'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                  Lista
                </button>
                <button
                  onClick={() => setActiveTab('grafico')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                    activeTab === 'grafico'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3Icon className="w-4 h-4" />
                  Resumen
                </button>
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="min-h-[300px]">
              {activeTab === 'lista' ? (
                <div className="space-y-3">
                  {tareas && tareas.length > 0 ? (
                    tareas.map((tarea) => (
                      <div 
                        key={tarea.codigo} 
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => handleEditarTarea(tarea)}
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{tarea.titulo}</h4>
                            <EditIcon className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>#{tarea.codigo}</span>
                            <span>{getTipoTareaText(tarea.tipoTarea)}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getEstadoTareaColor(tarea.estado)}`}>
                              {getEstadoTareaText(tarea.estado)}
                            </span>
                          </div>
                          {tarea.descripcion && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {tarea.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                      <CheckCircleIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>No hay tareas asignadas</p>
                      <button 
                        className="px-3 py-1 rounded-md text-sm text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={handleCrearTarea}
                      >
                        Crear primera tarea
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {!tareas || tareas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-lg font-medium">No hay datos para mostrar</p>
                      <p className="text-sm">Crea algunas tareas para ver el resumen</p>
                      <button 
                        className="px-3 py-1 rounded-md text-sm text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={handleCrearTarea}
                      >
                        Crear primera tarea
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Estadísticas generales */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Total Tareas</p>
                              <p className="text-2xl font-bold text-blue-900">{tareas.length}</p>
                            </div>
                            <CheckCircleIcon className="h-8 w-8 text-blue-500" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600">Completadas</p>
                              <p className="text-2xl font-bold text-green-900">{tareas.filter(t => t.estado === 2).length}</p>
                            </div>
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                              <p className="text-2xl font-bold text-yellow-900">{tareas.filter(t => t.estado === 1).length}</p>
                            </div>
                            <CheckCircleIcon className="h-8 w-8 text-yellow-500" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-600">Pendientes</p>
                              <p className="text-2xl font-bold text-orange-900">{tareas.filter(t => t.estado === 0).length}</p>
                            </div>
                            <CheckCircleIcon className="h-8 w-8 text-orange-500" />
                          </div>
                        </div>
                      </div>

                      {/* Progreso general */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Progreso del Proyecto</h3>
                          <span className="text-2xl font-bold text-blue-600">
                            {tareas.length > 0 ? Math.round((tareas.filter(t => t.estado === 2).length / tareas.length) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${tareas.length > 0 ? (tareas.filter(t => t.estado === 2).length / tareas.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>{tareas.filter(t => t.estado === 2).length} completadas</span>
                          <span>{tareas.length - tareas.filter(t => t.estado === 2).length} restantes</span>
                        </div>
                      </div>

                      {/* Gráficos */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de dona - Estados */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
                          <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                />
                                {(() => {
                                  const total = tareas.length;
                                  const completadas = tareas.filter(t => t.estado === 2).length;
                                  const enProgreso = tareas.filter(t => t.estado === 1).length;
                                  const pendientes = tareas.filter(t => t.estado === 0).length;
                                  
                                  return (
                                    <>
                                      {completadas > 0 && (
                                        <path
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          fill="none"
                                          stroke="#10B981"
                                          strokeWidth="3"
                                          strokeDasharray={`${(completadas / total) * 100} ${100 - (completadas / total) * 100}`}
                                        />
                                      )}
                                      {enProgreso > 0 && (
                                        <path
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          fill="none"
                                          stroke="#3B82F6"
                                          strokeWidth="3"
                                          strokeDasharray={`${(enProgreso / total) * 100} ${100 - (enProgreso / total) * 100}`}
                                          strokeDashoffset={`-${(completadas / total) * 100}`}
                                        />
                                      )}
                                      {pendientes > 0 && (
                                        <path
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          fill="none"
                                          stroke="#F59E0B"
                                          strokeWidth="3"
                                          strokeDasharray={`${(pendientes / total) * 100} ${100 - (pendientes / total) * 100}`}
                                          strokeDashoffset={`-${((completadas + enProgreso) / total) * 100}`}
                                        />
                                      )}
                                    </>
                                  );
                                })()}
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-700">
                                  {tareas.length > 0 ? Math.round((tareas.filter(t => t.estado === 2).length / tareas.length) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Completadas</span>
                              </div>
                              <span className="text-sm font-medium">{tareas.filter(t => t.estado === 2).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">En Progreso</span>
                              </div>
                              <span className="text-sm font-medium">{tareas.filter(t => t.estado === 1).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-gray-600">Pendientes</span>
                              </div>
                              <span className="text-sm font-medium">{tareas.filter(t => t.estado === 0).length}</span>
                            </div>
                          </div>
                        </div>

                        {/* Gráfico de barras - Tipos de tarea */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
                          <div className="space-y-3">
                            {(() => {
                              const tareasPorTipo = tareas.reduce((acc, tarea) => {
                                const tipo = getTipoTareaText(tarea.tipoTarea);
                                acc[tipo] = (acc[tipo] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);

                              return Object.entries(tareasPorTipo).map(([tipo, cantidad], index) => {
                                const porcentaje = Math.round((cantidad / tareas.length) * 100);
                                const colores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                                
                                return (
                                  <div key={tipo} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">{tipo}</span>
                                      <span className="text-sm text-gray-500">{cantidad}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                          width: `${porcentaje}%`,
                                          backgroundColor: colores[index % colores.length]
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Formulario de Tareas */}
        {isOpenFormTareas && (
          <FormTareas 
            tarea={tareaToEdit}
            onClose={handleCloseFormTareas}
            onSuccess={handleTareaSuccess}
            oportunidadId={oportunidad.codigo}
          />
        )}
      </Modal>

      {/* Formulario de Edición de Proyecto */}
      {isOpenEditarProyecto && (
        <EditarProyectoForm
          isOpen={isOpenEditarProyecto}
          onClose={handleCloseEditarProyecto}
          onSuccess={handleProyectoEditado}
          oportunidad={oportunidad}
          operador={operador}
          esAdmin={esAdmin}
        />
      )}
    </>
  );
};