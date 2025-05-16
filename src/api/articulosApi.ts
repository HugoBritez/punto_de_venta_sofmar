import axios from "axios";
import { api_url } from "@/utils";

export interface ArticuloLote {
    id_articulo: number;
  codigo_barra: string;
  descripcion: string;
  stock: number;
  lotes: [
    {
      id: number;
      lote: string;
      cantidad: number;
      vencimiento: string;
    }
  ];
  depositos: [
    {
      codigo: number;
      descripcion: string;
      stock: number;
    }
  ];
  precio_costo: number;
  precio_venta: number;
  precio_credito: number;
  precio_mostrador: number;
  precio_4: number;
  ubicacion: string;
  sub_ubicacion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  proveedor_razon: string;
  fecha_ultima_compra: string;
  fecha_ultima_venta: string;
}

export interface ArticuloBusqueda {
  idLote: number;
  lote: string;
  idArticulo: number;
  codigoBarra: string;
  descripcion: string;
  stockNegativo: number;
  precioCosto: number;
  precioVentaGuaranies: number;
  precioCredito: number;
  precioMostrador: number;
  precio4: number;
  precioCostoDolar: number;
  precioVentaDolar: number;
  precioCostoPesos: number;
  precioVentaPesos: number;
  precioCostoReal: number;
  precioVentaReal: number;
  vencimientoLote: string;
  cantidadLote: number;
  deposito: number;
  ubicacion: string;
  subUbicacion: string;
  marca: string;
  subcategoria: string;
  categoria: string;
  iva: number;
  vencimientoValidacion: number;
  ivaDescripcion: string;
  editarNombre: number;
  estadoVencimiento: string;
  proveedor: string;
  fechaUltimaVenta: string;
  preCompra: number;
}

export const buscarArticulos = async (
    articuloId?: number,
    busqueda?: string,
    codigoBarra?: string,
    moneda?: number,
    stock?: boolean,
    deposito?: number,
    marca?: number,
    categoria?: number,
    ubicacion?: number,
    proveedor?: number,
    codInterno?: number,
    lote?: string,
    negativo?: boolean,
): Promise<ArticuloBusqueda[]> => {
    const response = await axios.get(`${api_url}articulos/buscar-articulos`, {
        params: {
            articuloId,
            busqueda,
            codigoBarra,
            moneda,
            stock,
            deposito,
            marca,
            categoria,
            ubicacion,
            proveedor,
            codInterno,
            lote,
            negativo
        }
    })
    return response.data
}


export const getArticulos = async (
    busqueda?: string | null,
    moneda?: number,
    stock?: boolean,
    deposito?: number
): Promise<ArticuloLote[]> => {
    const response = await axios.get(`${api_url}articulo/`, {
        params: {
            busqueda,
            moneda,
            stock,
            deposito,
        }
    })

    console.log('respuesta en el api' ,response.data)
    return response.data
}