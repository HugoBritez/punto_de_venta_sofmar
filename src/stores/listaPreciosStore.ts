import { ListaPrecios } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";


interface ListaPreciosStore {
    listaPrecios: ListaPrecios[];
    setListaPrecios: (listaPrecios: ListaPrecios[]) => void;
    fetchListaPrecios: () => Promise<void>;
}

export const useListaPreciosStore = create<ListaPreciosStore>((set)=>({
    listaPrecios: [],
    setListaPrecios: (listaPrecios: ListaPrecios[])=>set({listaPrecios}),
    fetchListaPrecios: async ()=>{
        try{
            const response = await axios.get(`${api_url}listasprecios/`)
            set({listaPrecios: response.data.body})
        }catch(error){
            console.error('Error al obtener las listas de precios:', error)
        }
    }
}))
