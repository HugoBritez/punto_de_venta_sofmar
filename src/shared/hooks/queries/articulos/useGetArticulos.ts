import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {  getArticulos } from "@/repos/articulosApi";


interface ConsultaParams {
  busqueda?: string | null,
  moneda?: number,
  stock?: boolean,
  deposito?: number
} 

export const useArticulosBusqueda = (
  params: ConsultaParams,
  options?: {
    debounceMs?: number;
    minLength?: number;
    enabled?: boolean;
  }
) => {
  const { debounceMs = 300, minLength = 2, enabled = true } = options || {};
  
  // Debounce solo del término de búsqueda
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(params.busqueda);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(params.busqueda);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [params.busqueda, debounceMs]);
  
  // Parámetros finales con búsqueda debounced
  const finalParams = useMemo(() => ({
    ...params,
    busqueda: debouncedBusqueda
  }), [params, debouncedBusqueda]);
  
  // Condiciones para ejecutar la query
  const shouldSearch = Boolean(
    enabled &&
    typeof debouncedBusqueda === "string" &&
    debouncedBusqueda.length >= minLength
  );
  
  return useQuery({
    queryKey: ['get-articulos', finalParams],
    queryFn: () => getArticulos(
      finalParams.busqueda,
      finalParams.deposito,
      finalParams.stock,
      finalParams.moneda
    ),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    // ⚡ Configuraciones importantes para búsqueda
    refetchOnWindowFocus: false, // No refetch al cambiar ventana
    retry: 1, // Solo 1 reintento en búsquedas
  });
};
