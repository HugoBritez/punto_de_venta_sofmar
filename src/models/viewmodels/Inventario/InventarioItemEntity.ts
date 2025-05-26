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