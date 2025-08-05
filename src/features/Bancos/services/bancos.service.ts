import api from "@/config/axios";
import { CuentasBancariasViewModel } from "../types/cuentasbancarias.type";
import { ConsultaMovimientosBancariosViewModel } from "../types/consultamovimientos.type";

export class BancosService {
    static async GetCuentasBancarias(estado?: number, moneda?: number): Promise<CuentasBancariasViewModel[]> {
        const response = await api.get("/bancos/cuentas", {
            params: {
                estado: estado,
                moneda: moneda
            }
        })
        return response.data.body;
    }


    static async ConsultarMovimientosBancarios(
        fechaInicio: string,
        fechaFin: string,
        estado: number,
        codigoCuenta?: number,
        cheque?: string,
        tipoFecha?: number,
        guardarCobroTarjeta?: number,
        chequeTransferencia?: number
    ) : Promise<ConsultaMovimientosBancariosViewModel[]> {
        const response = await api.get("/bancos/consultas", {
            params: {
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                estado: estado,
                cheque: cheque,
                codigoCuenta: codigoCuenta,
                tipoFecha: tipoFecha,
                guardarCobroTarjeta: guardarCobroTarjeta,
                chequeTransferencia: chequeTransferencia
            }
        })
        return response.data.body;
    }
}