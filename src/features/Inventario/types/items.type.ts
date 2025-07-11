export interface Item {
    articulo_id: number;
    cod_interno: string;
    lote_id: number;
    descripcion: string;
    ubicacion: string;
    sub_ubicacion: string;
    control_vencimiento: number;
    vencimiento: string;
    lote: string;
    cod_barra_articulo: string;
    cod_barra_lote: string;
    cantidad_inicial: number;
    cantidad_final: number;
    cantidad_actual: number;
}


export type ItemTipo = "Todos" | "Marca" | "Seccion" | "Ubicacion" | "Categoria";

export interface GetItemsFilters {
    idInventario: number;
    filtro: number; // 0 Solo items en inv, 1: Solo items a inventariar , 3 todos
    tipo: ItemTipo; 
    valor: number;
    stock: boolean;
    busqueda?: string;
}


export interface ItemInventario {
        idArticulo: number;
        idLote: number;
        lote: string;
        fechaVencimientoItem: Date;
        cantidadInicial: number;
        cantidadFinal: number;
        codigoBarra: string;
}

export interface ItemDTO {
    idInventario: number;
    item: ItemInventario;
}