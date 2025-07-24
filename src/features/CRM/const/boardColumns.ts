import crmApi from "../services/crmApi";

export interface ColumnaTablero {
    id: string;
    titulo: string;
    estado: number;
    color: string;
  }


  const ESTADOS_TABLERO = await crmApi.getEstados();
  
  export const COLUMNAS_TABLERO: ColumnaTablero[] = [
    {
      id: 'en-planeacion',
      titulo: `${ESTADOS_TABLERO.find(estado => estado.id === 1)?.descripcion || 'En planeación'}`,
      estado: 1,
      color: '#60A5FA', // blue-400
    },
    {
      id: 'en-negociacion',
      titulo: `${ESTADOS_TABLERO.find(estado => estado.id === 2)?.descripcion || 'En negociación'}`,
      estado: 2,
      color: '#FBBF24', // yellow-400
    },
    {
      id: 'concluidos',
      titulo: `${ESTADOS_TABLERO.find(estado => estado.id === 3)?.descripcion || 'Concluidos'}`,
      estado: 3,
      color: '#34D399', // green-400
    },
    {
      id: 'rechazados',
      titulo: `${ESTADOS_TABLERO.find(estado => estado.id === 4)?.descripcion || 'Rechazados'}`,
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