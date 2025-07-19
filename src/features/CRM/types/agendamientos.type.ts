export interface AgendamientosCRMModel {
    codigo: string;
    fechaInicio: Date;
    fechaAgendamiento: Date;
    horaAgendamiento: string;
    titulo: string;
    descripcion: string;
    doctor: number;
    paciente: number;
    cliente: number;
    operador: number;
    estado: number;
}


export interface AgendamientoCRM extends AgendamientosCRMModel {
    doctorNombre: string;
    pacienteNombre: string;
    clienteNombre: string;
    operadorNombre: string;
}


export interface CreateAgendamientoCRMDTO {
    fechaInicio: Date;
    fechaAgendamiento: Date;
    horaAgendamiento: string;
    titulo: string;
    descripcion: string;
    doctor: number;
    paciente: number;
    cliente: number;
    operador: number;
    estado: number;
}

export interface UpdateAgendamientoCRM {
    codigo: string;
    fechaInicio?: Date;
    fechaAgendamiento?: Date;
    horaAgendamiento?: string;
    titulo?: string;
    descripcion?: string;
    doctor?: number;
    paciente?: number;
    cliente?: number;
    operador?: number;
    estado?: number;
}