import { useState, useCallback, useEffect } from 'react';
import { Articulo } from '../types/articulo';
import { buscarArticulos } from '../services/articuloService';

interface UseBuscadorArticulosProps {
  deposito?: number;
  stock?: boolean;
  moneda?: number;
}

export const useBuscadorArticulos = ({ deposito, stock, moneda }: UseBuscadorArticulosProps = {}) => {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (valor: string) => {
    if (valor.length < 2) {
      setResultados([]);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const articulos = await buscarArticulos({
        busqueda: valor,
        deposito,
        stock,
        moneda
      });
      setResultados(articulos);
    } catch (err) {
      setError('Error al buscar artículos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [deposito, stock, moneda]);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar(termino);
    }, 300);

    return () => clearTimeout(timer);
  }, [termino, buscar]);

  return {
    termino,
    setTermino,
    resultados,
    cargando,
    error
  };
}; 