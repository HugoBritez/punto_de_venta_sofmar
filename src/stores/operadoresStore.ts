import { create } from "zustand";

import axios from "axios";

import { api_url } from "../utils";

export interface Operador {
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
  getOperadorPorCodInterno: (id: number) => Promise<void>;
  vendedorSeleccionado: Operador | null;
}

export const useOperadoresStore = create<OperadoresState>((set, get) => ({
  operadoresOriginales: [],
  operadores: [],
  cargando: false,
  vendedorSeleccionado: null,
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

  getOperadorPorCodInterno: async (id: number) => {
    try {
      set({cargando: true})
      set({vendedorSeleccionado: null})
      const response = await axios.get(`${api_url}usuarios/vendedores/`, {
        params: {
          id_vendedor: id,
        },
      });
      console.log("response", response.data.body);
      set({ vendedorSeleccionado: response.data.body[0] });
    } catch (error) {
      console.error("Error al obtener el operador por cod interno:", error);
    } finally {
      set({cargando: false})
    }
  },

  obtenerOperadores: () => get().operadores,
  obtenerOperadorPorId: (id: number) =>
    get().operadores.find((operador) => operador.id === id),
}));
