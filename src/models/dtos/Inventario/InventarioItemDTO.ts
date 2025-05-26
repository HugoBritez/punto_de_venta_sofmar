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