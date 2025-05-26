export interface GetAgendasDTO{
    fechaDesde?: string;
    fechaHasta?: string;
    cliente?: string;
    vendedor?: string;
    visitado?: number;
    estado?: number;
    planificacion?: number;
    notas?: number;
    orden?: string;
}