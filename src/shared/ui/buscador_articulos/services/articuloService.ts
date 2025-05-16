import { Articulo } from '../types/articulo';
import axios from 'axios';
import { api_url } from '@/utils';

interface BuscarArticulosParams {
  busqueda: string;
  id_articulo?: string | null;
  codigo_barra?: string | null;
  deposito?: number;
  stock?: boolean;
  moneda?: number;
}

export const buscarArticulos = async ({
  busqueda,
  id_articulo,
  codigo_barra,
  deposito,
  stock,
  moneda
}: BuscarArticulosParams): Promise<Articulo[]> => {
  try {
    const response = await axios.get(`${api_url}articulos/consulta-articulos`, {
      params: {
        articulo_id: id_articulo,
        codigo_barra: codigo_barra,
        busqueda: busqueda,
        deposito: deposito,
        stock: stock,
        moneda: moneda
      }
    });
    console.log(response.data);
    return response.data.body;
  } catch (error) {
    console.error('Error al buscar artículos:', error);
    throw error;
  }
}; 