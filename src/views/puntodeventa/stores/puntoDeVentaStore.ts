import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PuntoVentaStore {
  buscarItemsConStock: boolean;
  busquedaPorScanner: boolean;
  setBuscarItemsConStock: (value: boolean) => void;
  setBusquedaPorScanner: (value: boolean) => void;
}

export const usePuntoVentaStore = create<PuntoVentaStore>()(
  persist(
    (set) => ({
      buscarItemsConStock: false,
      busquedaPorScanner: true,
      setBuscarItemsConStock: (value: boolean) => set({ buscarItemsConStock: value }),
      setBusquedaPorScanner: (value: boolean) => set({ busquedaPorScanner: value }),
    }),
    {
      name: "punto-venta-storage", // nombre para localStorage
    }
  )
);