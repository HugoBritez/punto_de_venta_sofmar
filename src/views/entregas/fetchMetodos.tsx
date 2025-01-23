import { api_url } from "@/utils";
import axios from "axios";

const fetchSucursales = async () => {
    const response = await axios.get(`${api_url}sucursales/listar`);
    return response.data.body;
}

const fetchCamiones = async () => {
    const response = await axios.get(`${api_url}reparto/camiones`);
    return response.data.body;
}

const fetchChoferes = async () => {
    const response = await axios.get(`${api_url}reparto/choferes`);
    return response.data.body;
}

const fetchMonedas = async () => {
    const response = await axios.get(`${api_url}monedas/`);
    return response.data.body;
}

const fetchVentas = async (fecha_desde: string, fecha_hasta: string, cliente: number | null = null) => {
    const response = await axios.get(`${api_url}reparto/fetch-ventas`, {
        params: {
            fecha_desde,
            fecha_hasta,
            cliente
        }
    });
    return response.data.body;
}

const fetchDetalleVentas = async (id: number) => {
    const response = await axios.get(`${api_url}reparto/detalle-ventas`, {
        params: {
            id
        }
    });
    return response.data.body;
}

const fetchDetallePedidos = async (id: number) => {
    const response = await axios.get(`${api_url}reparto/detalle-pedidos`, {
        params: {
            id
        }
    });
    return response.data.body;
}

const fetchPedidos = async (fecha_desde: string, fecha_hasta: string, cliente: number | null = null) => {
    const response = await axios.get(`${api_url}reparto/fetch-pedidos`, {
        params: {
            fecha_desde,
            fecha_hasta,
            cliente
        }
    });
    return response.data.body;
}

const fetchClientes = async (busqueda: string = '') => {
    const response = await axios.get(`${api_url}clientes/`, {
        params: {
            buscar: busqueda
        }
    });
    return response.data.body;
}


const fetchProveedores = async () => {
    const response = await axios.get(`${api_url}proveedores/`);
    return response.data.body;
}

export { fetchSucursales, fetchCamiones, fetchChoferes, fetchMonedas, fetchPedidos, fetchVentas, fetchDetallePedidos, fetchDetalleVentas, fetchClientes, fetchProveedores };