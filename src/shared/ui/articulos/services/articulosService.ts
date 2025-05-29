import { Articulo } from "../types/articulo.type";
import axios from "axios";
import { api_url } from "@/utils";
import { BusquedaDTO } from "../types/busquedaDTO.type";

export const buscarArticulos = async ({
  busqueda,
  id_articulo,
  codigo_barra,
  deposito,
  stock,
  moneda,
  marca,
  categoria,
  ubicacion,
  proveedor,
  cod_interno,
  lote,
  negativo
}: BusquedaDTO): Promise<Articulo[]> => {
  try {
    console.log("enviando datos en servicio", {
      id_articulo,
      codigo_barra,
      busqueda,
      deposito,
      stock,
      moneda,
      marca,
      categoria,
      ubicacion,
      proveedor,
      cod_interno,
      lote,
      negativo
    });
    const response = await axios.get(`${api_url}articulo/buscar`, {
      params: {
        articulo_id: id_articulo,
        codigo_barra: codigo_barra,
        busqueda: busqueda,
        deposito: deposito,
        stock: stock,
        moneda: moneda,
        marca: marca,
        categoria: categoria,
        ubicacion: ubicacion,
        proveedor: proveedor,
        cod_interno: cod_interno,
        lote: lote,
        negativo: negativo
      },
    });
    console.log('articulos en el response', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error al buscar artículos:", error);
    throw error;
  }
};
