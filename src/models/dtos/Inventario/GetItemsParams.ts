export interface GetItemsParams {
    idInventario: number;
    filtro: number;
    tipo: number;
    valor: number;
    stock: boolean;
    busqueda?: string;
}