import { useQuery } from "@tanstack/react-query";
import { getArticulos } from "../../../api/articulosApi";

export interface ConsultaParams {
  busqueda?: string | null,
  moneda?: number,
  stock?: boolean,
  deposito?: number,
  codigo_barra?: string,
  cod_interno?: string
  tipo_busqueda?: string
} 



export const useGetArticulos = (
  params: ConsultaParams,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};
  
  // Crear una clave única para cada búsqueda
  const queryKey = ['get-articulos', {
    busqueda: params.busqueda || '',
    deposito: params.deposito || null,
    moneda: params.moneda || null,
    stock: params.stock || null,
    codigo_barra: params.codigo_barra || '',
    cod_interno: params.cod_interno || '',
    tipo_busqueda: params.tipo_busqueda || ''
  }];
  
  return useQuery({
    queryKey,
    queryFn: () => getArticulos(
      params.busqueda,
      params.deposito,
      params.stock,
      params.moneda,
      params.codigo_barra,
      params.cod_interno,
      params.tipo_busqueda
    ),
    enabled: enabled,
    staleTime: 0, // Sin cache para búsquedas
    gcTime: 0, // Sin cache para búsquedas
    refetchOnWindowFocus: false,
    retry: 1,
    // Forzar refetch cuando cambian los parámetros
    refetchOnMount: true,
  });
};