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
}