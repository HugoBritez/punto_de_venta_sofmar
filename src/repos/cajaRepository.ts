import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { CajaAbiertaViewModel } from "@/models/viewmodels/Caja/CajaAbiertaViewModel";


export const cajaRepository = {
    async verificarCajaAbierta(moneda: number, operador?: number): Promise<CajaAbiertaViewModel> {
        const response = await axios.get(`${api_url}caja/abierta`,
            {
                params: {
                    operador: operador,
                    moneda: moneda
                }
            }
        );
        console.log("Cajarepository", response.data)
        
        return response.data.body[0]
    }
}