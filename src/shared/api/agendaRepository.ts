import axios from "axios";
import type { AgendaDTO, AgendaNotasViewModel, AgendaViewModel, GetAgendasDTO, LocalizacionViewModel, ReagendarVisitaDTO, RegistrarLlegadaDTO, ResponseViewModel,  SubvisitaViewModel } from "../types/agendas";
import { config } from "../../config/env";

const api_url = config.apiUrl;

export const AgendasRepository = {
    async registrarLlegada(data: RegistrarLlegadaDTO): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}agendas/registrar-llegada`, data);
        return response.data;
    },

    async registrarSalida(idAgenda: number): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}agendas/registrar-salida`, { idAgenda });
        return response.data;
    },

    async reagendarVisita(data: ReagendarVisitaDTO): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}agendas/reagendar`, data);
        return response.data;
    },

    async anularVisita(idAgenda: number): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}agendas/anular-visita`, { idAgenda });
        return response.data;
    },

    async crearVisita(data: AgendaDTO): Promise<AgendaViewModel> {
        const response = await axios.post(`${api_url}agendas/`, data);
        console.log("response en crearVisita", response.data.body);
        return response.data.body;
    },

    async getAgendas({
        fechaDesde,
        fechaHasta,
        cliente,
        vendedor,
        visitado,
        estado,
        planificacion,
        notas,
        orden
    }: GetAgendasDTO): Promise<AgendaViewModel[]> {
        const params: any = {
            fechaDesde,
            fechaHasta,
            cliente,
            vendedor,
            visitado,
            estado,
            planificacion,
            notas,
            orden
        };
        const response = await axios.get(`${api_url}agendas`, { params });
        return response.data.body;
    },

    async getNotas(idAgenda: number): Promise<AgendaNotasViewModel[]>{
        const response = await axios.get(`${api_url}agendas/agendas/notas`,
            { params: { idAgenda } }
        );
        return response.data.body;
    },

        async crearNota(data: AgendaNotasViewModel): Promise<AgendaNotasViewModel> {
        const response = await axios.post(`${api_url}agendas/agendas/notas`, data);
        return response.data.body;
    },

    async crearSubvisita(data: SubvisitaViewModel): Promise<SubvisitaViewModel> {
        const response = await axios.post(`${api_url}agendas/subvisitas`, data);
        return response.data.body;
    },

    async getSubvisitas(idAgenda: number): Promise< SubvisitaViewModel[]> {
        const response = await axios.get(`${api_url}agendas/subvisitas`, { params: { idAgenda } });
        return response.data.body;
    },

    async getLocalizaciones(idAgenda: number): Promise<LocalizacionViewModel[]> {
        const response = await axios.get(`${api_url}agendas/localizacion`, { params: { idAgenda } });
        return response.data.body;
    }


}