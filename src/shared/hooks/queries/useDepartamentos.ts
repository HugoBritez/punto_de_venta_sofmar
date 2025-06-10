import { useQuery } from "@tanstack/react-query";
import { getDepartamentos } from "@/repos/departamentosRepository";
import { Departamento } from "@/models/viewmodels/DepartamentoViewModel";


export const useGetDepartamento = (busqueda?: string) => {
    return useQuery<Departamento[]>({
        queryKey: ['departamentos', busqueda],
        queryFn: ()=> getDepartamentos(busqueda),
        enabled: true,
        refetchOnWindowFocus: false
    })
}