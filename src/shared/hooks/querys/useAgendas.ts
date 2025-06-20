import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { AgendasRepository } from "../../api/agendaRepository";
import type { GetAgendasDTO } from "../../types/agendas";

export const useGetAgendas = (filtros: GetAgendasDTO) => {
    return useQuery({
        queryKey: ["agendas", filtros],
        queryFn: () => AgendasRepository.getAgendas(filtros),
        enabled: !!filtros.fechaDesde && !!filtros.fechaHasta
    });
};

export const useGetAgendaPorId = (idAgenda: number) => {
    return useQuery({
        queryKey: ["agendaPorId", idAgenda],
        queryFn: () => AgendasRepository.getAgendas({idAgenda: idAgenda}),
        select: (data) => data[0],
        enabled: !!idAgenda
    });
}

export const useGetNotas = (idAgenda: number, options?: Partial<UseQueryOptions>) => {
    return useQuery({
        queryKey: ["notasAgenda", idAgenda],
        queryFn: () => AgendasRepository.getNotas(idAgenda),
        enabled: !!idAgenda && (options?.enabled ?? true),
        ...options
    });
}

export const useGetSubvisitas = (idAgenda: number, options?: Partial<UseQueryOptions>) => {
    return useQuery({
        queryKey: ["subvisitasAgenda", idAgenda],
        queryFn: () => AgendasRepository.getSubvisitas(idAgenda),
        enabled: !!idAgenda && (options?.enabled ?? true),
        ...options
    });
}

export const useGetLocalizaciones = (idAgenda: number, options?: Partial<UseQueryOptions>) => {
    return useQuery({
        queryKey: ["localizacionesAgenda", idAgenda],
        queryFn: () => AgendasRepository.getLocalizaciones(idAgenda),
        enabled: !!idAgenda && (options?.enabled ?? true),
        ...options
    });
}