import api from "../../config/axios";

export interface PedidosFacturadosProps {
    fechaDesde: string;
    fechaHasta: string;
    articulo?: number;
    vendedor?: number;
    cliente?: number;
    sucursal?: number;
}

export interface PedidosFacturadosViewModel {
    nroPedido: number;
    vendedor: string;
    codCliente: string;
    nombreCliente: string;
    codProducto: string;
    producto: string;
    marca: string;
    cantidadPedido: number;
    cantidadFacturada: number;
    cantidadFaltante: number;
    totalPedido: number;
    totalVenta: number;
    diferenciaTotal: number;
    fechaPedido: string;
}

export const getPedidosFacturados = async (props: PedidosFacturadosProps): Promise<PedidosFacturadosViewModel[]> => {
    const { fechaDesde, fechaHasta, articulo, vendedor, cliente, sucursal } = props;

    const response = await api.get(`pedidos/reporte-pedidos-facturados`, {
        params: {
            fechaDesde,
            fechaHasta,
            articulo,
            vendedor,
            cliente,
            sucursal,
        },
    })

    console.log("RESPONSE:", response.data.body)    

    return response.data.body;
}