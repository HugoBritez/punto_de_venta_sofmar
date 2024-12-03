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
  }
