import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";
import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";


interface ListaPreciosStore {
    listaPrecios: ListaPrecio[];
    setListaPrecios: (listaPrecios: ListaPrecio[]) => void;
    fetchListaPrecios: () => Promise<void>;
}

export const useListaPreciosStore = create<ListaPreciosStore>((set)=>({
    listaPrecios: [],
    setListaPrecios: (listaPrecios: ListaPrecio[])=>set({listaPrecios}),
    fetchListaPrecios: async ()=>{
        try{
            const response = await axios.get(`${api_url}lista-precios/`)
            set({listaPrecios: response.data.body})
        }catch(error){
            console.error('Error al obtener las listas de precios:', error)
        }
    }
}))
