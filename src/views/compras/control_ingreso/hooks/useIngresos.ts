import { ingresosApi } from "../services/ingresosApi";
import { useState } from "react";
import { Ingreso, FiltrosDTO, IngresoDetalle } from "../types/shared.type";

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [detalleIngreso, setDetalleIngreso] = useState<IngresoDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [ errorDetalle, setErrorDetalle] = useState<string | null>(null);

  const obtenerIngresos = async (filtros: FiltrosDTO) => {
    try {
      setLoading(true);
      const response = await ingresosApi.getIngresos(filtros);
      setIngresos(response);
      setLoading(false);
    } catch (error) {
      setError("Error al obtener los ingresos");
      setLoading(false);
    }
  };

  const obtenerDetalleIngreso = async (id_ingreso: number) => {
    try {
      setLoadingDetalle(true);
      const response = await ingresosApi.getDetalleIngreso(id_ingreso);
      setDetalleIngreso(response);
      setLoadingDetalle(false);
    } catch (error) {
      setErrorDetalle("Error al obtener el detalle del ingreso");
      setLoadingDetalle(false);
    }
  };

  return {
    ingresos,
    detalleIngreso,
    loading,
    error,
    obtenerIngresos,
    obtenerDetalleIngreso,
    loadingDetalle,
    errorDetalle,
  };
};
