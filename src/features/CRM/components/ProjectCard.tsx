import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock,
  MoreVertical,
  Eye,
  Loader2
} from 'lucide-react';
import { OportunidadViewModel } from '../types/oportunidades.type';

interface ProjectCardProps {
  oportunidad: OportunidadViewModel;
  isDragging?: boolean;
  isLoading?: boolean;
  onOportunidadSeleccionada?: (oportunidad: OportunidadViewModel) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  oportunidad, 
  isDragging = false,
  isLoading = false,
  onOportunidadSeleccionada
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      className={`
        bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg 
        transition-all duration-200 p-4
        ${isDragging ? 'shadow-xl rotate-1 scale-105 z-50 border-blue-300 cursor-grabbing' : 'cursor-grab'}
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs text-gray-600 font-medium">Actualizando...</span>
          </div>
        </div>
      )}

      {/* Header con título y acciones */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1 mr-2">
          {oportunidad.titulo || 'Sin título'}
        </h4>
        <div className="flex items-center gap-1">
          <button 
            className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            disabled={isLoading}
            onClick={() => onOportunidadSeleccionada?.(oportunidad)}
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Descripción */}
      
      
      
      {/* Información adicional */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
      <div className="flex items-center gap-1.5">
          <div className="p-1 bg-blue-100 rounded-md">
            <User className="w-3 h-3 text-blue-700" />
          </div>
          <span className="font-semibold">Cliente: {oportunidad.clienteNombre}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-orange-100 rounded-md">
            <Calendar className="w-3 h-3 text-orange-700" />
          </div>
          <span className="font-semibold">
            {new Date(oportunidad.fechaInicio).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Estado visual */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-gray-100 rounded-md">
              <Clock className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">
              {oportunidad.fechaFin ? 
                new Date(oportunidad.fechaFin).toLocaleDateString() : 
                'Sin fecha fin'
              }
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-gray-100 rounded-md">
              <Clock className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-semibold">
              {oportunidad.general === 1 ? 'General' : `Operador: ${oportunidad.operadorNombre}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente arrastrable que envuelve ProjectCard
interface DraggableProjectCardProps {
  oportunidad: OportunidadViewModel;
  isLoading?: boolean;
  onOportunidadSeleccionada?: (oportunidad: OportunidadViewModel) => void;
}

const DraggableProjectCard: React.FC<DraggableProjectCardProps> = ({ 
  oportunidad, 
  isLoading = false,
  onOportunidadSeleccionada
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: oportunidad.codigo.toString(),
    data: {
      type: 'oportunidad',
      oportunidad,
    },
    disabled: isLoading, // Deshabilitar drag cuando está cargando
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="relative"
    >
      <ProjectCard 
        oportunidad={oportunidad} 
        isDragging={isDragging} 
        isLoading={isLoading}
        onOportunidadSeleccionada={onOportunidadSeleccionada}
      />
    </div>
  );
};

export default ProjectCard;
export { DraggableProjectCard };