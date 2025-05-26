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