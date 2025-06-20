export interface CerrarInventarioParams {
    id: number;
    userId: number;
}

export interface InventarioEntity {
    id: number;
    fechaInicio: Date;
    horaInicio: string;
    operador: number;
    sucursal: number;
    deposito: number;
    estado: number;
    observacion: string;
    nroInventario: string;
    autorizado : number;
    fechaCierre: Date;
    horaCierre: string;
    items: InventarioItemEntity[];
}



export interface InventarioItemDTO {
    item: {
        idArticulo: number;
        idLote: number;
        lote: string;
        fechaVencimientoItem: Date;
        cantidadInicial: number;
        cantidadFInal: number;
        codigoBarra: string;
    }
    idInventario: number;
}

export interface InventarioItemEntity {
    id: number;
    idArticulo: number;
    idLote: number;
    idInventario: number;
    lote: string;
    fechaVencimientoItem: Date;
    cantidadInicial: number;
    cantidadFinal: number;
}


export interface GetItemsParams {
    idInventario: number;
    filtro: number;
    tipo: number;
    valor: number;
    stock: boolean;
    busqueda?: string;
}

export interface InventarioViewModel {
    id: number;
    fecha_inicio: string;
    hora_inicio: string;
    fecha_cierre: string;
    hora_cierre: string;
    operador_id: number;
    operador_nombre: string;
    sucursal_id: number;
    sucursal_nombre: string;
    deposito_id: number;
    deposito_nombre: string;
    nro_inventario: string;
    estado: number;
    autorizado: number;
}

export interface ItemViewModel {
    articulo_id: number;
    cod_interno: string;
    lote_id:  number;
    descripcion: string;
    ubicacion: string;
    control_vencimiento: number;
    vencimiento: string;
    sub_ubicacion: string;
    lote: string;
    cod_barra_articulo: string;
    cod_barra_lote: string;
    cantidad_inicial: number;
    cantidad_final: number;
    cantidad_actual: number;
}

export interface InventarioViewModel {
    id: number;
    fecha_inicio: string;
    hora_inicio: string;
    fecha_cierre: string;
    hora_cierre: string;
    operador_id: number;
    operador_nombre: string;
    sucursal_id: number;
    sucursal_nombre: string;
    deposito_id: number;
    deposito_nombre: string;
    nro_inventario: string;
    estado: number;
    autorizado: number;
}

