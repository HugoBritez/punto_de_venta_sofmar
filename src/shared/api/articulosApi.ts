import axios from 'axios';
import api from '../../config/axios';
import type { ArticuloBusqueda, ArticuloLote } from "../types/articulos";
import { api_url } from '@/utils';

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
  try {
    const response = await api.get('articulo/buscar', {
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
    });
    return response.data.body;
  } catch (error) {
    console.error('Error al buscar artículos:', error);
    throw error;
  }
};

export interface ArticulosSimple {
  id_articulo: number;
  cod_interno: string;
  codigo_barra: string;
  codigo_barra_lote: string;
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
  talle: string;
  color: string;
}

export const getArticulos = async (
  busqueda?: string | null,
  moneda?: number,
  stock?: boolean,
  deposito?: number,
  codigo_barra?: string,
  cod_interno?: string,
  tipo_busqueda?: string
): Promise<ArticulosSimple[]> => {
  try {
    // Preparar parámetros según el tipo de búsqueda
    const params: any = {
      codigo_barra,
      cod_interno,
      busqueda,
      moneda,
      stock,
      deposito
    };

    // Añadir parámetros específicos según el tipo de búsqueda
    if (tipo_busqueda === "marca" && busqueda) {
      params.marca = true;
    } else if (tipo_busqueda === "categoria" && busqueda) {
      params.categoria = true;
    } else if (tipo_busqueda === "ubicacion" && busqueda) {
      params.ubicacion = true;
    } else if (tipo_busqueda === "proveedor" && busqueda) {
      params.proveedor = true;
    }

    const response = await axios.get(`${api_url}articulos/consulta-articulos`, {
      params
    });
    console.log(response.data.body);
    return response.data.body;
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    throw error;
  }
};

export const consultarArticulo = async (
  busqueda?: string | null,
  deposito?: string | null,
  stock?: string | null,
  marca?: string | null,
  categoria?: string | null,
  subcategoria?: string | null,
  proveedor?: string | null,
  ubicacion?: string | null,
  servicio?: boolean | null,
  moneda?: number | null,
  unidadMedida?: string | null,
  pagina?: number | null,
  limite?: number | null,
  tipoValorizacionCosto?: string | null,
): Promise<ArticuloLote[]> => {
  try {
    const response = await api.get('articulo/consultar', {
      params: {
        busqueda,
        deposito,
        stock,
        marca,
        categoria,
        subcategoria,
        proveedor,
        ubicacion,
        servicio,
        moneda,
        unidadMedida,
        pagina,
        limite,
        tipoValorizacionCosto
      }
    });
    return response.data.body;
  } catch (error) {
    console.error('Error al consultar artículo:', error);
    throw error;
  }
};