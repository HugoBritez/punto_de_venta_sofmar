import { SucursalViewModel } from "@/models/viewmodels/sucursalViewModel";
import { create } from "zustand";
import { getSucursales } from "@/repos/sucursalApi";      

interface SucursalesStore {
    sucursales:  SucursalViewModel[]
    setSucursales: (sucursales: SucursalViewModel[]) => void;
    fetchSucursales: () => Promise<void>;
    fetchSucursalesPorOperador: (operador: number) => Promise<void>;
}   

export const useSucursalesStore = create<SucursalesStore>((set)=>({
    sucursales: [],
    setSucursales: (sucursales: SucursalViewModel[])=>set({sucursales}),
    fetchSucursales: async ()=>{
        try{
            const response = await getSucursales()
            set({sucursales: Array.isArray(response) ? response : [response]})
        }catch(error){
            console.error('Error al obtener las sucursales:', error)
        }
    },
    fetchSucursalesPorOperador: async (operador: number)=>{
        try{
            const response = await getSucursales({ operador })
            set({sucursales: Array.isArray(response ) ? response : [response]})
        }catch(error){
            console.error('Error al obtener las sucursales:', error)
        }
    }
}))
