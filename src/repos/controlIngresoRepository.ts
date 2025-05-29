import { ResponseViewModel } from "@/models/base/responseViewModel";
import { ConfirmarIngresoDTO } from "@/models/dtos/ControlIngreso/confirmarIngresoDTO";
import { GetControlIngresoParams } from "@/models/dtos/ControlIngreso/GetControlIngresoParams";
import { GetItemsParams } from "@/models/dtos/ControlIngreso/GetItemsParams";
import { VerificarCompraDTO } from "@/models/dtos/ControlIngreso/verificarCompraDTO";
import { ControlIngresoEntity } from "@/models/viewmodels/ControlIngreso/ControlIngresoEntity";
import { ControlIngresoItemEntity } from "@/models/viewmodels/ControlIngreso/ControlIngresoItemsEntity";
import { api_url } from "@/utils";
import { VerificacionItemDTO } from "@/views/compras/control_ingreso/types/shared.type";
import axios from "axios";

export const controlIngresosRepository = {
    async GetControlIngreso(params: GetControlIngresoParams): Promise<ResponseViewModel<ControlIngresoEntity>>{
        const response = await axios.get(`${api_url}control-ingreso`,
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


    async GetItems(params: GetItemsParams): Promise<ResponseViewModel<ControlIngresoItemEntity[]>> {
        const response = await axios.get(`${api_url}control-ingreso/items`, {
            params: {
                idCompra: params.idCompra,
                busqueda: params.busqueda,
                aVerificar: params.aVerificar
            }
        });

        return response.data;
    },

    async VerificarCompra(dto: VerificarCompraDTO): Promise<ResponseViewModel<boolean>> {
        const response = await axios.post(`${api_url}control-ingreso/verificar-compra`, dto);
        return response.data;
    },

    async VerificarItem(dto: VerificacionItemDTO): Promise<ResponseViewModel<boolean>> {
        const response = await axios.post(`${api_url}control-ingreso/verificar-item`, dto);
        return response.data;
    },

    async ConfirmarIngreso(dto: ConfirmarIngresoDTO): Promise<ResponseViewModel<boolean>> {
        const response = await axios.post(`${api_url}control-ingreso/confirmar`, dto);
        return response.data;
    }


}