import { api_url } from "@/utils";
import axios from "axios";

export interface PedidosFacturadosProps {
    fechaDesde: string;
    fechaHasta: string;
    articulo?: number;
    vendedor?: number;
    cliente?: number;
    sucursal?: number;
}

export const getPedidosFacturados = async (props: PedidosFacturadosProps) => {
    const { fechaDesde, fechaHasta, articulo, vendedor, cliente, sucursal } = props;

    const response = await axios.get(`${api_url}pedidos/reporte-pedidos-facturados`, {
        params: {
            fechaDesde,
            fechaHasta,
            articulo,
            vendedor,
            cliente,
            sucursal,
        },
    })

    return response.data.body;
}