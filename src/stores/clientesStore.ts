import { create } from "zustand";
import axios from "axios";
import { api_url } from "@/utils";
import { Cliente } from "@/types/shared_interfaces";



export interface ClienteAdapter {
    id: number;
    descripcion: string;
}

interface ClientesState {
    clientesOriginales: Cliente[];
    clientes: ClienteAdapter[];
    clientesExtended: Cliente[];
    cargando: boolean;
    cargarClientes: (busqueda?: string) => Promise<void>;
    obtenerClientes: () => ClienteAdapter[];
    obtenerClientePorId: (id: number) => ClienteAdapter | undefined;
    cargarClientesPorId: (id: number) => Promise<void>;
    clienteSeleccionado: Cliente | null;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
    clientesOriginales: [],
    clientes: [],
    clienteSeleccionado: null,
    clientesExtended: [],
    cargando: false,
    cargarClientesPorId: async (id: number) => {
        try{
            set({cargando: true});
            const response = await axios.get(`${api_url}clientes/get-clientes`, {
                params: {
                    id: id,
                },
            });
            const data = response.data;
            set({clienteSeleccionado: data.body[0]});
        }catch(error){
            console.error("Error al cargar clientes", error);
        }finally{
            set({cargando: false});
        }
    },
    cargarClientes: async (busqueda?: string) => {
        try{
            set({cargando: true});
            const response = await axios.get(`${api_url}clientes/get-clientes`, {
                params: {
                    buscar: busqueda,
                },
            });
            const data = response.data; 

            if(data && Array.isArray(data.body)){
                set({clientesOriginales: data.body});
            }
            set({
                clientes: data.body.map((cliente: Cliente) => ({
                    id: cliente.cli_codigo,
                    descripcion: cliente.cli_razon,
                })),
            });
            set({
                clientesExtended: data.body,
            });
        }catch(error){
            console.error("Error al cargar clientes", error);
        }finally{
            set({cargando: false});
        }
    },
    obtenerClientes: () => get().clientes,
    obtenerClientePorId: (id: number) => get().clientes.find((cliente) => cliente.id === id),   
}))



