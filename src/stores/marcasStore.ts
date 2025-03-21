import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface Marca {
  ma_codigo: number;
  ma_descripcion: string;
}

export interface MarcaAdaptada {
  id: number;
  descripcion: string;
}

interface MarcasState {
  marcasOriginales: Marca[];
  marcas: MarcaAdaptada[];
  cargando: boolean;
  cargarMarcas: (busqueda?: string) => Promise<void>;
  obtenerMarcas: () => MarcaAdaptada[];
  obtenerMarcaPorId: (id: number) => MarcaAdaptada | undefined;
}

export const useMarcasStore = create<MarcasState>((set, get) => ({
  marcasOriginales: [],
  marcas: [],
  cargando: false,

  cargarMarcas: async (busqueda?: string) => {
    try {
      set({ cargando: true });

      const response = await axios.get(`${api_url}marcas/`, {
        params: {
          busqueda: busqueda,
        },
      });
      const data: Marca[] = response.data.body;
      set({
        marcasOriginales: data,
        marcas: data.map((marca) => ({
          id: marca.ma_codigo,
          descripcion: marca.ma_descripcion,
        })),
        cargando: false,
      });
    } catch (error) {
      console.error("Error al cargar marcas", error);
      set({ cargando: false });
    }
  },

  obtenerMarcas: () => get().marcas,
  obtenerMarcaPorId: (id: number) =>
    get().marcas.find((marca) => marca.id === id),
}));
