export interface SucursalViewModel {
    id: number;
    descripcion: string;
    direccion: string;
    nombre_emp: string;
    ruc_emp: string;
    matriz: number;
}

export interface getSucursalDTO {
    operador?: number;
    matriz?: number;
}