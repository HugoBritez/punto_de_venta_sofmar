import api from "@/config/axios";
import { Doctor } from "../types/doctores";

export const doctoresRepository = {
    getDoctores: async(): Promise<Doctor[]> => {
        const { data } = await api.get("doctores");
        return data.body;
    },
    
    getDoctorById: async(id: number): Promise<Doctor> => {
        const { data } = await api.get("doctores", {
            params: { id }
        });
        return data.body[0];
    }
}