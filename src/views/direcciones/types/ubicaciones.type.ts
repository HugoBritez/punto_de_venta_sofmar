export interface UbicacionDTO {
    calle_inicial: string;
    calle_final: string;
    predio_inicial: number;
    predio_final: number;
    piso_inicial: number;
    piso_final: number;
    direccion_inicial: number;
    direccion_final: number;
    tipo_direccion: number;
    estado: number;
}

export interface Ubicacion {
    calle: string;
    predio: number;
    piso: number;
    direccion: number;
    tipo_direccion: number;
}