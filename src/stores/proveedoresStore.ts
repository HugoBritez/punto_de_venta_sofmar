import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface Proveedor {
    pro_codigo: number;
    pro_razon: string;
}

export interface ProveedorAdapter {
    id: number;
    descripcion: string;
}

interface ProveedoresState {
    proveedoresOriginales: Proveedor[];
    proveedores: ProveedorAdapter[];
    cargando: boolean;
    cargarProveedores: (busqueda?: string) => Promise<void>;
    obtenerProveedores: () => ProveedorAdapter[];
    obtenerProveedorPorId: (id: number) => ProveedorAdapter | undefined;
}

export const useProveedoresStore = create<ProveedoresState>((set, get)=>({
    proveedoresOriginales: [],
    proveedores: [],
    cargando: false,


    cargarProveedores: async (busqueda?: string) => {
        try{
            set({cargando: true});
            const response = await axios.get(`${api_url}proveedores/`, {
                params: {
                    busqueda: busqueda
                }
            });
            console.log('proveedores', response.data.body);

            const data: Proveedor[] = response.data.body;

            set({proveedoresOriginales: data});

            const transformados = data.map(prov =>({
                id: prov.pro_codigo,
                descripcion: prov.pro_razon
            }));

            set({
                proveedores: transformados,
                cargando: false
            });
        } catch (error) {
            console.error("Error al cargar proveedores", error);
            set({cargando: false});
        }
    },

    obtenerProveedores: () => get().proveedores,
    obtenerProveedorPorId: (id: number) => get().proveedores.find(prov => prov.id === id),
}))
