export interface PedidoProveedor {
    pedidoId: number;
    cliente: string;
    clienteRuc: string;
    fecha: string; // ISO string de fecha
    factura: string;
    vendedor: string;
    operador: string;
    total: number;
    condicion: string;
    estado: string;
    estadoNum: number;
    totalItems: number;
    totalImporte: number;
    deposito: string;
    moneda: string;
    area: string;
    siguienteArea: string;
    codigoProveedor: number;
    proveedor: string;
    obs: string;
    cantCuotas: number;
    entrega: number;
    acuerdo: string;
}


export interface PedidoDetalle {
    det_codigo: number;
    art_codigo: number;
    codbarra: string;
    descripcion: string;
    costo: number;
    cantidad: number;
    precio: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez: number;
    codlote: number;
    lote: string;
    ar_editar_desc: boolean;
    bonificacion: number;
    largura: string;
    altura: string;
    mt2: string;
    porcentaje_utilidad: number;
    obs: string;
  }