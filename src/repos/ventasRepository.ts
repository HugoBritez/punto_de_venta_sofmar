import { Venta } from "@/models/dtos/Ventas/Venta";
import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { DetalleVentaViewModel } from "@/models/viewmodels/Ventas/DetalleVentaViewModel";
import { VentaViewModel } from "@/models/viewmodels/Ventas/VentaViewModel";
import { api_url } from "@/utils";
import axios from "axios";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { GetVentaParams } from "@/models/dtos/Ventas/GetVentaParams";

interface CrearVentaDTO {
    venta: Venta;
    detalleVenta: DetalleVenta[];
}

export const VentasRepository = {

    async GetVentas(params: GetVentaParams): Promise<ResponseViewModel<VentaViewModel[]>> {
        const response = await axios.get(`${api_url}/ventas`, { params });
        return response.data;
    },

    async CrearVenta(venta: Venta, detalleVenta: DetalleVenta[]): Promise<ResponseViewModel<VentaViewModel>> {
        const response = await axios.post(`${api_url}/ventas`, {
            venta,
            detalleVenta
        } as CrearVentaDTO);
        return response.data;
    },

    async GetDetalleVenta(ventaId: number): Promise<ResponseViewModel<DetalleVentaViewModel[]>> {
        const response = await axios.get(`${api_url}/ventas/detalles`, { params: { ventaId } });
        return response.data;
    }
}