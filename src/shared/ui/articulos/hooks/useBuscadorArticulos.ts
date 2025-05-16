import { useState, useCallback, useEffect, useRef } from "react";
import { Articulo } from "../types/articulo.type";
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
  const [resultados, setResultados] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ultimaBusquedaRef = useRef<string>("");
  const isMountedRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const esBusquedaInicialRef = useRef(true);

  const buscar = useCallback(
    async (valor: string) => {
      const terminoLimpio = valor.trim();
      
      if (terminoLimpio === ultimaBusquedaRef.current) {
        return;
      }

      ultimaBusquedaRef.current = terminoLimpio;

      if (!esBusquedaInicialRef.current && terminoLimpio.length < 2) {
        setResultados([]);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        console.log("buscando articulos en el hook", {
          terminoLimpio,
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
        });
        
        const articulos = await buscarArticulos({
          busqueda: terminoLimpio,
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
        });
        
        setResultados(articulos);
      } catch (err) {
        setError("Error al buscar artículos");
        console.error(err);
        setResultados([]);
      } finally {
        setCargando(false);
      }

      esBusquedaInicialRef.current = false;
    },
    [
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
    ]
  );

  // Efecto para la búsqueda inicial
  useEffect(() => {
    // Realizamos la búsqueda inicial con string vacío
    buscar("");
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [buscar, deposito, sucursal]); // Agregamos deposito y sucursal como dependencias

  // Efecto para las búsquedas con debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (termino !== ultimaBusquedaRef.current) {
        buscar(termino);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [termino, buscar]);

  return {
    termino,
    setTermino,
    resultados,
    cargando,
    error,
  };
};
