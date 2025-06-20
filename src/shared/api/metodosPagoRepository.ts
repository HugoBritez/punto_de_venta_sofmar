import type { MetodoPago } from "../types/metodoPago";
import api from "../../config/axios";


export const metodosPagoRepository = {

    async getMetodos(busqueda?: string): Promise<MetodoPago[]> {
        const response = await api.get(`metodospago`, {
            params: {
                busqueda: busqueda
            }
        });
        return response.data.body;
    },
}