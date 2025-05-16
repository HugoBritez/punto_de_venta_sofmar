import axios from "axios";
import { VentaDTO, DetalleVentaDTO } from "../../types/sharedDTO.type";
import { api_url } from "@/utils";

export const ventasApi = {
    insertarVenta: async (venta: VentaDTO, detalles: DetalleVentaDTO[]) => {
        const response = await axios.post(`${api_url}venta/agregar-venta-dto`, {
            venta,
            detalle_ventas: detalles,
        });
        console.log(response.data);
        return response.data;
    }
}