import { useQuery } from "@tanstack/react-query";
import { pacientesRepository } from "../../api/pacientesRepository";

export const useGetPacientes = () => {
    return useQuery({
        queryKey: ["pacientes"],
        queryFn: pacientesRepository.getPacientes,
    });
};

export const useGetPacienteById = (id: number) => {
    return useQuery({
        queryKey: ["paciente", id],
        queryFn: () => pacientesRepository.getPacienteById(id),
        enabled: !!id,
        refetchOnWindowFocus: false
    });
};