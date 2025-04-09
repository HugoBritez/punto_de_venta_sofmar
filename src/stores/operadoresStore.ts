import { create } from "zustand";

import axios from "axios";

import { api_url } from "../utils";

interface Operador {
  op_codigo: number;
  op_nombre: string;
}

export interface OperadorAdapter {
  id: number;
  descripcion: string;
}

interface OperadoresState {
  operadoresOriginales: Operador[];
  operadores: OperadorAdapter[];
  cargando: boolean;
  cargarOperadores: (busqueda?: string) => Promise<void>;
  obtenerOperadores: () => OperadorAdapter[];
  obtenerOperadorPorId: (id: number) => OperadorAdapter | undefined;
}

export const useOperadoresStore = create<OperadoresState>((set, get) => ({
  operadoresOriginales: [],
  operadores: [],
  cargando: false,

  cargarOperadores: async (busqueda?: string) => {
    try {
      set({ cargando: true });
      const response = await axios.get(`${api_url}usuarios/vendedores`, {
        params: {
          buscar: busqueda,
        },
      });

      const data = response.data;
      if (data && Array.isArray(data.body)) {
        set({ operadoresOriginales: data.body });
      }

      set({
        operadores: data.body.map((operador: Operador) => ({
          id: operador.op_codigo,
          descripcion: operador.op_nombre,
        })),
      });
    } catch (error) {
      console.error("Error al cargar operadores:", error);
    } finally {
      set({ cargando: false });
    }
  },

  obtenerOperadores: () => get().operadores,
  obtenerOperadorPorId: (id: number) =>
    get().operadores.find((operador) => operador.id === id),
}));
