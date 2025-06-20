import { useQuery } from "@tanstack/react-query";
import { ProveedorRepository } from "../../api/proveedoresRepository";

export const useGetProveedores = () => {
    return useQuery({
        queryKey: ['proveedores'],
        queryFn: () => ProveedorRepository.GetProveedores(),
    });
};