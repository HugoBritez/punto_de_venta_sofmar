import { api_url } from "@/utils";
import axios from "axios";
import { Ingreso, IngresoDetalle, FiltrosDTO } from "../types/shared.type";

export const ingresosApi = {
  getIngresos: async (filtros: FiltrosDTO): Promise<Ingreso[]> => {
    try {
      console.log("filtros", filtros);
      const response = await axios.get<Ingreso[]>(`${api_url}control-ingreso/`, {
        params: filtros,
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener los ingresos:", error);
      throw error;
    }
  },

  getDetalleIngreso: async (id_ingreso: number): Promise<IngresoDetalle[]> => {
    try {
      const response = await axios.get<IngresoDetalle[]>(
        `${api_url}control-ingreso/items`,
        {
          params: {
            id_ingreso,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el detalle del ingreso:", error);
      throw error;
    }
  },
};
