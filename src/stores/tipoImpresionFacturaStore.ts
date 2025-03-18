import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";

interface TipoImpresionFacturaStore {
    tipoImpresion: string;
    setTipoImpresion: (tipoImpresion: string) => void;
    fetchTipoImpresion: () => Promise<void>;
}


export const useTipoImpresionFacturaStore = create<TipoImpresionFacturaStore>((set)=>({
    tipoImpresion: "",
    setTipoImpresion: (tipoImpresion: string)=>set({tipoImpresion}),
    fetchTipoImpresion: async ()=>{
        try {
           const response = await axios.get(`${api_url}configuraciones/por_id`,
            {
                params: {
                    ids: 7
                }
            }
           )   
           set({tipoImpresion: response.data.body[0].valor})
        } catch (error) {
            console.error("Error al obtener el tipo de impresion de factura", error)
        }
    }
}))