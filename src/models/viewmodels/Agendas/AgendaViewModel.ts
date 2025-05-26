export interface AgendaViewModel {
    id: number;
    fecha: string;
    hora: string;
    dias: string;
    cliente: number;
    operador: number;
    vendedor: number;
    planificacion: number;
    prioridad: number;
    observacion: string;
    proximaLlamada: string;
    horaProx : string;
    proximaActi: string;
    visitado: number;
    latitud: string;
    longitud: string;
    estado: number;
}