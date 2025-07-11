import { api_url } from "@/utils";
import  api  from "@/config/axios";
import axios from "axios";

export interface  UltimaVenta {
    codigo: number;
    codcliente: number;
    cliente: string;
    moneda_id: number;
    moneda: string;
    fecha: string;
    codsucursal: number;
    sucursal: string;
    vendedor: string;
    operador: string;
    total: number;
    descuento: number;
    saldo: number;
    condicion: string;
    vencimiento: string;
    factura: string;
    obs: string;
    estado: number;
    estado_desc: string;
    obs_anulacion: string;
    terminal: string;
    exentas_total: number;
    descuento_total: number;
    iva5_total: number;
    iva10_total: number;
    sub_total: number;
    total_articulos: number;
    total_neto: number;
    ve_cdc: string;
    tipo_documento: number;
    cliente_descripcion: string;
    cliente_direccion: string;
    cliente_ciudad: string;
    ciudad_id: number;
    ciudad_descripcion: string;
    distrito_id: number;
    distrito_descripcion: string;
    departamento_id: number;
    departameto_descripcion: string;
    cliente_telefono: string;
    cliente_email: string;
    cliente_codigo_interno: number;
    operador_nombre: string;
    operador_documento: string;
    establecimiento: string;
    punto_emision: string;
    numero_factura: string;
    cliente_ruc: string;
    cant_cuotas: number;
    entrega_inicial: number;
  }

const fechaDesde = new Date();
fechaDesde.setMonth(fechaDesde.getMonth() - 3);
const fechaHasta = new Date();

export const getUltimasVentas = async (cliente?: number, articulo?: number) : Promise<UltimaVenta[]> => {
    console.log("cliente en getUltimasVentas", cliente)
    console.log("articulo en getUltimasVentas", articulo)
    const response = await axios.get(`${api_url}venta/consultas`, {
        params: {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
            cliente,
            articulo
        }
    })
    return response.data.body as UltimaVenta[];
}

export interface FiltrosVentas {
    fechaDesde?: string;
    fechaHasta?: string;
    proveedorSeleccionado?: number;
    articuloSeleccionado?: number;
    cliente?: number;
}


export interface VentasConFiltros {
    codigoVenta: number;
    cliente: string;
    clienteRuc: string;
    fecha: string;
    factura: string;
    vendedor: string;
    operador: string;
    total: number;
    descuento: number;
    saldo: number;
    condicion: string;
    estado: string;
    totalItems: number;
    totalImporte: number;
    montoCobrado: number;
    deposito: string;
    moneda: string;
    sucursal: string;
}

export const getVentasConFiltros = async (filtros: FiltrosVentas): Promise<VentasConFiltros[]> => {
    const params: any = {};
    
    if (filtros.fechaDesde) {
        params.fecha_desde = filtros.fechaDesde;
    }
    if (filtros.fechaHasta) {
        params.fecha_hasta = filtros.fechaHasta;
    }
    if (filtros.proveedorSeleccionado) {
        params.proveedor = filtros.proveedorSeleccionado;
    }
    if (filtros.articuloSeleccionado) {
        params.articulo = filtros.articuloSeleccionado;
    }
    if (filtros.cliente) {
        params.cliente = filtros.cliente;
    }

    const response = await api.get(`ventas/reporte-ventas-proveedor`, { params });

    console.log("response.data.body", response)
    return response.data.body as VentasConFiltros[];
}