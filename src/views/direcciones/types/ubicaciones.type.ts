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

export interface ItemInventario {
  id_inventario: number;
  nro_inventario: string;
  fecha_inventario: string;
  id_articulo: number;
  id_lote: number;
  cod_ref: string;
  codigo_barra: string;
  descripcion: string;
  lote: string;
  cantidad_actual: number;
  cantidad_inicial: number;
  cantidad_scanner: number;
  diferencia: number;
  tipo_diferencia: "GANANCIA" | "PERDIDA";
  valor_diferencia: string;
  valor_diferencia_formato: string;
  valor_diferencia_numero: string;
  categoria: string;
  categoria_id: number;
  subcategoria: string;
  subcategoria_id: number;
  marca: string;
  precio_compra: string;
  precio_compra_numero: string;
  precio_venta: string;
  precio_venta_numero: string;
  deposito: string;
  sucursal: string;
  vencimiento: string;
}

export interface ResumenInventario {
  total_items: number;
  total_ganancias: number;
  total_perdidas: number;
  valor_diferencia_neto: number;
  valor_diferencia_neto_formato: string;
  valor_ganancias: number;
  valor_ganancias_formato: string;
  valor_perdidas: number;
  valor_perdidas_formato: string;
}

export interface ReporteInventario {
  items: ItemInventario[];
  resumen: ResumenInventario;
}
