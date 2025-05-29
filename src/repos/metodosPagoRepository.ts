import { api_url } from "@/utils";
import axios from "axios";

import { MetodoPago } from "@/models/viewmodels/MetodoDePago";


export const metodosPagoRepository = {

    async getMetodos(busqueda?: string): Promise<MetodoPago[]> {
        const response = await axios.get(`${api_url}metodospago`, {
            params: {
                busqueda: busqueda
            }
        });
        return response.data;
    },
}