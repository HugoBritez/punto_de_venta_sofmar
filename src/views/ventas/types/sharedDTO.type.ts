export interface VentaDTO {
    ve_codigo: number;
    ve_fecha: string;
    ve_operador: number;
    ve_deposito: number;
    ve_moneda: number;
    ve_factura: string;
    ve_credito: number;
    ve_saldo: number;
    ve_total: number;
    ve_devolucion: number;
    ve_procesado: number;
    ve_descuento: number;
    ve_cuotas: number;
    ve_cantCuotas: number;
    ve_obs: string;
    ve_vendedor: number;
    ve_sucursal: number;
    ve_metodo: number;
    ve_aplicar_a: number;
    ve_retencion: number;
    ve_timbrado: string;
    ve_codeudor: number;
    ve_pedido: number;
    ve_hora: string;
    ve_userpc: string;
    ve_situacion: number;
    ve_chofer: number;
    ve_cdc: string;
    ve_qr: string;
    ve_km_actual: number;
    ve_vehiculo: number;
    ve_desc_trabajo: string;
    ve_kilometraje: number;
    ve_mecanico: number;
    ve_servicio: number;
    ve_siniestro: number;
}

export interface DetalleVentaDTO {
    deve_venta: number;
    deve_articulo: number;
    deve_cantidad: number;
    deve_precio: number;
    deve_descuento: number;
    deve_exentas: number;
    deve_cinco: number;
    deve_diez: number;
    deve_devolucion: number;
    deve_vendedor: number;
    deve_color: string;
    deve_bonificacion: number;
    deve_talle: string;
    deve_codioot: number;
    deve_costo: number;
    deve_costo_art: number;
    deve_cinco_x: number;
    deve_diez_x: number; 
    lote: string;
    lote_id: number;
    articulo_editado: boolean;
    deve_descripcion_editada: string;
}

export interface DetalleVentaTabla extends DetalleVentaDTO {
    cod_barras: string;
    descripcion: string;
    precioUnitario: number;
    subtotal: number;
}