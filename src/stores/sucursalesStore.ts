import {  Sucursal } from "@/api/sucursalApi";
import { create } from "zustand";
import { getSucursales } from "@/api/sucursalApi";      

interface SucursalesStore {
    sucursales:  Sucursal[]
    setSucursales: (sucursales: Sucursal[]) => void;
    fetchSucursales: () => Promise<void>;
    fetchSucursalesPorOperador: (operador: number) => Promise<void>;
}   

export const useSucursalesStore = create<SucursalesStore>((set)=>({
    sucursales: [],
    setSucursales: (sucursales: Sucursal[])=>set({sucursales}),
    fetchSucursales: async ()=>{
        try{
            const response = await getSucursales()
            set({sucursales: response})
        }catch(error){
            console.error('Error al obtener las sucursales:', error)
        }
    },
    fetchSucursalesPorOperador: async (operador: number)=>{
        try{
            const response = await getSucursales(operador)
            set({sucursales: response})
        }catch(error){
            console.error('Error al obtener las sucursales:', error)
        }
    }
}))
