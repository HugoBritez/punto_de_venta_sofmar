import api from '../../config/axios';
import type { Area } from "../types/area";

export const getAreas = async (): Promise<Area[]> => {
    try {
        const response = await api.get('area');
        return response.data.body;
    } catch (error) {
        console.error('Error al obtener áreas:', error);
        throw error;
    }
}