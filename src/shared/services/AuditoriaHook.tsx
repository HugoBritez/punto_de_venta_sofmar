import axios from "axios";
import { api_url } from "@/utils";
import { now } from "lodash";


async function Auditar(entidad: number, accion: number, idReferencia: number | null, vendedor: number, obs: string) {
    const token = sessionStorage.getItem('token');
    const usuario = sessionStorage.getItem('user_name');
    
    const datos = {
        entidad,
        accion,
        fecha: new Date(now()),
        usuario: usuario, 
        idReferencia,
        vendedor,
        obs,
    }
    
    try {
        await axios.post(`${api_url}auditoria/`, datos, {
        headers: {
            Authorization: token
        }
        });
    } catch (error) {
        console.log(error);
    }
    }


    export default Auditar; //probando la nueva rama




