import { useQuery } from "@tanstack/react-query";
import { BancosService } from "../services/bancos.service";

export const useGetCuentasBancarias = (estado?: number, moneda?: number) => {
    return useQuery({
        queryKey: ["cuentas-bancarias", estado, moneda],
        queryFn: () => BancosService.GetCuentasBancarias(estado, moneda)
    })
}

export const useConsultarMovimientosBancarios = (
    fechaInicio: string,
    fechaFin: string,
    estado: number,
    codigoCuenta?: number,
    cheque?: string | undefined,
    tipoFecha?: number,
    guardarCobroTarjeta?: number,
    chequeTransferencia?: number
) => {
    return useQuery({
        queryKey: ["movimientos-bancarios", fechaInicio, fechaFin, estado, codigoCuenta, cheque, tipoFecha, guardarCobroTarjeta, chequeTransferencia],
        queryFn: () => BancosService.ConsultarMovimientosBancarios(fechaInicio, fechaFin, estado, codigoCuenta, cheque, tipoFecha, guardarCobroTarjeta, chequeTransferencia),
        enabled: !!fechaInicio && !!fechaFin && !!estado,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false
    })
}