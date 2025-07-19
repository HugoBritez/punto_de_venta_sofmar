export type RecordatorioModel = {
    codigo: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    fechaLimite: string;
    hora: string;
    operador: number;
    cliente: number;
    estado: number;
    tipoRecordatorio: number;
}


export interface RecordatorioViewModel extends RecordatorioModel
{
    operadorNombre: string;
    clienteNombre: string;
}


export type CreateRecordatorioCRMDTO = {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    fechaLimite?: string;
    hora?: string;
    operador?: number;
    cliente?: number;
    estado?: number;
    tipoRecordatorio?: number;
}


export type UpdateRecordatorioCRMDTO = {
    codigo: number;
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    fechaLimite?: string;
    hora?: string;
    operador?: number;
    cliente?: number;
}