import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";
import axios from "axios";
import { api_url } from "@/utils";


export const ListaPrecioRepository = {

    async GetListaPrecios(): Promise<ListaPrecio[]> {
        const response = await axios.get(`${api_url}lista-precios`);
        console.log("Lista de precios response:", response.data);
        return response.data.data;
    }
}