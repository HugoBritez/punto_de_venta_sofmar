import { useQuery } from "@tanstack/react-query";
import { categoriasRepository } from "../../../shared/api/categoriasRepository";

export const useGetCategorias = () => {
    return useQuery({
        queryKey: ['categorias'],
        queryFn: () => categoriasRepository.getCategorias(),
    });
};