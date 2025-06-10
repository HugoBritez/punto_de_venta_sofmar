import { InventarioEntity } from "@/models/viewmodels/Inventario/InventarioEntity";
import { API_URL as api_url } from "@/utils";
import axios from "axios";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { CerrarInventarioParams } from "@/models/dtos/Inventario/CerrarInventarioParams";
import { InventarioItemDTO } from "@/models/dtos/Inventario/InventarioItemDTO";
import { InventarioItemEntity } from "@/models/viewmodels/Inventario/InventarioItemEntity";
import { GetItemsParams } from "@/models/dtos/Inventario/GetItemsParams";
import { ItemViewModel } from "@/models/viewmodels/Inventario/ItemViewModel";
import { InventarioViewModel } from "@/models/viewmodels/Inventario/InventarioViewModel";

export const inventarioRepository = {

    async AnularInventario(id: number): Promise<ResponseViewModel<InventarioEntity>> {
        const response = await axios.post(`${api_url}/inventarios/anular`, { id });
        return response.data;
    },

    async CerrarInventario(params: CerrarInventarioParams): Promise<ResponseViewModel<InventarioEntity>> {
        const response = await axios.post(`${api_url}/inventarios/cerrar`, params);
        return response.data;
    },

    async AutorizarInventario(id: number): Promise<ResponseViewModel<InventarioEntity>> {
        const response = await axios.get(`${api_url}/inventarios/autorizar`, {
            params: { id }
        });
        return response.data;
    },

    async RevertirInventario(id: number): Promise<ResponseViewModel<InventarioEntity>> {
        const response = await axios.post(`${api_url}/inventarios/revertir`, { id });
        return response.data;
    },

    async InsertarItem(data: InventarioItemDTO): Promise<ResponseViewModel<InventarioItemEntity>> {
        const response = await axios.post(`${api_url}/inventarios/items`, data);
        return response.data;
    },

    async GetItems(params: GetItemsParams): Promise<ResponseViewModel<ItemViewModel[]>> {
        const response = await axios.get(`${api_url}/inventarios/items`, {
            params: {
                idInventario: params.idInventario,
                busqueda: params.busqueda,
                filtro: params.filtro,
                tipo: params.tipo,
                valor: params.valor,
                stock: params.stock
            }});
        return response.data;
    },

    async GetInventarios(estado: number, deposito: number, nro_inventario: string): Promise<ResponseViewModel<InventarioViewModel[]>> {
        const response = await axios.get(`${api_url}/inventarios`, {
            params: {
                estado,
                deposito,
                nro_inventario
            }
        });
        return response.data;
    },

    async CrearInventario(data: InventarioEntity): Promise<ResponseViewModel<InventarioEntity>> {
        const response = await axios.post(`${api_url}/inventarios`, data);
        return response.data;

    }
}