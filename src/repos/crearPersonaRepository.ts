import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { CrearPersonaDTO } from "@/models/dtos/CrearPersonaDTO";
import { PersonaViewModel } from "@/models/viewmodels/PersonaViewModel";

const URL = `${api_url}personal`;

export const crearPersona = async (datos: CrearPersonaDTO)=>{
    const response = await axios.post(`${api_url}personal`,
        datos
    );
    return response.data.body;
}


export const getPersonas = async (tipo: number, busqueda?: string):Promise<PersonaViewModel[]> =>{
    const response = await axios.get(`${api_url}personal`, {
        params: {
            Tipo: tipo,
            Busqueda: busqueda
        }
    })

    console.log("data en repository", response)

    return response.data.body;
}


export const getByRuc = async (id: number, tipo: number): Promise<CrearPersonaDTO> => {
    const response = await axios.get(URL + "/ruc", 
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
    const response = await axios.get(`${api_url}personal/ultimo-codigo`);
    return response.data;
}