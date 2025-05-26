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
}