import { api_url } from '@/utils';
import axios from 'axios';
import { create } from 'zustand'

interface SucursalData {
    id: number;
    descripcion: string;
    direccion: string;
    tel: string;
    nombre_emp: string;
    ruc_emp: string;
    matriz: number;
}

interface SucursalStore {
    sucursalData: SucursalData | null;
    setSucursalData: (data: SucursalData) => void;
    fetchSucursalData: () => Promise<void>;
}

export const useSucursalStore = create<SucursalStore>((set) => ({
    sucursalData: null,
    setSucursalData: (data) => set({ sucursalData: data }),
    fetchSucursalData: async () => {
        if (useSucursalStore.getState().sucursalData) {
            console.log('Datos de la sucursal ya existen');
            return;
        };
        try {
            console.log('Obteniendo datos de la sucursal');
            const response = await axios.get(`${api_url}sucursales/sucursal-data`)
            // Asumiendo que queremos la sucursal principal (matriz = 1)
            const sucursales = response.data.body;
            const sucursalPrincipal = Array.isArray(sucursales) 
                ? sucursales.find(s => s.matriz === 1) || sucursales[0]
                : sucursales;
            set({ sucursalData: sucursalPrincipal })
        } catch (error) {
            console.error('Error al obtener datos de la sucursal:', error);
        }
    }
}));