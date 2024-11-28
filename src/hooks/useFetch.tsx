import { api_url } from "@/utils"
import axios from "axios"


export const fetchSucursales = async () =>{
    try{
        const response = await axios.get(`${api_url}/sucursales/listar`)
        return response.data.body
    }
    catch(error){
        console.log(error)
    }
}


export const fetchDepositos = async() =>{
    try{
        const response = await axios.get(`${api_url}/depositos/`)
        return response.data.body
    } catch(error){
        console.log(error)
    }
}


