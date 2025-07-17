import api from "@/config/axios";
import { api_url } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface DetalleVenta {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  cantidad: string; // Formateado con FORMAT
  precio: string; // Formateado con FORMAT
  precio_number: number; // Valor numérico sin formato
  descuento: string; // Formateado con FORMAT
  descuento_number: number; // Valor numérico sin formato
  exentas: string; // Formateado con FORMAT
  exentas_number: number; // Valor numérico sin formato
  cinco: string; // Formateado con FORMAT
  cinco_number: number; // Valor numérico sin formato
  diez: string; // Formateado con FORMAT
  diez_number: number; // Valor numérico sin formato
  lote: string | null;
  vencimiento: string | null; // Formato YYYY-MM-DD
  largura: number | null;
  altura: number | null;
  mt2: number | null;
  descripcion_editada: string;
  kilos: number | null;
  unidad_medida: string | null;
}

export const getDetallesVentas = async (cod: number): Promise<DetalleVenta[]> => {
    const response = await axios.get(`${api_url}venta/detalles/`, {
        params: {
            cod: cod
        }
    });

    console.log(response.data.body);
    return response.data.body;
}


export const getDetalleVentasProveedor = async (proveedor: number, venta_id: number): Promise<DetalleVenta[]> => {
    const response = await api.get('ventas/detalle-proveedor', {
        params: {
            proveedor,
            venta_id
        }
    })

    return response.data.body;
}

export const useGetDetallesVentas = (id: number | null) => {
    return useQuery({
        queryKey: ['detalles-ventas', id],
        queryFn: () => getDetallesVentas(id!),
        enabled: !!id, // Solo ejecutar cuando id no sea null
    });
};

export const useGetDetalleVentasProveedor = (proveedor: number, venta_id: number) => {
    return useQuery({
        queryKey: ['detalle-ventas-proveedor', proveedor, venta_id],
        queryFn: () => getDetalleVentasProveedor(proveedor, venta_id),
        enabled: !!proveedor && !!venta_id,
    });
};