import type { CrearPersonaDTO } from "../types/personas";
import type { PersonaViewModel } from "../types/personas";
import api from "../../config/axios";

const URL = `personal`;

export const crearPersona = async (datos: CrearPersonaDTO)=>{
    const response = await api.post(`${URL}`,
        datos
    );
    return response.data.body;
}


export const getPersonas = async (tipo: number, busqueda?: string):Promise<PersonaViewModel[]> =>{
    const response = await api.get(`${URL}`, {
        params: {
            Tipo: tipo,
            Busqueda: busqueda
        }
    })

    console.log("data en repository", response)

    return response.data.body;
}


export const getByRuc = async (id: number, tipo: number): Promise<CrearPersonaDTO> => {
    const response = await api.get(`${URL}/ruc`, 
        {
            params: {
                Id: id,
                Tipo: tipo
            }
        }
    );

    console.log("llamando a la persona por su ruc")

    return response.data.body;
}


export const getUltimoCodigoInterno = async () : Promise<string> => {
    const response = await api.get(`${URL}/ultimo-codigo`);
    return response.data;
}