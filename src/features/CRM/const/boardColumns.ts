export interface ColumnaTablero {
    id: string;
    titulo: string;
    estado: number;
    color: string;
  }
  
  export const COLUMNAS_TABLERO: ColumnaTablero[] = [
    {
      id: 'en-planeacion',
      titulo: 'En Planeación',
      estado: 1,
      color: '#60A5FA', // blue-400
    },
    {
      id: 'en-negociacion',
      titulo: 'En Negociación',
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
  
  export const getColumnaByEstado = (estado: number): ColumnaTablero | undefined => {
    return COLUMNAS_TABLERO.find(columna => columna.estado === estado);
  };
  
  export const getEstadoByColumnaId = (columnaId: string): number | undefined => {
    return COLUMNAS_TABLERO.find(columna => columna.id === columnaId)?.estado;
  };