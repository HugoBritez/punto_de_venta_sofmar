import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface Categoria {
  ca_codigo: number;
  ca_descripcion: string;
}

export interface CategoriaAdaptada {
  id: number;
  descripcion: string;
}

interface CategoriasState {
  categoriasOriginales: Categoria[];
  categorias: CategoriaAdaptada[];
  cargando: boolean;
  cargarCategorias: (busqueda?: string) => Promise<void>;
  obtenerCategorias: () => CategoriaAdaptada[];
  obtenerCategoriaPorId: (id: number) => CategoriaAdaptada | undefined;
}

export const useCategoriasStore = create<CategoriasState>((set, get) => ({
  categoriasOriginales: [],
  categorias: [],
  cargando: false,
  
  cargarCategorias: async (busqueda?: string) => {
    try {
      set({ cargando: true });
      
      const response = await axios.get(`${api_url}categorias/`,
        {
          params: {
            busqueda: busqueda
          }
        }
      );
      const data: Categoria[] = response.data.body;
      
      set({ categoriasOriginales: data });
      
      const transformadas = data.map(cat => ({
        id: cat.ca_codigo,
        descripcion: cat.ca_descripcion
      }));
      
      set({ 
        categorias: transformadas,
        cargando: false 
      });
    } catch (error) {
      console.error("Error al cargar categorías", error);
      set({ cargando: false });
    }
  },
  
  obtenerCategorias: () => get().categorias,
  
  obtenerCategoriaPorId: (id: number) => 
    get().categorias.find(cat => cat.id === id)
}));

