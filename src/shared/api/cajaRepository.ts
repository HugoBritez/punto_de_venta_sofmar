import type { CajaAbiertaViewModel } from "../types/caja";
import api from "../../config/axios";


export const cajaRepository = {
    async verificarCajaAbierta(moneda: number, operador?: number): Promise<CajaAbiertaViewModel> {
        const response = await api.get(`caja/abierta`,
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