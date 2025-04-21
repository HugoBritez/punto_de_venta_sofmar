import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface Deposito {
  dep_codigo: number;
  dep_descripcion: string;
}

export interface DepositoAdaptado {
  id: number;
  descripcion: string;
}

interface DepositosState {
  depositosOriginales: Deposito[];
  depositos: DepositoAdaptado[];
  cargando: boolean;
  cargarDepositos: (busqueda?: string) => Promise<void>;
  obtenerDepositos: () => DepositoAdaptado[];
  obtenerDepositoPorId: (id: number) => DepositoAdaptado | undefined;
}

export const useDepositosStore = create<DepositosState>((set, get) => ({
  depositosOriginales: [],
  depositos: [],
  cargando: false,

  cargarDepositos: async (busqueda?: string) => {
    try {
      set({ cargando: true });

      const response = await axios.get(`${api_url}depositos/`, {
        params: {
          busqueda: busqueda,
        },
      });
      const data: Deposito[] = response.data.body;

      set({ depositosOriginales: data });

      const transformadas = data.map((dep) => ({
        id: dep.dep_codigo,
        descripcion: dep.dep_descripcion,
      }));

      set({
        depositos: transformadas,
        cargando: false,
      });
    } catch (error) {
      console.error("Error al cargar depositos", error);
      set({ cargando: false });
    }
  },

  obtenerDepositos: () => get().depositos,

  obtenerDepositoPorId: (id: number) =>
    get().depositos.find((dep) => dep.id === id),
}));
