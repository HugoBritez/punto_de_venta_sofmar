import type { ControlIngresoEntity, ControlIngresoItemEntity, GetControlIngresoParams, GetItemsParams, VerificarCompraDTO, VerificacionItemDTO, ConfirmarIngresoDTO } from "../types/controlIngreso";
import api from "../../config/axios";

export const controlIngresosRepository = {
    async GetControlIngreso(params: GetControlIngresoParams): Promise<ControlIngresoEntity>{
        const response = await api.get(`control-ingreso`,
            {
                params: {
                    deposito: params.deposito,
                    proveedor: params.proveedor,
                    fechadesde: params.fechadesde,
                    fechahasta: params.fechahasta,
                    factura: params.factura,
                    verificado: params.verificado,
                }
            }
        )

        return response.data;
    },


    async GetItems(params: GetItemsParams): Promise<ControlIngresoItemEntity[]> {
        const response = await api.get(`control-ingreso/items`, {
            params: {
                idCompra: params.idCompra,
                busqueda: params.busqueda,
                aVerificar: params.aVerificar
            }
        });

        return response.data;
    },

    async VerificarCompra(dto: VerificarCompraDTO): Promise<boolean> {
        const response = await api.post(`control-ingreso/verificar-compra`, dto);
        return response.data;
    },

    async VerificarItem(dto: VerificacionItemDTO): Promise<boolean> {
        const response = await api.post(`control-ingreso/verificar-item`, dto);
        return response.data;
    },

    async ConfirmarIngreso(dto: ConfirmarIngresoDTO): Promise<boolean> {
        const response = await api.post(`control-ingreso/confirmar`, dto);
        return response.data;
    }
}