import axios from "axios";
import { api_url } from "@/utils";


export const actualizarUltimaFactura = async (codigo: number, numero: number) => {
    try {
        await axios.post(`${api_url}definicion-ventas/sec?secuencia=${codigo}&codigo=${numero}`);
    } catch (error) {
        console.error("Error al actualizar la última factura:", error);
        throw error;
    }
}