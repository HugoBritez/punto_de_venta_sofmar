import { api_url } from "@/utils";
import axios from "axios";
import { create } from "zustand";

interface Cotizacion{
    usd_venta: number;
    ars_venta: number;
    brl_venta: number;
}

interface CotizacionesStore{
    cotizaciones: Cotizacion[]
    setCotizaciones: (cotizaciones: Cotizacion[]) => void;
    fetchCotizaciones: () => Promise<void>;
}

export const useCotizacionesStore = create<CotizacionesStore>((set)=>({
    cotizaciones: [],
    setCotizaciones: (cotizaciones: Cotizacion[])=>set({cotizaciones}),
    fetchCotizaciones: async () => {
        try{
            const response = await axios.get(`${api_url}cotizaciones/`)
            set({cotizaciones: response.data.body})
        }catch(error){
            console.error('Error al obtener las cotizaciones:', error)
        }
    }
}))