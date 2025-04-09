import { ingresosApi } from "../services/ingresosApi";
import { useState } from "react";
import {
  VerificacionCompraDTO,
  VerificacionItemDTO,
  ConfirmarVerificacionDTO,
} from "../types/shared.type";

export const useVerificarIngresos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verificarCompra = async (
    verificacionCompraDTO: VerificacionCompraDTO
  ) => {
    if (!verificacionCompraDTO.id_compra) {
      setError("El id de la compra es requerido");
      return;
    }
    try {
      setLoading(true);
      const response = await ingresosApi.verificarCompra(verificacionCompraDTO);
      setLoading(false);
      return response;
    } catch (error) {
      setError("Error al verificar la compra");
      setLoading(false);
    }      
  };

  const verificarItem = async (verificacionItemDTO: VerificacionItemDTO) => {
    if (!verificacionItemDTO.id_detalle || !verificacionItemDTO.cantidad) {
      setError("El id del detalle y la cantidad son requeridos");
      return;
    }
    try {
      setLoading(true);
      const response = await ingresosApi.verificarItem(verificacionItemDTO);
      setLoading(false);
      return response;
    } catch (error) {
      setError("Error al verificar el item");
      setLoading(false);
    }
  };

  const confirmarVerificacion = async (
    confirmarVerificacionDTO: ConfirmarVerificacionDTO
  ) => {

    console.log('confirmarVerificacionDTO', confirmarVerificacionDTO);
    console.log('confirmarVerificacionDTO.items', confirmarVerificacionDTO.items);
    
    if (!confirmarVerificacionDTO.id_compra || !confirmarVerificacionDTO.deposito_transitorio || !confirmarVerificacionDTO.deposito_destino || !confirmarVerificacionDTO.factura_compra || !confirmarVerificacionDTO.user_id || confirmarVerificacionDTO.items.length === 0) {
      setError("Todos los campos son requeridos");
      return;
    }
    if (confirmarVerificacionDTO.items.some((item) => item.cantidad_ingreso <= 0 || item.cantidad_factura <= 0 || item.id_articulo <= 0)) {
      setError("Todos los campos son requeridos");
      return;
    }
    try {
      setLoading(true);
      await ingresosApi.confirmarVerificacion(confirmarVerificacionDTO);
      setLoading(false);
    } catch (error) {
      setError("Error al confirmar la verificacion");
      setLoading(false);
    }
  };


  return {
    verificarCompra,
    verificarItem,
    confirmarVerificacion,
    loading,
    error,
  };
};
