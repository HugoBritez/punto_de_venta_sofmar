export interface Inventario {
    id: number;
    fechaInicio: Date;
    horaInicio: string;
    operador: number;
    sucursal: number;
    deposito: number;
    estado: number;
    observacion: string;
    nroInventario: string;
    autorizado: number;
    fechaCierre: Date;
    horaCierre: string;
}