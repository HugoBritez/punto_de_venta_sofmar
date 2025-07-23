import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { OportunidadViewModel } from '../types/oportunidades.type';
import { COLUMNAS_TABLERO } from '../const/boardColumns';
import ProjectCard, { DraggableProjectCard } from './ProjectCard';
import { DetalleProyectoModal } from './DetalleProyectoModal';

// Componente para una columna
interface ColumnaProps {
  columna: typeof COLUMNAS_TABLERO[0];
  oportunidades: (OportunidadViewModel & { isLoading?: boolean })[];
  loadingCards: Set<string>;
  onOportunidadSeleccionada: (oportunidad: OportunidadViewModel) => void;
}

const Columna: React.FC<ColumnaProps> = ({ columna, oportunidades, onOportunidadSeleccionada }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columna.id,
  });

  // Función para obtener el mensaje específico de cada columna vacía
  const getMensajeColumnaVacia = (columnaId: string) => {
    switch (columnaId) {
      case 'en-planeacion':
        return {
          titulo: 'Sin proyectos en planeación',
          descripcion: 'Los proyectos que estén en fase de planificación aparecerán aquí'
        };
      case 'en-negociacion':
        return {
          titulo: 'Sin proyectos en negociación',
          descripcion: 'Los proyectos en proceso de negociación se mostrarán aquí'
        };
      case 'concluidos':
        return {
          titulo: 'Sin proyectos concluidos',
          descripcion: 'Los proyectos exitosos aparecerán en esta columna'
        };
      case 'rechazados':
        return {
          titulo: 'Sin proyectos rechazados',
          descripcion: 'Los proyectos que no prosperaron se mostrarán aquí'
        };
      default:
        return {
          titulo: 'Columna vacía',
          descripcion: 'Suelta aquí los proyectos'
        };
    }
  };

  const mensajeVacio = getMensajeColumnaVacia(columna.id);

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-colors ${
        isOver ? 'border-blue-300 bg-blue-50 shadow-lg' : ''
      }`}
      style={{
        minHeight: '400px',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: columna.color }}
        />
        <h3 className="font-semibold">{columna.titulo}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {oportunidades.length}
        </span>
      </div>
      
      <SortableContext
        items={oportunidades.map(op => op.codigo.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[200px]">
          {oportunidades.map((oportunidad) => (
            <DraggableProjectCard 
              key={oportunidad.codigo} 
              oportunidad={oportunidad}
              isLoading={oportunidad.isLoading || false}
              onOportunidadSeleccionada={onOportunidadSeleccionada}
            />
          ))}
        </div>
      </SortableContext>
      
      {oportunidades.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 p-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">
              {mensajeVacio.titulo}
            </div>
            <div className="text-xs text-gray-400">
              {mensajeVacio.descripcion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
interface ProjectCanvasProps {
  oportunidades?: OportunidadViewModel[];
  onOportunidadMove?: (oportunidadId: number, nuevoEstado: number, autorizadoPor: number) => Promise<void>;
}

// Función personalizada de detección de colisiones para columnas
const detectCollision = (args: any) => {
  // Primero, usar rectIntersection para detectar colisiones básicas
  const pointerIntersections = rectIntersection(args);
  
  // Si no hay colisiones, retornar vacío
  if (!pointerIntersections.length) {
    return [];
  }

  // Filtrar solo las colisiones con columnas (no con otras tarjetas)
  return pointerIntersections.filter(intersection => {
    const droppableId = intersection.id;
    // Verificar si el ID corresponde a una columna
    return COLUMNAS_TABLERO.some(columna => columna.id === droppableId);
  });
};

const ProjectCanvas: React.FC<ProjectCanvasProps> = ({ 
  oportunidades = [],
  onOportunidadMove 
}) => {
  const [oportunidadActiva, setOportunidadActiva] = useState<OportunidadViewModel | null>(null);
  const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState<OportunidadViewModel | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set());
  const [pendingMoves, setPendingMoves] = useState<Map<string, { oportunidad: OportunidadViewModel, nuevoEstado: number }>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log('🎯 Drag Start:', event);
    setIsDragging(true);
    const { active } = event;
    const oportunidad = oportunidades.find(op => op.codigo.toString() === active.id);
    if (oportunidad) {
      console.log(' Oportunidad encontrada:', oportunidad);
      setOportunidadActiva(oportunidad);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('🏁 Drag End:', event);
    setIsDragging(false);
    const { active, over } = event;
    
    setOportunidadActiva(null);

    if (!over) {
        console.log('❌ No hay destino válido');
        return;
    }

    const oportunidadId = parseInt(active.id as string);
    const columnaDestino = over.id as string;
    
    // Verificar que el destino sea una columna válida
    const columnaValida = COLUMNAS_TABLERO.find(col => col.id === columnaDestino);
    if (!columnaValida) {
        console.log('❌ Destino no es una columna válida:', columnaDestino);
        return;
    }

    const nuevoEstado = columnaValida.estado;
    const cardId = active.id as string;
    const oportunidad = oportunidades.find(op => op.codigo.toString() === cardId);
    
    if (!oportunidad) {
        console.log('❌ Oportunidad no encontrada');
        return;
    }
    
    // Verificar que no se esté moviendo a la misma columna
    if (oportunidad.estado === nuevoEstado) {
        console.log('🔄 Ya está en la misma columna');
        return;
    }
    
    console.log('🔍 Datos del drag:', {
        oportunidadId,
        columnaDestino,
        nuevoEstado,
        onOportunidadMove: !!onOportunidadMove
    });

    if (onOportunidadMove) {
        // Marcar la tarjeta como cargando y guardar el movimiento pendiente
        setLoadingCards(prev => new Set(prev).add(cardId));
        setPendingMoves(prev => new Map(prev).set(cardId, { oportunidad, nuevoEstado }));
        
        try {
            console.log(`🔄 Moviendo oportunidad ${oportunidadId} a estado ${nuevoEstado}`);
            await onOportunidadMove(oportunidadId, nuevoEstado, oportunidad.autorizadoPor || 0);
        } catch (error) {
            console.error('❌ Error al mover oportunidad:', error);
            // Revertir el movimiento pendiente en caso de error
            setPendingMoves(prev => {
                const newMap = new Map(prev);
                newMap.delete(cardId);
                return newMap;
            });
            // Aquí podrías mostrar un toast de error
        } finally {
            // Remover del estado de carga
            setLoadingCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(cardId);
                return newSet;
            });
        }
    }
};

  // Función para obtener oportunidades con estado de carga
  const getOportunidadesConCarga = (estado: number): (OportunidadViewModel & { isLoading?: boolean })[] => {
    const oportunidadesEnColumna: (OportunidadViewModel & { isLoading?: boolean })[] = [];
    
    // Agregar todas las oportunidades que deberían estar en esta columna
    oportunidades.forEach(oportunidad => {
      const cardId = oportunidad.codigo.toString();
      const pendingMove = pendingMoves.get(cardId);
      
      // Si hay un movimiento pendiente hacia esta columna, mostrarla aquí
      if (pendingMove && pendingMove.nuevoEstado === estado) {
        oportunidadesEnColumna.push({
          ...oportunidad,
          estado: estado,
          isLoading: loadingCards.has(cardId)
        });
      }
      // Si no hay movimiento pendiente y está en este estado, mostrarla aquí
      else if (!pendingMove && oportunidad.estado === estado) {
        oportunidadesEnColumna.push({
          ...oportunidad,
          isLoading: loadingCards.has(cardId)
        });
      }
      // Si hay un movimiento pendiente pero NO es hacia esta columna, NO mostrarla aquí
      // (esto evita que aparezca en la columna original)
    });
    
    return oportunidadesEnColumna;
  };

  const [isDetalleProyectoModalOpen, setIsDetalleProyectoModalOpen] = useState(false);

  const handleOportunidadSeleccionada = (oportunidad: OportunidadViewModel) => {
    console.log('🔍 Oportunidad seleccionada:', oportunidad);
    setOportunidadSeleccionada(oportunidad);
    setIsDetalleProyectoModalOpen(true);
  }

  return (
    <div className={`p-6 bg-gray-50 min-h-[calc(100vh-12rem)] rounded-md ${
      isDragging ? 'cursor-grabbing' : ''
    }`}>
      <DndContext
        sensors={sensors}
        collisionDetection={detectCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNAS_TABLERO.map((columna) => (
            <Columna
              key={columna.id}
              columna={columna}
              oportunidades={getOportunidadesConCarga(columna.estado)}
              loadingCards={loadingCards}
              onOportunidadSeleccionada={handleOportunidadSeleccionada}
            />
          ))}
        </div>

        <DragOverlay>
          {oportunidadActiva ? (
            <ProjectCard 
              oportunidad={oportunidadActiva} 
              isDragging={true}
              isLoading={loadingCards.has(oportunidadActiva.codigo.toString())}
              onOportunidadSeleccionada={handleOportunidadSeleccionada}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <DetalleProyectoModal
        oportunidad={oportunidadSeleccionada || null}
        isOpen={isDetalleProyectoModalOpen}
        onClose={() => setIsDetalleProyectoModalOpen(false)}
      />
    </div>
  );
};

export default ProjectCanvas;