import api from "@/config/axios";
import { GetItemsFilters, ItemDTO } from "../types/items.type";

export const getItems = async (filters: GetItemsFilters)=>{
    const response = await api.get(`inventarios/items`, {params: {
        idInventario: filters.idInventario,
        filtro: filters.filtro,
        tipo: filters.tipo,
        valor: filters.valor ?? '',
        stock: filters.stock,
        busqueda: filters.busqueda ?? '',
    }});
    return response.data.body;
}

export const createItem = async (item: ItemDTO)=>{
    const response = await api.post(`inventarios/items`, item);
    return response.data.body;
}