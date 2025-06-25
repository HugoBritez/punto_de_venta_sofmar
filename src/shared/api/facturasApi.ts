import  api  from "./../../config/axios";


export interface DatosFacturacion {
    d_Codigo: number;
    op_Nombre: string;
    op_Codigo: number;
    d_Descripcion: string;
    d_Nrotimbrado: string;
    d_Fecha_Vence: string;
    d_Comprobante: string;
    d_P_Emision: string;
    d_Establecimiento: string;
    d_NroDesde: string;
    d_NroHasta: string;
    d_Nro_Secuencia: number;   
}
export const getDatosFacturacion = async (userId: number, sucursalId: number): Promise<DatosFacturacion[]> => {
    const response = await api.get(`facturacion`, {
        params: {
            usuario:  userId,
            sucursal: sucursalId
        }
    });
    return response.data.body;
}