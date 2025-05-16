import { Deposito } from "@/api/depositosApi";
import { create } from "zustand";
import { getDepositos } from "@/api/depositosApi";


interface DepositoStore{
    depositos: Deposito[]
    setDepositos: (depositos: Deposito[]) => void;
    fetchDepositos: (sucursal?: number, usuario?: number, descripcion?: string) => Promise<void>;
}

export const useDepositosStore = create<DepositoStore>((set)=>({
    depositos: [],
    setDepositos: (depositos: Deposito[])=>set({depositos}),
        fetchDepositos: async (sucursal?: number, usuario?: number, descripcion?: string)=>{
        try{
            const response = await getDepositos({
                sucursal: sucursal,
                usuario: usuario,
                descripcion: descripcion
            })
            set({depositos: response})
        }catch(error){
            console.error('Error al obtener los depositos:', error)
        }
    }
}))
