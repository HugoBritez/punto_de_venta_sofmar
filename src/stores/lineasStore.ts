import { create } from "zustand";
import axios from "axios";
import { api_url } from "@/utils";

interface Linea {
  li_codigo: number;
  li_descripcion: string;
}

export interface LineasAdapter {
  id: number;
  descripcion: string;
}

interface LineasState {
  lineasOriginales: Linea[];
  lineas: LineasAdapter[];
  cargando: boolean;
  cargarLineas: (busqueda?: string) => Promise<void>;
  obtenerLineas: () => LineasAdapter[];
  obtenerLineaPorId: (id: number) => LineasAdapter | undefined;
}

export const useLineasStore = create<LineasState>((set, get) => ({
  lineasOriginales: [],
  lineas: [],
  cargando: false,

  cargarLineas: async (busqueda?: string) => {
    try {
      set({ cargando: true });

      const response = await axios.get(`${api_url}lineas/`, {
        params: {
          busqueda: busqueda,
        },
      });

      const data: Linea[] = response.data.body;

      set({ lineasOriginales: data });

      const transformadas = data.map((linea) => ({
        id: linea.li_codigo,
        descripcion: linea.li_descripcion,
      }));

      set({ lineas: transformadas, cargando: false });
    } catch (error) {
      console.error("Error al cargar lineas", error);
      set({ cargando: false });
    }
  },

  obtenerLineas: () => get().lineas,

  obtenerLineaPorId: (id: number) => get().lineas.find((linea) => linea.id === id),
}));
