import { Moneda } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";

interface MonedasStore{
    monedas: Moneda[]
    setMonedas: (monedas: Moneda[]) => void;
    fetchMonedas: () => Promise<void>;
}

export const useMonedasStore = create<MonedasStore>((set)=>({
    monedas: [],
    setMonedas: (monedas: Moneda[])=>set({monedas}),
    fetchMonedas: async ()=>{
        try{
            const response = await axios.get(`${api_url}monedas/`);
            set({monedas: response.data.body})
        } catch(error){
            console.error('Error al obtener las monedas:', error)
        }  
    }
}))
