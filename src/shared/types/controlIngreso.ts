export interface ConfirmarIngresoDTO {
    idCompra: number;
    factura: string;
    deposito_inicial: number;
    deposito_destino : number;
    user_id: number;
    confirmador_id: number;
    items:Items[];
}


interface Items {
    lote: string;
    cantidadIngreso: number;
    cantidadFactura: number;
    idArticulo: number;
    vencimiento: Date;
}

export interface GetControlIngresoParams {
    deposito?: number;
    proveedor?: number;
    fechadesde?: Date;
    fechahasta?: Date;
    factura? : string;
    verificado?: number;
}


export interface GetItemsParams {
    idCompra: number;
    busqueda?: string;
    aVerificar?: boolean;
}


export interface VerificarCompraDTO {
    idCompra: number;
    userId: number;
}

export interface ControlIngresoEntity {
    idCompra: number;
    fechaCompra: string;
    deposito: number;
    depositoDescripcion: string;
    nroFactura: string;
    idOrden: number;
    nroProveedor: number;
    proveedor: string;
    proveedorId: number;
    verificado: number;
    responsableUbicacion: number;
    estado: string;
}

export interface ControlIngresoItemEntity {
    detalleCompra: number;
    articuloId: number;
    articuloDescripcion: string;
    cantidad: number;
    cantidadVerificada: number;
    lote: string;
    vencimiento: string;
    responsable: string;
}

export interface VerificacionItemDTO {
    detalle: number;
    cantidad: number;
    lote: string;
    vencimiento: string;
  }