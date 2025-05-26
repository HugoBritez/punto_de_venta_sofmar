import { api_url } from "@/utils";
import { AgendaViewModel } from "@/models/viewmodels/Agendas/AgendaViewModel";
import { RegistrarLlegadaDTO } from "@/models/dtos/Agendas/registrarLlegada.DTO";
import axios from "axios";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { ReagendarVisitaDTO } from "@/models/dtos/Agendas/reagendarVisita.DTO";
import { GetAgendasDTO } from "@/models/dtos/Agendas/getAgendasDTO";
import { AgendaNotasViewModel } from "@/models/viewmodels/Agendas/AgendaNotasViewModel";
import { SubvisitaViewModel } from "@/models/viewmodels/Agendas/SubvisitaViewModel";
import { LocalizacionViewModel } from "@/models/viewmodels/Agendas/LocalizacionViewModel";


export const AgendasRepository = {


    async registrarLlegada(data: RegistrarLlegadaDTO): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}/agendas/registrar-llegada`, data);
        return response.data;
    },

    async registrarSalida(idAgenda: number): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}/agendas/registrar-salida`, { idAgenda });
        return response.data;
    },

    async reagendarVisita(data: ReagendarVisitaDTO): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}/agendas/reagendar`, data);
        return response.data;
    },

    async anularVisita(idAgenda: number): Promise<ResponseViewModel<AgendaViewModel>> {
        const response = await axios.post(`${api_url}/agendas/anular-visita`, { idAgenda });
        return response.data;
    },

    async crearVisita(data: AgendaViewModel): Promise<AgendaViewModel> {
        const response = await axios.post(`${api_url}/agendas/`, data);
        return response.data;
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
    }: GetAgendasDTO): Promise<ResponseViewModel<AgendaViewModel[]>> {
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
        const response = await axios.get(`${api_url}/agendas`, { params });
        return response.data;
    },

    async getNotas(idAgenda: number): Promise<ResponseViewModel<AgendaNotasViewModel[]>>{
        const response = await axios.get(`${api_url}/agendas/agendas/notas`,
            { params: { idAgenda } }
        );
        return response.data;
    },

    async crearNota(data: AgendaNotasViewModel): Promise<ResponseViewModel<AgendaNotasViewModel>> {
        const response = await axios.post(`${api_url}/agendas/agendas/notas`, data);
        return response.data;
    },

    async crearSubvisita(data: SubvisitaViewModel): Promise<ResponseViewModel<SubvisitaViewModel>> {
        const response = await axios.post(`${api_url}/agendas/subvisitas`, data);
        return response.data;
    },

    async getSubvisitas(idAgenda: number): Promise<ResponseViewModel<SubvisitaViewModel[]>> {
        const response = await axios.get(`${api_url}/agendas/subvisitas`, { params: { idAgenda } });
        return response.data;
    },

    async getLocalizaciones(idAgenda: number): Promise<ResponseViewModel<LocalizacionViewModel[]>> {
        const response = await axios.get(`${api_url}/agendas/localizacion`, { params: { idAgenda } });
        return response.data;
    }


}