export interface GetControlIngresoParams {
    deposito?: number;
    proveedor?: number;
    fechadesde?: Date;
    fechahasta?: Date;
    factura? : string;
    verificado?: number;
}