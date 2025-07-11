import { useQuery } from "@tanstack/react-query";
import { getItems } from "../api/itemsApi";
import { GetItemsFilters } from "../types/items.type";
import { getInventarios, GetInventariosFilters } from "../api/inventariosApi";

export const useGetInventarios = (filters: GetInventariosFilters)=>{
    return useQuery({
        queryKey: ["inventarios", filters],
        queryFn: () => getInventarios(filters),
    });
}

export const useGetItems = (filters: GetItemsFilters)=>{
    return useQuery({
        queryKey: ["items", filters],
        queryFn: () => getItems(filters),
    });
}   