import { ingresosApi } from "../services/ingresosApi";
import { useState } from "react";
import { FiltrosDTO, ReporteIngresos } from "../types/shared.type";

export const useIngresos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporteIngresos, setReporteIngresos] = useState<ReporteIngresos[]>([]);


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
    loading,
    error,
    generarReporteIngresos,
    reporteIngresos,
  };
};
