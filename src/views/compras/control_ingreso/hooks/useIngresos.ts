import { ingresosApi } from "../services/ingresosApi";
import { useState } from "react";
import { Ingreso, FiltrosDTO, IngresoDetalle, ReporteIngresos } from "../types/shared.type";

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [detalleIngreso, setDetalleIngreso] = useState<IngresoDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [ errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [reporteIngresos, setReporteIngresos] = useState<ReporteIngresos[]>([]);

  const obtenerIngresos = async (filtros?: FiltrosDTO) => {
    try {
      setLoading(true);
      const response = await ingresosApi.getIngresos(filtros);
      setIngresos(response.body);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setError("Error al obtener los ingresos");
      setLoading(false);
    }
  };

  const obtenerDetalleIngreso = async (id_ingreso: number) => {
    try {
      console.log('id_ingreso en hook', id_ingreso);
      setLoadingDetalle(true);
      const response = await ingresosApi.getDetalleIngreso(id_ingreso);
      setDetalleIngreso(response.body);
      setLoadingDetalle(false);
      console.log('detalleIngreso en hook', response.body);
      return response.body;
    } catch (error) {
      setErrorDetalle("Error al obtener el detalle del ingreso");
      setLoadingDetalle(false);
    }
  };

  
  const generarReporteIngresos =  async (filtros: FiltrosDTO) =>{
    try{
      setLoading(true);
      const response = await ingresosApi.generarReporteIngresos(filtros);
      setReporteIngresos(response.body);
      setLoading(false);
      return response.body; 
    }catch(error){
      setError("Error al generar el reporte de ingresos");
      setLoading(false);  
    }
  }


  return {
    ingresos,
    detalleIngreso,
    loading,
    error,
    obtenerIngresos,
    obtenerDetalleIngreso,
    loadingDetalle,
    errorDetalle,
    generarReporteIngresos,
    reporteIngresos,
  };
};
