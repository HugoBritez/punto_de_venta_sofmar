import api from "../../config/axios";
import type { CerrarInventarioParams, GetItemsParams, InventarioEntity, InventarioItemDTO, InventarioItemEntity, InventarioViewModel, ItemViewModel } from "../types/inventario";

export const inventarioRepository = {

    async AnularInventario(id: number): Promise<InventarioEntity> {
        const response = await api.post(`inventarios/anular`, { id });
        return response.data;
    },

    async CerrarInventario(params: CerrarInventarioParams): Promise<InventarioEntity> {
        const response = await api.post(`inventarios/cerrar`, params);
        return response.data;
    },

    async AutorizarInventario(id: number): Promise<InventarioEntity> {
        const response = await api.get(`inventarios/autorizar`, {
            params: { id }
        });
        return response.data;
    },

    async RevertirInventario(id: number): Promise<InventarioEntity> {
        const response = await api.post(`inventarios/revertir`, { id });
        return response.data;
    },

    async InsertarItem(data: InventarioItemDTO): Promise<InventarioItemEntity> {
        const response = await api.post(`inventarios/items`, data);
        return response.data;
    },

    async GetItems(params: GetItemsParams): Promise<ItemViewModel[]> {
        const response = await api.get(`inventarios/items`, {
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

    async GetInventarios(estado: number, deposito: number, nro_inventario: string): Promise<InventarioViewModel[]> {
        const response = await api.get(`inventarios`, {
            params: {
                estado,
                deposito,
                nro_inventario
            }
        });
        return response.data;
    },

    async CrearInventario(data: InventarioEntity): Promise<InventarioEntity> {
        const response = await api.post(`inventarios`, data);
        return response.data;

    }
}