import { Area } from "@/models/viewmodels/AreaViewModel";
import { API_URL as api_url } from "@/utils";
import axios from 'axios';


export const  getAreas =async (): Promise<Area[]> => {
    const response = await axios.get(`${api_url}area`)
    return response.data.body
}