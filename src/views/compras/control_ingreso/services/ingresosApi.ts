import { api_url } from "@/utils";
import axios from "axios";
import { Ingreso, IngresoDetalle, FiltrosDTO, ReporteIngresos } from "../types/shared.type";

interface IngresosResponse {
  body: Ingreso[];
  error: boolean;
  status: number;
}

interface DetallesResponse {
  body: IngresoDetalle[];
  error: boolean;
  status: number;
}

interface ReporteIngresosResponse {
  body: ReporteIngresos[];
  error: boolean;
  status: number;
}

export const ingresosApi = {
  getIngresos: async (filtros?: FiltrosDTO): Promise<IngresosResponse> => {
    try {
      const response = await axios.get<IngresosResponse>(
        `${api_url}control-ingreso/`,
        {
          params: filtros,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener los ingresos:", error);
      throw error;
    }
  },

  getDetalleIngreso: async (id_ingreso: number): Promise<DetallesResponse> => {
    try {
      console.log("id_ingreso en api_service", id_ingreso);
      const response = await axios.get<DetallesResponse>(
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


  generarReporteIngresos : async (filtros: FiltrosDTO): Promise<ReporteIngresosResponse> => {
    try{
      const response = await axios.get(`${api_url}control-ingreso/reporte-ingresos`, {
        params: filtros
      })
      return response.data;
    }catch(error){
      console.error("Error al generar el reporte de ingresos:", error);
      throw error;
    }
  }
};
