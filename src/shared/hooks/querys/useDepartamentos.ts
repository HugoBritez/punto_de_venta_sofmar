import { useQuery } from "@tanstack/react-query";
import { getDepartamentos } from "../../api/departamentosRepository";
import type { Departamento } from "../../types/departamento";


export const useGetDepartamento = (busqueda?: string) => {
    return useQuery<Departamento[]>({
        queryKey: ['departamentos', busqueda],
        queryFn: ()=> getDepartamentos(busqueda),
        enabled: true,
        refetchOnWindowFocus: false
    })
}