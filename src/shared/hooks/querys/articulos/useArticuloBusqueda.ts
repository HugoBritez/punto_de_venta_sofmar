import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { buscarArticuloPorCodigo, buscarArticulos } from "../../../api/articulosApi";

export const useArticuloPorCodigo = (
  codigoBarra: string,
  deposito: number,
  stock: boolean
) => {
  return useQuery({
    queryKey: ['articuloPorCodigo', codigoBarra, deposito, stock],
    queryFn: async () => {
      try {
        const response = await buscarArticuloPorCodigo(codigoBarra, deposito, stock);
        return response;
      } catch (error: any) {
        // Si el error es un status 204, significa que no se encontró el artículo
        // pero no es un error real, así que retornamos null
        if (error?.response?.status === 204) {
          return null;
        }
        // Para otros errores, los propagamos
        throw error;
      }
    },
    enabled: Boolean(codigoBarra.length > 0 && deposito !== undefined && stock !== undefined),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 0,
  })
}


interface BusquedaParams {
  busqueda?: string;
  codigoBarra?: string;
  moneda?: number;
  stock?: boolean;
  deposito?: number;
  marca?: number;
  categoria?: number;
  ubicacion?: number;
  proveedor?: number;
  lote?: string;
  negativo?: boolean;
} 

export const useArticulosBusqueda = (
  params: BusquedaParams,
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
    queryKey: ['articulos-busqueda', finalParams],
    queryFn: () => buscarArticulos(
      undefined, // articuloId
      finalParams.busqueda,
      finalParams.codigoBarra,
      finalParams.moneda,
      finalParams.stock,
      finalParams.deposito,
      finalParams.marca,
      finalParams.categoria,
      finalParams.ubicacion,
      finalParams.proveedor,
      undefined, // codInterno
      finalParams.lote,
      finalParams.negativo
    ),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    // ⚡ Configuraciones importantes para búsqueda
    refetchOnWindowFocus: false, // No refetch al cambiar ventana
    retry: 1, // Solo 1 reintento en búsquedas
  });
};
