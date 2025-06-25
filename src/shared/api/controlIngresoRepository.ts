import type { ControlIngresoEntity, ControlIngresoItemEntity, GetControlIngresoParams, GetItemsParams, VerificarCompraDTO, VerificacionItemDTO, ConfirmarIngresoDTO } from "../types/controlIngreso";
import api from "../../config/axios";

export const controlIngresosRepository = {
    async GetControlIngreso(params: GetControlIngresoParams): Promise<ControlIngresoEntity>{
        const response = await api.get(`control-ingreso`,
            {
                params: {
                    deposito: params.deposito,
                    proveedor: params.proveedor,
                    fechadesde: params.fechadesde,
                    fechahasta: params.fechahasta,
                    factura: params.factura,
                    verificado: params.verificado,
                }
            }
        )

        return response.data;
    },


    async GetItems(params: GetItemsParams): Promise<ControlIngresoItemEntity[]> {
        const response = await api.get(`control-ingreso/items`, {
            params: {
                idCompra: params.idCompra,
                busqueda: params.busqueda,
                aVerificar: params.aVerificar
            }
        });

        return response.data;
    },

    async VerificarCompra(dto: VerificarCompraDTO): Promise<boolean> {
        const response = await api.post(`control-ingreso/verificar-compra`, dto);
        return response.data;
    },

    async VerificarItem(dto: VerificacionItemDTO): Promise<boolean> {
        try {
            console.log('Datos a enviar', dto);
            console.log('URL de la petición:', `${api.defaults.baseURL}control-ingreso/verificar-item`);
            console.log('Headers:', api.defaults.headers);
            
            const response = await api.post(`control-ingreso/verificar-item`, dto);
            console.log('Respuesta exitosa:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error en VerificarItem:', error);
            console.error('Status del error:', error.response?.status);
            console.error('Datos del error:', error.response?.data);
            console.error('Headers del error:', error.response?.headers);
            console.error('Datos que causaron el error:', dto);
            
            // Si hay detalles de validación, mostrarlos
            if (error.response?.data?.errors) {
                console.error('Errores de validación:', error.response.data.errors);
            }
            
            if (error.response?.data?.title) {
                console.error('Título del error:', error.response.data.title);
            }
            
            if (error.response?.data?.detail) {
                console.error('Detalle del error:', error.response.data.detail);
            }
            
            throw error;
        }
    },

    async ConfirmarIngreso(dto: ConfirmarIngresoDTO): Promise<boolean> {
        const response = await api.post(`control-ingreso/confirmar`, dto);
        return response.data;
    }
}