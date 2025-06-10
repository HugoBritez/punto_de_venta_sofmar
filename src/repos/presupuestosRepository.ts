import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { PresupuestoEntity } from "@/models/viewmodels/Presupuestos/PresupuestoEntity";
import { DetallePresupuestoEntity } from "@/models/viewmodels/Presupuestos/PresupuestoEntity";
import { PresupuestoObservacion } from "@/models/viewmodels/Presupuestos/PresupuestoEntity";
import { PresupuestoViewModel } from "@/models/viewmodels/Presupuestos/PResupuestoVIewModel";
import { GetPresupuestosParams } from "@/models/dtos/Presupuestos/GetPresupuestosParams";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { DetallePresupuestoViewModel } from "@/models/viewmodels/Presupuestos/DetallePresupuestoViewModel";

interface RecuperarPresupuestoResponse {
    presupuesto: PresupuestoEntity;
    detalles: DetallePresupuestoEntity[];
}


export const PresupuestoRepository = {


    async GetPresupuestos(params: GetPresupuestosParams): Promise<ResponseViewModel<PresupuestoViewModel[]>> {
        const response = await axios.get(`${api_url}/presupuestos`, { params });
        return response.data;
    },


    async CrearPresupuesto(presupuesto: PresupuestoEntity, observacion: PresupuestoObservacion, detalles: DetallePresupuestoEntity[]): Promise<ResponseViewModel<PresupuestoViewModel>> {
        const response = await axios.post(`${api_url}/presupuestos`, {
            presupuesto,
            observacion,
            detalles
        });
        return response.data;
    },

    async GetDetallePresupuesto(presupuestoId: number): Promise<ResponseViewModel<DetallePresupuestoViewModel[]>> {
        const response = await axios.get(`${api_url}/presupuestos/presupuestos/detalles`, { params: { presupuestoId } });
        return response.data;
    },

    async RecuperarPresupuesto(codigo: number): Promise<ResponseViewModel<RecuperarPresupuestoResponse>> {
        const response = await axios.get(`${api_url}/presupuestos/recuperar`, { params: { idPresupuesto: codigo } });
        return response.data;
    }

}