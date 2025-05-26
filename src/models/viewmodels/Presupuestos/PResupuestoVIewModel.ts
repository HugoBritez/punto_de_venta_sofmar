export interface PresupuestoViewModel {
    codigo: number;
    codcliente: number;
    cliente: string;
    moneda: string;
    fecha: string;
    codsucursal: number;
    sucursal: string;
    vendedor: string;
    operador: string;
    total: string;
    descuento: number;
    saldo: number;
    condicion: string;
    vencimiento: string;
    factura: string;
    obs: string;
    estado: number;
    estado_desc: string;
    pre_condicion: string;
    pre_plazo: string;
    pre_flete: string;
}