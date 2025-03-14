import { create } from "zustand";
import axios from "axios";
import { api_url } from "@/utils";

interface FacturacionElectronicaStore {
    usaFacturaElectronica: number;
    setUsaFacturaElectronica: (usaFacturaElectronica: number) => void;
    fetchUsaFacturaElectronica: (sucursal_id: number) => Promise<void>;
}

export const useFacturacionElectronicaStore = create<FacturacionElectronicaStore>((set)=>({
    usaFacturaElectronica: 0,
    setUsaFacturaElectronica: (usaFacturaElectronica: number)=>set({usaFacturaElectronica}),
    fetchUsaFacturaElectronica: async (sucursal_id: number)=>{
        try{
            const response = await axios.get(`${api_url}facturacion-electronica/consultar`,
                {
                    params: {
                        sucursal_id
                    }
                }
            )
            // Verificar el nuevo formato de la respuesta
            let valor = 0;
            const data = response.data.body;
            console.log("data: ", data)
            
            if (Array.isArray(data) && data.length > 0) {
                // Si es un array con un objeto que tiene una propiedad "1"
                if (data[0] && data[0][1] !== undefined) {
                    valor = data[0][1];
                } else {
                    // Intentamos encontrar cualquier valor numérico
                    const primerObjeto = data[0];
                    for (const key in primerObjeto) {
                        if (typeof primerObjeto[key] === 'number') {
                            valor = primerObjeto[key];
                            break;
                        }
                    }
                }
            } else if (typeof data === 'number') {
                valor = data;
            }

            console.log("valor: ", valor)
            
            set({usaFacturaElectronica: Number(valor)});
        }catch(error){
            console.error('Error al obtener el estado de la factura electronica:', error)
            set({usaFacturaElectronica: 0}); // Por defecto, no usar factura electrónica en caso de error
        }
    }
}))