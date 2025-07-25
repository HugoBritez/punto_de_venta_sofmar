import crmApi from "../services/crmApi";

export interface ColumnaTablero {
    id: string;
    titulo: string;
    estado: number;
    color: string;
}

// Columnas con valores por defecto
export const COLUMNAS_TABLERO: ColumnaTablero[] = [
  {
    id: 'en-planeacion',
    titulo: 'En planeación',
    estado: 1,
    color: '#60A5FA', // blue-400
  },
  {
    id: 'en-negociacion',
    titulo: 'En negociación',
    estado: 2,
    color: '#FBBF24', // yellow-400
  },
  {
    id: 'concluidos',
    titulo: 'Concluidos',
    estado: 3,
    color: '#34D399', // green-400
  },
  {
    id: 'rechazados',
    titulo: 'Rechazados',
    estado: 4,
    color: '#F87171', // red-400
  },
];

// Función para actualizar los títulos con los estados del servidor
export const actualizarTitulosColumnas = async (): Promise<void> => {
  try {
    const ESTADOS_TABLERO = await crmApi.getEstados();
    
    COLUMNAS_TABLERO.forEach(columna => {
      const estado = ESTADOS_TABLERO.find(estado => estado.id === columna.estado);
      if (estado) {
        columna.titulo = estado.descripcion;
      }
    });
  } catch (error) {
    console.error('Error al actualizar títulos de columnas:', error);
  }
};

export const getColumnaByEstado = (estado: number): ColumnaTablero | undefined => {
  return COLUMNAS_TABLERO.find(columna => columna.estado === estado);
};

export const getEstadoByColumnaId = (columnaId: string): number | undefined => {
  return COLUMNAS_TABLERO.find(columna => columna.id === columnaId)?.estado;
};