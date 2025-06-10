import { useQuery } from "@tanstack/react-query";
import { cajaRepository } from "@/repos/cajaRepository";

export const useVerificarCajaAbierta = (moneda: number, operador?: number )=> {
    return useQuery({
        queryKey: ['cajaAbierta', operador, moneda],
                queryFn: ()=> cajaRepository.verificarCajaAbierta(moneda, operador),
                enabled: !!operador,
                refetchOnWindowFocus: false
    })
}