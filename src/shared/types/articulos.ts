export interface ArticuloBusqueda {
    idLote: number;
    lote: string;
    idArticulo: number;
    codigoBarra: string;
    descripcion: string;
    stockNegativo: number;
    precioCosto: number;
    precioVentaGuaranies: number;
    precioCredito: number;
    precioMostrador: number;
    precio4: number;
    precioCostoDolar: number;
    precioVentaDolar: number;
    precioCostoPesos: number;
    precioVentaPesos: number;
    precioCostoReal: number;
    precioVentaReal: number;
    vencimientoLote: string;
    cantidadLote: number;
    deposito: number;
    ubicacion: string;
    subUbicacion: string;
    marca: string;
    subcategoria: string;
    categoria: string;
    iva: number;
    vencimientoValidacion: number;
    ivaDescripcion: string;
    editarNombre: number;
    estadoVencimiento: string;
    proveedor: string;
    fechaUltimaVenta: string;
    fechaUltimaCompra: string;
    preCompra: number;
    principio_activo?: string;
    cantidad_caja?: number;
    precio_sugerido?: number;
    presentacion?: string;
    precompra?: number;
  }

  export interface ArticuloLote {
    id_articulo: number;
    codigo_interno: string;
  codigo_barra: string;
  codigo_barra_lote?: string;
  descripcion: string;
  stock: number;
  lotes: [
    {
      id: number;
      lote: string;
      cantidad: number;
      vencimiento: string;
    }
  ];
  depositos: [
    {
      codigo: number;
      descripcion: string;
      stock: number;
    }
  ];
  precio_costo: number;
  precio_venta: number;
  precio_credito: number;
  precio_mostrador: number;
  precio_4: number;
  ubicacion: string;
  sub_ubicacion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  proveedor_razon: string;
  fecha_ultima_compra: string;
  fecha_ultima_venta: string;
  talle: string;
  color: string;
}




