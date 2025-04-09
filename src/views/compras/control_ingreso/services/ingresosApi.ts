import { api_url } from "@/utils";
import axios from "axios";
import { Ingreso, IngresoDetalle, FiltrosDTO, VerificacionCompraDTO, VerificacionItemDTO, ConfirmarVerificacionDTO, ReporteIngresos } from "../types/shared.type";

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

  verificarCompra: async (verificacionCompraDTO: VerificacionCompraDTO) => {
    const user_id = sessionStorage.getItem("user_id");
    try {
      const response = await axios.post(`${api_url}control-ingreso/verificar`, {
        id_compra: verificacionCompraDTO.id_compra,
        user_id: user_id,
      });
      return response.data;
    } catch (error) {
      console.error("Error al verificar la compra:", error);
      throw error;
    }
  },

  verificarItem: async (verificacionItemDTO: VerificacionItemDTO) =>{
    try{
      const response = await axios.post(`${api_url}control-ingreso/verificar-item`, {
        id_detalle: verificacionItemDTO.id_detalle,
        cantidad: verificacionItemDTO.cantidad,
      })
      return response.data;
    }catch(error){
      console.error("Error al verificar el item:", error);
      throw error;
    }
  },

  confirmarVerificacion: async (confirmarVerificacionDTO: ConfirmarVerificacionDTO) => {
    try{
      const response = await axios.post(`${api_url}control-ingreso/confirmar`, {
        id_compra: confirmarVerificacionDTO.id_compra,
        deposito_transitorio: confirmarVerificacionDTO.deposito_transitorio,
        deposito_destino: confirmarVerificacionDTO.deposito_destino,
        factura_compra: confirmarVerificacionDTO.factura_compra,
        user_id: confirmarVerificacionDTO.user_id,
        operador_id: confirmarVerificacionDTO.operador_id,
        items: confirmarVerificacionDTO.items,
      })
      return response.data;
    }catch(error){
      console.error("Error al confirmar la verificacion:", error);
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
