import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {  ConsultarArticulo } from "@/repos/articulosApi";


interface ConsultaParams {
  busqueda?: string | null,
  deposito?: string | null,
  stock?: string | null,
  marca?: string | null,
  categoria?: string | null,
  subcategoria?: string | null,
  proveedor?: string | null,
  ubicacion?: string | null,
  servicio?: boolean | null,
  moneda?: number | null,
  unidadMedida?: string | null,
  pagina?: number | null,
  limite?: number | null,
  tipoValorizacionCosto?: string | null,
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
    queryKey: ['articulos-consulta', finalParams],
    queryFn: () => ConsultarArticulo(
      finalParams.busqueda,
      finalParams.deposito,
      finalParams.stock,
      finalParams.marca,
      finalParams.categoria,
      finalParams.subcategoria,
      finalParams.proveedor,
      finalParams.ubicacion,
      finalParams.servicio,
      finalParams.moneda,
      finalParams.unidadMedida,
      finalParams.pagina,
      finalParams.limite,
      finalParams.tipoValorizacionCosto
    ),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    // ⚡ Configuraciones importantes para búsqueda
    refetchOnWindowFocus: false, // No refetch al cambiar ventana
    retry: 1, // Solo 1 reintento en búsquedas
  });
};
