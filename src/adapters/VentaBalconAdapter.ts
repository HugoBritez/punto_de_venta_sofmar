import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { Venta } from "@/models/dtos/Ventas/Venta";


export interface ItemParaVenta {
  precio_guaranies: number;
  precio_dolares: number;
  precio_reales: number;
  precio_pesos: number;
  deve_articulo: number;
  articulo: string;
  deve_cantidad: number;
  deve_precio: number;
  deve_descuento: number;
  deve_exentas: number;
  deve_cinco: number;
  deve_diez: number;
  deve_devolucion: number;
  deve_vendedor: number;
  deve_color: number | null;
  deve_bonificacion: number | null;
  deve_talle: string | null;
  deve_codioot: number | null;
  deve_costo: number | null;
  deve_costo_art: number | null;
  deve_cinco_x: number | null;
  deve_diez_x: number | null;
  deve_lote?: string | null;
  loteid?: number | null;
  deve_vencimiento?: string | null;
  cod_barra?: string | null;
  editar_nombre?: number | null;
  precio_original?: number | null;
  ar_unidad_medida?: number | null;
}

interface VentaParaAdaptar {
  ventaId: number | null;
  cliente: number;
  operador: number;
  deposito: number;
  moneda: number;
  fecha: Date;
  factura: string | null;
  credito: number;
  saldo: number;
  vencimiento: Date | null;
  descuento: number;
  total: number;
  cuotas: number;
  cantCuotas: number;
  obs: string;
  vendedor: number;
  sucursal: number;
  timbrado: string | null;
  pedido: number;
  hora: string;
  userpc: string;
  situacion: number;
  chofer: number | null;
  metodo: number;
  ve_cdc: string;
  ve_qr: string;
}

export const AdaptarVenta = (ventaData: VentaParaAdaptar): Venta => {
  return {
    codigo: ventaData.ventaId || 0,
    cliente: ventaData.cliente,
    operador: ventaData.operador,
    deposito: ventaData.deposito,
    moneda: ventaData.moneda,
    fecha: ventaData.fecha,
    factura: ventaData.factura || "",
    credito: ventaData.credito,
    saldo: ventaData.saldo,
    total: ventaData.total,
    vencimiento: ventaData.vencimiento || undefined,
    estado: 1, // Valor por defecto
    devolucion: 0, // Valor por defecto
    procesado: 0, // Valor por defecto
    descuento: ventaData.descuento,
    cuotas: ventaData.cuotas,
    cantCuotas: ventaData.cantCuotas,
    obs: ventaData.obs,
    vendedor: ventaData.vendedor,
    sucursal: ventaData.sucursal,
    metodo: ventaData.metodo,
    aplicarA: 0, // Valor por defecto
    retencion: 0, // Valor por defecto
    timbrado: ventaData.timbrado || "",
    codeudor: 0, // Valor por defecto
    pedido: ventaData.pedido,
    hora: ventaData.hora,
    userPc: ventaData.userpc,
    situacion: ventaData.situacion,
    chofer: ventaData.chofer || 0,
    cdc: ventaData.ve_cdc,
    qr: ventaData.ve_qr,
    kmActual: 0, // Valor por defecto
    vehiculo: 0, // Valor por defecto
    descTrabajo: "", // Valor por defecto
    kilometraje: 0, // Valor por defecto
    servicio: 0, // Valor por defecto
    siniestro: "", // Valor por defecto
    mecanico: 0, // Valor por defecto
    cajaDefinicion: undefined,
    confOperacion: undefined
  };
};


export const AdaptarDetalle = (item: ItemParaVenta): DetalleVenta => {
  return {
    deveVenta: 0, // Este valor se asigna cuando se crea la venta
    deveArticulo: item.deve_articulo,
    deveCantidad: item.deve_cantidad,
    devePrecio: item.deve_precio,
    deveDescuento: item.deve_descuento,
    deveExentas: item.deve_exentas,
    deveCinco: item.deve_cinco,
    deveDiez: item.deve_diez,
    deveDevolucion: item.deve_devolucion,
    deveVendedor: item.deve_vendedor,
    deveColor: item.deve_color?.toString() || "",
    deveBonificacion: item.deve_bonificacion || 0,
    deveTalle: item.deve_talle || "",
    deveCodioot: item.deve_codioot || 0,
    deveCosto: item.deve_costo || 0,
    deveCostoArt: item.deve_costo_art || 0,
    deveCincoX: item.deve_cinco_x || 0,
    deveDiezX: item.deve_diez_x || 0,
    editarNombre: item.editar_nombre || undefined,
    lote: item.deve_lote || "",
    loteId: item.loteid || 0,
    articuloEditado: false, // Valor por defecto
    deveDescripcionEditada: "",
    codigoBarra: item.cod_barra || undefined,
    descripcion: item.articulo,
    precioUnitario: item.precio_original || item.deve_precio,
    subtotal: item.deve_cantidad * item.deve_precio - (item.deve_descuento || 0)
  };
};

