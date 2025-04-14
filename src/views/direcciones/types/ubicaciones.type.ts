export interface UbicacionDTO {
    d_calle_inicial: string;
    d_calle_final: string;
    d_predio_inicial: number;
    d_predio_final: number;
    d_piso_inicial: number;
    d_piso_final: number;
    d_direccion_inicial: number;
    d_direccion_final: number;
    d_tipo_direccion: number;
    d_estado: number;
}

export interface AgrupacionDTO {
    rango: {
        d_calle_inicial: string;
        d_calle_final: string;
        d_predio_inicial: number;
        d_predio_final: number;
        d_piso_inicial: number;
        d_piso_final: number;
        d_direccion_inicial: number;
        d_direccion_final: number;
    }
    zona: number;
}

export interface Ubicacion {
    d_calle: string;
    d_predio: number;
    d_piso: number;
    d_direccion: number;
    d_tipo_direccion: number;
}

export interface ItemsPorDireccion {
    cod_barras: string;
    descripcion: string;
    direccion_completa: string;
    zona: number;
}

export interface ItemsPorDireccionDTO {
  articulo: number;
  lote?: string;
  rango: {
    d_calle_inicial: string;
    d_calle_final: string;
    d_predio_inicial: number;
    d_predio_final: number;
    d_piso_inicial: number;
    d_piso_final: number;
    d_direccion_inicial: number;
    d_direccion_final: number;
  };
}
