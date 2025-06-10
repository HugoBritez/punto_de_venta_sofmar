import { getPersonas, getByRuc, getUltimoCodigoInterno } from "@/repos/crearPersonaRepository"
import { useQuery } from "@tanstack/react-query"

export const useGetPersonas = (tipo: number, busqueda?: string) => {
    return useQuery({
        queryKey: ['personas', tipo, busqueda],
        queryFn: async () => {
            const res = await getPersonas(tipo, busqueda)
            return res
        },
        enabled: true,
        refetchOnWindowFocus: false
    })
}

export const useGetPersonaByRuc = (id: number, tipo: number) => {
    return useQuery({
        queryKey: ['personaRuc', id, tipo],
        queryFn: async ()=> {
            console.log("llamando al query de persona por ruc", id)
            const res = await getByRuc(id, tipo)
            console.log("response de la persona", res)
            return res;
        },
        enabled: !!id
    })
}


export const useGetUltimoCodigoInterno = () => {
    return useQuery({
        queryKey: ['ultimoCodigoInterno'],
        queryFn: async () => {
            const res = await getUltimoCodigoInterno()
            return res
        },
        enabled: true
    })
}