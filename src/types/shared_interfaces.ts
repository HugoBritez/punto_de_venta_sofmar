
export interface Sucursal {
  id: number;
  descripcion: string;
}

export interface Deposito {
  dep_codigo: number;
  dep_descripcion: string;
}

export interface MetodosPago {
    me_codigo: number;
    me_descripcion: string;
}

export interface Cuota {
    fecha: string;
    valor: number;
    saldo: number;
  }

export interface Agenda {
    a_codigo: number;
    a_dias: string;
    a_estado: number;
    a_fecha: string;
    a_hora: string;
    a_latitud: string;
    a_longitud: string;
    a_obs: string;
    a_operador: string;
    a_visitado: number;
    a_planificacion: number;
    a_prioridad: number;
    vendedor: string;
    vendcod: number;
    cliente: string;
    visitado: string;
    cli_tel: string;
    fecha: string;
    prioridad: string;
    mis_visitas: number;
    mis_visitas_cliente: number;
    l_hora_inicio: string;
    l_hora_fin: string;
    l_longitud: string;
    l_latitud: string;
    a_prox_llamada: string;
    a_prox_acti: string;
    deudas_cliente: number;
    cliente_id: number;
    visita_en_curso: number;
}


export interface Localizacion {
    fecha: string;
    l_agenda: number;
    l_cliente: number;
    l_codigo: number;
    l_estado: number;
    l_fecha: string;
    l_hora_fin: string;
    l_hora_inicio: string;
    l_latitud: string;
    l_longitud: string;
    l_obs: string;
    l_operador: number;
}
export interface PermisoCobro {
    id: number;
    descripcion: string;
    valor: string;
}

export interface Vendedor {
    id: number
    op_nombre: string
    op_codigo: string
}

export interface Cliente {
    cli_codigo: number
    cli_interno: number
    cli_razon: string
    cli_ruc: string
    cli_limitecredito: number
    deuda_actual: number
    credito_disponible: number
    vendedor_cliente: number
}

export interface Nota {
    an_agenda_id: number;
    an_codigo: number;
    an_fecha: string;
    an_hora: string;
    an_nota: string;
  }

 export interface Pedidos {
    codigo: number;
    codcliente: number;
    cliente: string;
    moneda: string;
    fecha: string;
    codsucursal: number;
    sucursal: string;
    vendedor: string;
    operador: string;
    total: number;
    descuento: number;
    saldo: number;
    condicion: string;
    vencimiento: string;
    factura: string;
    obs: string;
    estado: number;
    estado_desc: string;
    area_actual: string;
    area_sgte: string;
  }
  
 export interface DetallePedidos {
    det_codigo: number;
    art_codigo: number;
    codbarra: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez: number;
    codlote: string;
    lote: string;
    ar_editar_desc: number;
    costo: number;
    precio_compra: number;
    bonificacion: number;
    iva: number;
  }


  export interface PermisosOperador {
    op_autorizar: number;
    op_graficos: number;
  }

  export interface Venta {
    codigo: number
    codcliente: number
    cliente: string
    moneda: string
    fecha: string
    codsucursal: number
    sucursal: string
    vendedor: string
    operador: string
    total: number
    descuento: number
    saldo: number
    condicion: string
    vencimiento: string
    factura: string
    obs: string
    estado: number
    estado_desc: string
  }
  
  export interface DetalleVenta {
    det_codigo: number
    art_codigo: number
    codbarra: string
    descripcion: string
    descripcion_editada?: string
    cantidad: number
    precio: number
    descuento: number
    exentas: number
    cinco: number
    diez: number
    lote: string
    vencimiento: string
    ar_editar_desc: number
    iva: number
  }

  export interface Factura {
    d_codigo: number
    d_descripcion: string
    d_nrotimbrado: string
    d_comprobante: number
    d_fecha_vence: string
    d_fecha_in: string
    d_p_emision: string
    d_establecimiento: string
    d_nro_secuencia: string
  }

 export  interface Articulo {
    al_codigo: number;
    ar_codigo: number;
    ar_descripcion: string;
    ar_pvg: number;
    ar_pvcredito: number;
    ar_pvmostrador: number;
    ar_codbarra: string;
    ar_iva: number;
    al_cantidad: number;
    al_vencimiento: string;
    ar_editar_desc: number;
    ar_pcg: number;
    ma_descripcion: string;
    al_registro: string;
  }

  export interface OperacionData {
    ventaId: number;
    caja: number;
    cuenta: number;
    fecha: string;
    observacion: string;
    recibo: number;
    documento: number;
    operador: string | null;
    redondeo: number;
    monto: number;
    mora: number;
    punitorio: number;
    descuento: number;
    estado: number;
    cod_retencion: number;
    metodo: number
    tipomovimiento?: number,
    codigotarjeta?: number,
    tipotarjeta?: number,
    banco?: number,
    cuenta_bancaria?: number,
    tarjeta?: number,
    moneda?: number,
    nro_tarjeta?: string,
    nro_autorizacion?: string,
    titular?: number,
    titularNombre?: string,
    nro_transferencia?: string,
    observacion_transferencia?: string,
    vencimientoCheque?: string,
    metodoNombre?: string,
    telefonoZimple?: string,
    tarjetaNombre?: string,
    numero_cheque?: string,
    bancoNombre?: string,
  }

  export interface Banco {
    ba_codigo: number;
    ba_descripcion: string;
  }

  export interface CuentasBancarias {
    cb_codigo: number;
    cb_banco: number;
    cb_descripcion: string;
  }

  export interface Tarjetas {
    t_codigo: number;
    t_descripcion: string;
  }

  export interface Monedas {
    mo_codigo: number;
    mo_descripcion: string;
  }

  export interface Cheque {
    importe: number;
    vencimiento: string;
    numero: string; 
    banco: number;
  }

