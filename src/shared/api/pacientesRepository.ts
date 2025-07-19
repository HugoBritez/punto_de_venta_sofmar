import api from "@/config/axios";
import { Paciente } from "../types/paciente";

export const pacientesRepository = {
    getPacientes: async(): Promise<Paciente[]> => {
        const { data } = await api.get("pacientes");
        return data.body;
    },
    
    getPacienteById: async(id: number): Promise<Paciente> => {
        const { data } = await api.get("pacientes", {
            params: { id }
        });
        return data.body[0];
    }
}