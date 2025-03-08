import { Deposito } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";


interface DepositoStore{
    depositos: Deposito[]
    setDepositos: (depositos: Deposito[]) => void;
    fetchDepositos: () => Promise<void>;
}

export const useDepositosStore = create<DepositoStore>((set)=>({
    depositos: [],
    setDepositos: (depositos: Deposito[])=>set({depositos}),
    fetchDepositos: async ()=>{
        try{
            const response = await axios.get(`${api_url}depositos/`)
            set({depositos: response.data.body})
        }catch(error){
            console.error('Error al obtener los depositos:', error)
        }
    }
}))
