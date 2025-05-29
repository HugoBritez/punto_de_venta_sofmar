import { Moneda } from "@/models/viewmodels/MonedaViewModel";
import { create } from "zustand";
import { getMonedas } from "@/repos/monedasApi";

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
            const response = await getMonedas();
            set({monedas: response.data})
        } catch(error){
            console.error('Error al obtener las monedas:', error)
        }  
    }
}))
