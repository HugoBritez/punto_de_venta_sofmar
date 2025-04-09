export interface Deposito {
  // Definir la estructura de los depósitos si es necesario
}

export interface Lote {
  // Definir la estructura de los lotes si es necesario
}

export interface Articulo {
  id_articulo: number;
  codigo_barra: string;
  descripcion: string;
  categoria: string;
  depositos: Deposito[];
  editar_nombre: number;
  estado_vencimiento: string;
  fecha_ultima_venta: string;
  iva: number;
  iva_descripcion: string;
  lotes: Lote[];
  marca: string;
  precio_4: string;
  precio_costo: string;
  precio_credito: string;
  precio_mostrador: string;
  precio_venta: string;
  proveedor: string;
  stock: number;
  stock_negativo: number;
  sub_ubicacion: string;
  subcategoria: string;
  ubicacion: string;
  vencimiento_validacion: number;
} 