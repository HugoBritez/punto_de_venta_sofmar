import { Moneda } from "@/api/monedasApi";
import { create } from "zustand";
import { getMonedas } from "@/api/monedasApi";

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
            set({monedas: response})
        } catch(error){
            console.error('Error al obtener las monedas:', error)
        }  
    }
}))
