export interface PresupuestoEntity {
    codigo: number;
    cliente: number;
    operador: number;
    fecha: Date;
    descuento: number;
    estado: number;
    confirmado: number;
    vendedor: number;
    credito: number;
    hora: string;
    observacion: string;
    flete: string;
    plazo: string;
    validez: string;
    condicion: string;
    sucursal: number;
    deposito: number;
}

export interface PresupuestoObservacion {
    observacion: string;
}

export interface DetallePresupuestoEntity {
    codigo: number;
    presupuesto: number;
    articulo: number;
    cantidad: number;
    precio: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez:number;
    porcentaje: number;
    altura: number;
    largura: number;
    mts2: number;
    listaPrecio: number;
    talle: string;
    codigoLote: number;
    lote: string;
    vencimineto: Date;
    descripcionArticulo: string;
    observacion: string;
    procesado: number;
}

export interface PresupuestoViewModel {
    codigo: number;
    codcliente: number;
    cliente: string;
    moneda: string;
    fecha: string;
    codsucursal: number;
    sucursal: string;
    vendedor: string;
    operador: string;
    total: string;
    descuento: number;
    saldo: number;
    condicion: string;
    vencimiento: string;
    factura: string;
    obs: string;
    estado: number;
    estado_desc: string;
    pre_condicion: string;
    pre_plazo: string;
    pre_flete: string;
}

export interface GetPresupuestosParams {
    fecha_desde?: string;
    fecha_hasta?: string;
    sucursal?: number;
    cliente?: number;
    vendedor?: number;
    articulo?: number;
    moneda?: number;
    estado?: number;
    busqueda?: string; 
}


export interface DetallePresupuestoViewModel {
    det_codigo: number;
    art_codigo: number;
    codbarra: string;
    descripcion: string;
    ar_editar_desc: number;
    cantidad:number;
    precio: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez: number;
    codlote: number;
    lote: string;
    largura: number;
    altura: number;
    mts: number;
    descripcion_editada: string;
    listaprecio: number;
    vence: string;
    depre_obs: string;
    iva: number;
    kilos: number;
}

