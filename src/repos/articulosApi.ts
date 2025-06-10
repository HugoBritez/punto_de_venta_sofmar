import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";
import { ArticuloLote } from "@/models/viewmodels/articuloConsulta";
import { ResponseViewModel } from "@/models/base/responseViewModel";

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
  const response = await axios.get(`${api_url}articulo/buscar`, {
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
  return response.data.body;
}


export const getArticulos = async (
  busqueda?: string | null,
  moneda?: number,
  stock?: boolean,
  deposito?: number
): Promise<ResponseViewModel<ArticuloLote[]>> => {
  const response = await axios.get(`${api_url}articulo/`, {
    params: {
      busqueda,
      moneda,
      stock,
      deposito,
    }
  })

  console.log('respuesta en el api', response.data)
  return response.data
}


export const ConsultarArticulo = async (
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
): Promise<ResponseViewModel<ArticuloLote[]>> => {
  const response = await axios.get(`${api_url}articulo/consultar`, {
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
  })
  return response.data;
}