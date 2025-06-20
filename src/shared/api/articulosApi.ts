import api from '../../config/axios';
import type { ArticuloBusqueda, ArticuloLote } from "../types/articulos";

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

export const getArticulos = async (
  busqueda?: string | null,
  moneda?: number,
  stock?: boolean,
  deposito?: number,
  codigo_barra?: string,
  cod_interno?: string
): Promise<ArticuloLote[]> => {
  try {
    const response = await api.get('articulo', {
      params: {
        codigo_barra,
        cod_interno,
        busqueda,
        moneda,
        stock,
        deposito,
      }
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