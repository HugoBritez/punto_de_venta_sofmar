import { api_url } from "@/utils";

import axios from "axios";


export const getArticulosPorCodBarra = async (
  codigo_barra: string,
  deposito: number,
  stock: number,
  moneda: number
) => {
  try {
    const response = await axios.get(`${api_url}articulos/buscar-articulos`, {
      params: {
        codigo_barra,
        deposito,
        stock,
        moneda,
      },
    });
    return response.data.body;
  } catch (error) {
    console.error("Error al obtener los articulos por codigo de barra:", error);
    return error;
  }
};