export interface Categoria {
  ca_codigo: number;
  ca_descripcion: string;
}

export interface Subcategoria {
  sc_codigo: number;
  sc_descripcion: string;
}

export interface Marca {
  ma_codigo: number;
  ma_descripcion: string;
}

export interface Ciudad {
  ciu_codigo: number;
  ciu_descripcion: string;
}

export interface Moneda {
  mo_codigo: number;
  mo_descripcion: string;
}

export interface Seccion {
  s_codigo: number;
  s_descripcion: string;
}

export interface Configuraciones {
  id: number;
  valor: string;
}

export interface Chofer {
  id: number;
  nombre: string;
  ci: number;
  rol: string;
}

export interface Camion {
  id: number;
  descripcion: string;
  chapa: string;
}

export interface Proveedor {
  pro_codigo: number;
  pro_razon: string;
}

export interface Reparto {
  fecha: string;
  hora_s: string;
  hora_l: string;
  chofer: number;
  oprador: number;
  camion: number;
  sucursal: number;
  moneda: number;
  km_actual: number;
  ult_km: number;
  estado: number;
}

export interface DetalleReparto {
  monto: number;
  estado: number;
  obs: string;
  hora_e: string;
  hora_s: string;
  detalle_pedidos?: DetallePedidos;
  detalle_ventas?: DetalleVenta;
  detalle_pagos?: number;
  detalle_cobros?: number;
}

export interface DetalleEntrega {
 id: number;
 fecha: string;
 factura: string;
 cliente: string;
 condicion: string;
 moneda: string;
 monto: number;
 zona: string;
 observacion: string;
 vendedor: string;
}

export interface Entrega {
  item: number,
  descripcion: string,
  cantidad: number,
  precio: number,
  descuento: number,
  total: number,

}

export interface Ubicacion {
  ub_codigo: number;
  ub_descripcion: string;
}

export interface SubUbicacion {
  s_codigo: number;
  s_descripcion: string;
}

export interface Marca {
  ma_codigo: number
  ma_descripcion: string
}
export interface Subcategoria {
  sc_codigo: number
  sc_descripcion: string
}

export interface UnidadMedida {
  um_codigo: number
  um_descripcion: string
}

export interface ArticulosDirecta {
  id: number;
  cod_barra: string;
  descripcion: string;
}

export interface ArticulosNuevo {
  id_articulo: number;
  codigo_barra: string;
  descripcion: string;
  stock: number;
  lotes: [
    {
      id: number;
      lote: string;
      cantidad: number;
      vencimiento: string;
      deposito: number;
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
  iva: number;
  iva_descripcion: string;
  vencimiento_validacion: number;
  proveedor: string;
  editar_nombre: number;
  estado_vencimiento: string;
}

export interface ListaPrecios {
  lp_codigo: number;
  lp_descripcion: string;
}

export interface PedidosNuevo {
  pedido_id: number;
  cliente: string;
  moneda: string;
  fecha: Date;
  factura: string;
  area: string;
  siguiente_area: string;
  estado: "Pendiente" | "Facturado" | "Todos";
  condicion: "Crédito" | "Contado";
  operador: string;
  vendedor: string;
  deposito: string;
  p_cantcuotas: number;
  p_entrega: number;
  p_autorizar_a_contado: boolean;
  acuerdo: string;
  imprimir: number;
  obs: string;
  total: number;
  detalles: [
    {
      codigo: number;
      descripcion_articulo: string;
      cantidad_vendida: number;
      bonificacion: "V" | "B";
      d_cantidad: number;
      precio: number;
      ultimo_precio: number;
      porc_costo: number;
      porcentaje: number;
      descuento: number;
      exentas: number;
      cinco: number;
      diez: number;
      dp_lote: string;
      vencimiento: string;
      comision: number;
      actorizado: number;
      obs: string;
      cant_stock: number;
      dp_codigolote: number;
      cant_pendiente: number;
      cantidad_verificada: number;
    }
  ];
}

export interface Presupuesto {
  codigo: number
  codcliente: number
  cliente: string
  moneda: string
  fecha: string
  codsucursal: number
  sucursal: string
  vendedor: string
  operador: string
  total: number
  descuento: number
  saldo: number
  condicion: string
  vencimiento: string
  factura: string
  obs: string
  estado: number
  estado_desc: string
}

export interface DetallePresupuesto {
  det_codigo: number
  art_codigo: number
  codbarra: string
  descripcion: string
  descripcion_editada: string
  cantidad: number
  precio: number
  descuento: number
  exentas: number
  cinco: number
  diez: number
  lote: string
  vence: string
  ar_editar_desc: number
}

export interface Remisiones {
  id: number;
  fecha: string;
  operador: string;
  chofer: string;
  cliente: string;
  deposito: string;
  nro_remision: string;
  factura: string;
  timbrado: string;
  vehiculo: number;
  fecha_salida: string;
  fecha_llegada: string;
  tipo_remision: string;
  items: {
    id: number;
    cantidad: number;
    articulo_id: number;
    cod_barras: string;
    articulo_descripcion: string;
    lote: string;
    lote_id: number;
    vencimiento: string;
  }[]
}

export interface VentaTicket {
  codigo: number;
  tipo_venta: string;
  fecha_venta: string;
  fecha_vencimiento: string;
  cajero: string;
  vendedor: string;
  cliente: string;
  direccion: string;
  telefono: string;
  ruc: string;
  subtotal: number;
  total_descuento: number;
  total_a_pagar: number;
  total_exentas: number;
  total_diez: number;
  total_cinco: number;
  detalles: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
  }[];
}



