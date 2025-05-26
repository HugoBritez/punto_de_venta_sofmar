export interface PresupuestoEntity {
    codigo: number;
    cliente: number;
    operador: number;
    fecha: Date;
    descuento: number;
    estado: number;
    confirmado: number;
    vendedor: number;
    credito: number;
    hora: string;
    observacion: string;
    flete: string;
    plazo: string;
    validez: string;
    condicion: string;
    sucursal: number;
    deposito: number;
}

export interface PresupuestoObservacion {
    observacion: string;
}

export interface DetallePresupuestoEntity {
    codigo: number;
    presupuesto: number;
    articulo: number;
    cantidad: number;
    precio: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez:number;
    porcentaje: number;
    altura: number;
    largura: number;
    mts2: number;
    listaPrecio: number;
    talle: string;
    codigoLote: number;
    lote: string;
    vencimineto: Date;
    descripcionArticulo: string;
    observacion: string;
    procesado: number;
}