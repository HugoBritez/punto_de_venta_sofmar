// hooks/useFacturaSend.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { api_url } from "@/utils";
import {
  DatosFacturaElectronica,
  FacturaSendResponse,
} from "@/shared/types/factura_electronica/types";

export const useFacturaSend = () => {
  const [parametros, setParametros] = useState<DatosFacturaElectronica | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState<any>(null);

  useEffect(() => {
    obtenerParametros();
  }, []);

  const obtenerParametros = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${api_url}facturacion-electronica`);
      const datos = Array.isArray(response.data)
        ? response.data[0]
        : response.data.body
        ? response.data.body[0]
        : response.data;
      setParametros(datos);
      return datos;
    } catch (error: any) {
      const mensajeError = "Error al obtener parámetros de FacturaSend";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar facturas por lote (método para producción)
  const enviarFacturas = async (
    datosFacturas: FacturaSendResponse | FacturaSendResponse[]
  ) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = parametros.parametros[0].api_url_crear; // URL para lotes
      const apiKey = parametros.parametros[0].api_key;

      // Formato confirmado del token de autorización
      const authHeader = `Bearer api_key_${apiKey}`;

      // Asegurarse de que los datos estén en formato de array para el endpoint de lote ya que en produccion es requisito, igual si es un solo objeto
      const datosAEnviar = Array.isArray(datosFacturas)
        ? datosFacturas
        : [datosFacturas];

      console.log("Enviando lote a:", apiUrl);
      console.log("Datos a enviar:", datosAEnviar);

      const response = await axios.post(apiUrl, datosAEnviar, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      setRespuesta(response.data);
      return response.data;
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al enviar facturas";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const inutilizarFactura = async (datosInutilizacion: {
    tipoDocumento: number;
    establecimiento: string;
    punto: string;
    desde: number;
    hasta: number;
    motivo: string;
  }) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = parametros.parametros[0].api_url_inutilizar;
      const apiKey = parametros.parametros[0].api_key;

      // Formato confirmado del token de autorización
      const authHeader = `Bearer api_key_${apiKey}`;

      const response = await axios.post(apiUrl, datosInutilizacion, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      setRespuesta(response.data);
      return response.data;
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al cancelar factura";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }

  }

  // Cancelar una factura
  const cancelarFactura = async (datosCancelacion: {
    cdc: string;
    motivo: string;
  }) => {
    if (
      !parametros ||
      !parametros.parametros ||
      parametros.parametros.length === 0
    ) {
      const mensajeError = "No se han cargado los parámetros de FacturaSend";
      setError(mensajeError);
      throw new Error(mensajeError);
    }

    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = parametros.parametros[0].api_url_cancelar;
      const apiKey = parametros.parametros[0].api_key;

      // Formato confirmado del token de autorización
      const authHeader = `Bearer api_key_${apiKey}`;

      const response = await axios.post(apiUrl, datosCancelacion, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      setRespuesta(response.data);
      return response.data;
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al cancelar factura";
      console.error(mensajeError, error);
      setError(mensajeError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para calcular el total de una factura
  const calcularTotalFactura = (factura: FacturaSendResponse): number => {
    if (!factura.items || factura.items.length === 0) return 0;

    return factura.items.reduce((total, item) => {
      const subtotal = item.cantidad * item.precioUnitario;
      return total + subtotal;
    }, 0);
  };


  return {
    parametros,
    isLoading,
    error,
    respuesta,
    obtenerParametros,
    enviarFacturas, 
    cancelarFactura,
    calcularTotalFactura,
    inutilizarFactura,
  };
};
