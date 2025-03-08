import { Sucursal } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from 'axios';
import { create } from "zustand";

interface SucursalesStore {
    sucursales:  Sucursal[]
    setSucursales: (sucursales: Sucursal[]) => void;
    fetchSucursales: () => Promise<void>;
}

export const useSucursalesStore = create<SucursalesStore>((set)=>({
    sucursales: [],
    setSucursales: (sucursales: Sucursal[])=>set({sucursales}),
    fetchSucursales: async ()=>{
        try{
            const response = await axios.get(`${api_url}sucursales/listar`)
            set({sucursales: response.data.body})
        }catch(error){
            console.error('Error al obtener las sucursales:', error)
        }
    }
}))
