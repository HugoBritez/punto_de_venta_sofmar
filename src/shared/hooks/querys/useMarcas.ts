import { useQuery } from "@tanstack/react-query";
import { marcaRepository } from "../../../shared/api/marcaRepository";

export const useGetMarcas = () => {
    return useQuery({
        queryKey: ['marcas'],
        queryFn: () => marcaRepository.GetMarcas(),
    });
};