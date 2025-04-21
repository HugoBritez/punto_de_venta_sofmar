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
  cod_interno
}: BusquedaDTO): Promise<Articulo[]> => {
  try {
    const response = await axios.get(`${api_url}articulos/consulta-articulos`, {
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
        cod_interno: cod_interno
      },
    });
    console.log(response.data);
    return response.data.body;
  } catch (error) {
    console.error("Error al buscar artículos:", error);
    throw error;
  }
};
