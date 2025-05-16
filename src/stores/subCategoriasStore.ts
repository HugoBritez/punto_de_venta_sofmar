import { create } from "zustand";
import axios from "axios";
import { api_url } from "@/utils";
import { Subcategoria } from "@/shared/types/shared_interfaces";

interface SubCategoria {
    sc_codigo: number;
    sc_descripcion: string;
}

export interface SubCategoriasAdapter {
    id: number;
    descripcion: string;
}

interface SubCategoriasState {
    subCategoriasOriginales: SubCategoria[];
    subCategorias: SubCategoriasAdapter[];
    cargando: boolean;
    cargarSubCategorias: (busqueda?: string) => Promise<void>;
    obtenerSubCategorias: () => SubCategoriasAdapter[];
    obtenerSubCategoriaPorId: (id: number) => SubCategoriasAdapter | undefined;
}


export const useSubCategoriasStore = create<SubCategoriasState>((set, get)=> ({
    subCategoriasOriginales: [],
    subCategorias: [],
    cargando: false,

    cargarSubCategorias: async (busqueda?: string) => {
        try{
            set({cargando: true});

            const response = await axios.get(`${api_url}subcategorias/todos`, {
                params: {
                    busqueda: busqueda
                }
            });

            const data:Subcategoria[]= response.data.body;
            
            set({subCategoriasOriginales: data});

            const transformadas = data.map(sub => ({
                id: sub.sc_codigo,
                descripcion: sub.sc_descripcion
            }));

            set({subCategorias: transformadas, cargando: false});
        }catch(error){
            console.error("Error al cargar subcategorias", error);
            set({cargando: false});
        }
    },

    obtenerSubCategorias: () => get().subCategorias,

    obtenerSubCategoriaPorId: (id: number) => get().subCategorias.find(sub => sub.id === id)
    
}))