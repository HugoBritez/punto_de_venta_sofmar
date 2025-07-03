import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscarArticulos } from "../services/articulosService";

interface UseBuscadorArticulosProps {
  deposito?: number;
  stock?: boolean;
  moneda?: number;
  sucursal?: number;
  categoria?: number;
  marca?: number;
  ubicacion?: number;
  proveedor?: number;
  cod_interno?: number;
  lote?: number;
  negativo?: boolean;
}

export const useBuscadorArticulos = ({
  deposito,
  stock,
  moneda,
  sucursal,
  categoria,
  marca,
  ubicacion,
  proveedor,
  cod_interno,
  lote,
  negativo
}: UseBuscadorArticulosProps = {}) => {
  const [termino, setTermino] = useState("");

  // Memoizamos los parámetros de búsqueda para evitar re-renders innecesarios
  const searchParams = useMemo(() => ({
    busqueda: termino.trim(),
    deposito,
    stock,
    moneda,
    sucursal,
    categoria,
    marca,
    ubicacion,
    proveedor,
    cod_interno,
    lote,
    negativo
  }), [
    termino,
    deposito,
    stock,
    moneda,
    sucursal,
    categoria,
    marca,
    ubicacion,
    proveedor,
    cod_interno,
    lote,
    negativo
  ]);

  const queryKey = useMemo(() => 
    ['articulosBusqueda', 'busqueda', searchParams], 
    [searchParams]
  );

  // Hook de TanStack Query
  const {
    data: resultados = [],
    isLoading: cargando,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      return await buscarArticulos(searchParams);
    },
    enabled: true, // Siempre habilitado para búsquedas iniciales
    staleTime: 0, // sin cache 
    gcTime: 10 * 60 * 1000, // 10 minutos en garbage collector
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Función para búsqueda manual (opcional)
  const buscar = useCallback(async (valor: string) => {
    setTermino(valor);
  }, []);

  // Función para limpiar búsqueda
  const limpiarBusqueda = useCallback(() => {
    setTermino("");
  }, []);

  return {
    termino,
    setTermino,
    resultados,
    cargando,
    error: error ? "Error al buscar artículos" : null,
    buscar,
    limpiarBusqueda,
    refetch,
    // Información adicional útil
    isError: !!error,
    isSuccess: !cargando && !error,
  };
};
