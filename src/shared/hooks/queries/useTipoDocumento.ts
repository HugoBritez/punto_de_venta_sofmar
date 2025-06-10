import { tipoDocumentoRepository } from "@/repos/tipoDocumentoRepository"
import {  useQuery } from "@tanstack/react-query"

export const useGetTipoDocumento = () => {
    return useQuery({
        queryKey: ['tipoDocumento'],
        queryFn: () => tipoDocumentoRepository.getAll(),
        refetchOnWindowFocus: false,
        enabled: true,
    })
}