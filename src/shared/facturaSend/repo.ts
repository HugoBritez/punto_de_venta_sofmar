import { api_url } from "@/utils";
import axios from "axios";

export class FacturaSendRepository {
    public static async verificarEmpresaUsaFacturaElectronica (sucursal_id: number)
    {
        const response = await axios.get(`${api_url}facturacion-electronica/consultar`, {
            params: {
                sucursal_id
            }
        })

        console.log('response factura send en api', response.data)

        return Array.isArray(response.data.body) && 
               response.data.body[0]?.[1] === 1;
    }

    public static async obtenerParametrosFacturaSend ()
    {
        const response = await axios.get(`${api_url}facturacion-electronica`);

        const datos = Array.isArray(response.data)
        ? response.data[0]
        : response.data.body
        ? response.data.body[0]
        : response.data;
      return datos;
    }
}