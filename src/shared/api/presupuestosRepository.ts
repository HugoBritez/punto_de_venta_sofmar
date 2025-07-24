import api from "../../config/axios";
import type { DetallePresupuestoEntity, DetallePresupuestoViewModel, GetPresupuestosParams, PresupuestoEntity, PresupuestoObservacion, PresupuestoViewModel } from "../types/presupuesto";


interface RecuperarPresupuestoResponse {
    presupuesto: PresupuestoEntity;
    detalles: DetallePresupuestoEntity[];
}


export const PresupuestoRepository = {


    async GetPresupuestos(params: GetPresupuestosParams): Promise<PresupuestoViewModel[]> {
        const response = await api.get(`presupuestos`, { params });
        return response.data;
    },


    async CrearPresupuesto(presupuesto: PresupuestoEntity, observacion: PresupuestoObservacion, detalles: DetallePresupuestoEntity[]): Promise<PresupuestoViewModel> {
        const response = await api.post(`presupuestos`, {
            presupuesto,
            observacion,
            detalles
        });
        return response.data;
    },

    async GetDetallePresupuesto(presupuestoId: number): Promise<DetallePresupuestoViewModel[]> {
        const response = await api.get(`presupuestos/presupuestos/detalles`, { params: { presupuestoId } });
        return response.data;
    },

    async RecuperarPresupuesto(codigo: number): Promise<RecuperarPresupuestoResponse> {
        const response = await api.get(`presupuestos/recuperar`, { params: { idPresupuesto: codigo } });
        return response.data;
    },

    async GetPresupuestosPorCliente(clienteRuc: string): Promise<PresupuestoViewModel[]> {
        const response = await api.get(`presupuestos/presupuestos/cliente/${clienteRuc}`);
        return response.data.body;
    }

}