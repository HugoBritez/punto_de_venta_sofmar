import { DepositoViewModel } from "@/models/viewmodels/depositoViewModel";
import { create } from "zustand";
import { getDepositos } from "@/repos/depositosApi";


interface DepositoStore{
    depositos: DepositoViewModel[]
    setDepositos: (depositos: DepositoViewModel[]) => void;
    fetchDepositos: (sucursal?: number, usuario?: number, descripcion?: string) => Promise<void>;
}

export const useDepositosStore = create<DepositoStore>((set)=>({
    depositos: [],
    setDepositos: (depositos: DepositoViewModel[])=>set({depositos}),
        fetchDepositos: async (sucursal?: number, usuario?: number, descripcion?: string)=>{
        try{
            const response = await getDepositos({
                sucursal: sucursal,
                usuario: usuario,
                descripcion: descripcion
            })
            set({depositos: response.data})
        }catch(error){
            console.error('Error al obtener los depositos:', error)
        }
    }
}))
