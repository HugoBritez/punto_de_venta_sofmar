import axios from "axios";
import { api_url } from "@/utils";
import { Vendedor } from "../types/vendedor.type";

export const getVendedores = async (busqueda: string): Promise<Vendedor[]> => {
  try {
    const response = await axios.get(`${api_url}/operadores/vendedores`, {
      params: {
        busqueda,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
    throw error;
  }
};
