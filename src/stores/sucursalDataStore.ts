import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface Sucursal {
  id: number;
  descripcion: string;
}

export interface SucursalAdaptado {
  id: number;
  descripcion: string;
}

interface SucursalDataState {
  sucursalesOriginales: Sucursal[];
  sucursales: SucursalAdaptado[];
  cargando: boolean;
  cargarSucursales: (busqueda?: string) => Promise<void>;
  obtenerSucursales: () => SucursalAdaptado[];
  obtenerSucursalPorId: (id: number) => SucursalAdaptado | undefined;
}

export const useSucursalDataStore = create<SucursalDataState>((set, get) => ({
  sucursalesOriginales: [],
  sucursales: [],
  cargando: false,

  cargarSucursales: async (busqueda?: string) => {
    try {
      set({ cargando: true });

      const response = await axios.get(`${api_url}sucursales/`, {
        params: {
          busqueda: busqueda,
          operador: sessionStorage.getItem("user_id"),
        },
      });
      const data: Sucursal[] = response.data.body;

      set({ sucursalesOriginales: data });

      const transformadas = data.map((suc) => ({
        id: suc.id,
        descripcion: suc.descripcion,
      }));

      set({
        sucursales: transformadas,
        cargando: false,
      });
    } catch (error) {
      console.error("Error al cargar sucursales", error);
      set({ cargando: false });
    }
  },

  obtenerSucursales: () => get().sucursales,

  obtenerSucursalPorId: (id: number) =>
    get().sucursales.find((suc) => suc.id === id),
}));
