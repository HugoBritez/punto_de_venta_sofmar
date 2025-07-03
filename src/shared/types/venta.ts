export interface Venta {
    codigo: number;
    cliente: number;
    operador: number;
    deposito: number;
    moneda: number;
    fecha: Date;
    factura: string;
    credito: number;
    saldo: number;
    total: number;
    vencimiento?: Date;
    estado: number;
    devolucion: number;
    procesado: number;
    descuento: number;
    cuotas: number;
    cantCuotas: number;
    obs: string;
    vendedor: number;
    sucursal: number;
    metodo: number;
    aplicarA: number;
    retencion: number;
    timbrado?: string;
    codeudor: number;
    pedido: number;
    hora: string;
    userPc: string;
    situacion: number;
    chofer: number;
    cdc: string;
    qr: string;
    kmActual: number;
    vehiculo: number;
    descTrabajo: string;
    kilometraje: number;
    servicio: number;
    siniestro: string;
    mecanico: number;
    cajaDefinicion?:  number;
    confOperacion?: number;
}

export interface DetalleVenta {
    deveVenta: number;
    deveArticulo: number;
    deveCantidad: number;
    devePrecio: number;
    deveDescuento: number;
    deveExentas: number;
    deveCinco: number;
    deveDiez: number;
    deveDevolucion: number;
    deveVendedor: number;
    deveColor: string;
    deveBonificacion: number;
    deveTalle: string;
    deveCodioot: number;
    deveCosto: number;
    deveCostoArt: number;
    deveCincoX: number;
    deveDiezX: number;
    editarNombre?: number;
    lote: string;
    loteId: number;
    articuloEditado: boolean;
    deveDescripcionEditada: string;
    codigoBarra?: string;
    descripcion?:string; 
    precioUnitario?: number;
    subtotal?: number;
    unidadMedida?: number;
    vencimiento?: string;
}

export interface DetalleVentaViewModel {
    det_codigo: number;
    art_codigo: number;
    codbarra: string;
    descripcion: string;
    descripcion_editada: string;
    cantidad: string;
    precio: string;
    precio_number: number;
    descuento: string;
    descuento_number: number;
    exentas: string;
    exentas_number: number;
    cinco: string;
    cinco_number: number;
    lote: string;
    vencimiento: string;
    largura: string;
    altura: string;
    mt2: string;
    kilos: string;
    unidad_medida: number;
}

export interface VentaViewModel {
    codigo: number;
    codcliente: number;
    cliente: string;
    moneda_id: number;
    moneda: string;
    fecha: string;
    codsucursal: number;
    sucursal: string;
    vendedor: string;
    operdor: string;
    total: string;
    descuento: string;
    saldo: string;
    condicion: string;
    vencimiento: string;
    factura: string;
    obs: string;
    estado: number;
    estado_desc: string;
    obs_anulacion: string;
    terminal: string;
    exentas_total: string;
    descuento_total: string;
    iva5_total: string;
    iva10_total: string;
    sub_total: string;
    total_articulos: string;
    total_neto: string;
    ve_cdc: string;
    tipo_documento: number;
    cliente_descripcion: string;
    cliente_direccion: string;
    cliente_ciudad: string;
    ciudad_id: number;
    ciudad_descripcion: string;
    distrito_id: number;
    distrito_descripcion: string;
    departamento_id: number;
    departamento_descripcion: string;
    cliente_telefono: string;
    cliente_email: string;
    cliente_codigo_interno: number;
    operador_nombre: string;
    operador_documento: string;
    establecimiento: string;
    punto_emision: string;
    numero_factura: string;
    cliente_ruc: string;
    cant_cuotas: number;
    entrega_inicial: number;
}

export interface GetVentaParams {
    fecha_desde?: string;
    fecha_hasta?: string;
    sucursal?: number;
    cliente?: number;
    vendedor?: number;
    articulo?: number;
    moneda?: number;
    factura?: string;
    venta?: number;
    estadoVenta?: number;
    remisiones?: number;
    listarFacturasSinCDC?: boolean;
    page: number;
    itemsPorPagina: number;
}


export interface ActualizarMetaAcordadaDTO {
    id: number;
    articuloId: number;
    operadorId: number;
    metaAcordada: number;
    periodo: number;
    estado: boolean;
}