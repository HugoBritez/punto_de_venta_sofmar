export interface AgendaDTO {
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

export interface Nota {
    id: number;
    fecha: string;
    hora: string;
    nota: string;
  }
  
  export interface Subvisita {
    id: number;
    nombreCliente: string;
    motivoVisita: string;
    resultadoVisita: string;
  }
  
  export interface AgendaViewModel {
    a_Codigo: number;
    a_Fecha: string;
    a_Hora: string;
    a_Cliente: number;
    a_Vendedor: number;
    a_Visitado: number;
    a_Estado: number;
    a_Planificacion: number;
    a_Prioridad: number;
    a_Prox_Llamada: string;
    a_Prox_Acti: string;
    a_Visitado_Prox: number;
    proxActi: string;
    visitado: string;
    prioridad: string;
    visitaProx: string;
    planificacion: string;
    fecha: string;
    fProx: string;
    clienteId: number;
    cliente: string;
    deudasCliente: number;
    cliRuc: string;
    cliTel: string;
    cliDir: string;
    vendCod: number;
    vendedor: string;
    lLatitud: number;
    lLongitud: number;
    lHoraInicio: string;
    lHoraFin: string;
    visitaEnCurso: number;
    tiempoTranscurrido: string;
    totalVisitasCliente: number;
    misVisitas: number;
    misVisitasCliente: number;
    cantNotas: number;
    notas: Nota[];
    subvisitas: Subvisita[];
  }
  

export interface RegistrarLlegadaDTO {
    agendaId: number;
    operadorId: number;
    longitud: string;
    latitud: string;
}

export interface ResponseViewModel<T> {
    body: T;
    statusCode: number;
    success: boolean;
}

export interface ReagendarVisitaDTO
{
    idAgenda: number;
    proximaFecha: Date;
    proximaHora: string;
    observacion?: string;
}

export interface GetAgendasDTO{
    idAgenda?: number;
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

export interface AgendaNotasViewModel {
    id: number;
    agendaId: number;
    nota: string;
    fecha: string;
    hora: string;
    sistema: number;
}

export interface SubvisitaViewModel {
    id: number;
    idCliente: number;
    idAgenda: number;
    nombreCliente: string;
    motivoVisita: string;
    resultadoVisita: string;
}

export interface LocalizacionViewModel {
    id: number;
    agenda: number;
    fecha: string;
    horaInicio: string;
    goraFin: string;
    obs: string;
    cliente: number;
    operador: number;
    longitud: string;
    latitud: string;
    acuraci: number;
    estado: number;
}