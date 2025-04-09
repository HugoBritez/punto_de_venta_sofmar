import { create } from "zustand";
import axios from "axios";
import { api_url } from "@/utils";

interface Dvl {
    d_codigo: number;
    d_descripcion: string;
}

export interface DvlAdapter {
    id: number;
    descripcion: string;
}


interface DvlState {
    dvlOriginales: Dvl [];
    dvl: DvlAdapter [];
    cargando: boolean;
    cargarDvl: (busqueda?: string) => Promise<void>;
    obtenerDvl: () => DvlAdapter [];
    obtenerDvlPorId: (id: number) => DvlAdapter | undefined;
}

export const useDvlStore = create<  DvlState>((set, get) => ({
  dvlOriginales: [],
  dvl: [],
  cargando: false,

  cargarDvl: async (busqueda?: string) => {
    try {
      set({ cargando: true });

      const response = await axios.get(`${api_url}dvl/`, {
        params: {
          busqueda: busqueda,
        },
      });

      const data: Dvl[] = response.data.body;

      set({ dvlOriginales: data });

      const transformadas = data.map((dvl) => ({
        id: dvl.d_codigo,
        descripcion: dvl.d_descripcion,
      }));

      set({ dvl: transformadas, cargando: false });
    } catch (error) {
      console.error("Error al cargar dvl", error);
      set({ cargando: false });
    }
  },

  obtenerDvl: () => get().dvl,

  obtenerDvlPorId: (id: number) =>
    get().dvl.find((dvl) => dvl.id === id),
}));

