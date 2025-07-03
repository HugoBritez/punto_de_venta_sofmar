import axios from "axios";
import api from "../../config/axios";
import { api_url } from "../consts/expres_api_url";
import type { GetReporteMovimientoArticulosParams, ReporteMovimientoArticulos } from "../types/reportes";
import type { ActualizarMetaAcordadaDTO, DetalleVenta, DetalleVentaViewModel, GetVentaParams, Venta, VentaViewModel } from "../types/venta";

interface CrearVentaDTO {
    venta: Venta;
    detalleVenta: DetalleVenta[];
}

export const VentasRepository = {

    async GetVentas(params: GetVentaParams): Promise<VentaViewModel[]> {
        const response = await api.get(`ventas`, { params });
        return response.data.body;
    },

    async CrearVenta(venta: Venta, detalleVenta: DetalleVenta[]): Promise<VentaViewModel> {
        console.log('venta', venta);
        console.log('detalleVenta', detalleVenta);
        const response = await api.post(`ventas`, {
            venta,
            detalleVenta
        } as CrearVentaDTO);
        return response.data.body;
    },

    async GetDetalleVenta(ventaId: number): Promise<DetalleVentaViewModel[]> {
        const response = await api.get(`ventas/detalles`, { params: { ventaId } });
        return response.data.body;
    },

    async GetReporteMovimientoArticulos(params: GetReporteMovimientoArticulosParams): Promise<ReporteMovimientoArticulos> {
        const response = await api.get(`ventas/reporte-movimiento-productos`, { params });
        return response.data.body;
    },

    async ActualizarMetaAcordada(data: ActualizarMetaAcordadaDTO): Promise<void> {
        const response = await api.post(`ventas/metas`, data);
        return response.data.body;
    },

    async GetUltimaVentaId(): Promise<number> {
        const response = await axios.get(`${api_url}venta/idUltimaVenta`);
        return response.data.body[0].id;
    }
}