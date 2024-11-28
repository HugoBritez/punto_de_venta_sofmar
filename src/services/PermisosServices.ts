import { api_url } from "@/utils";
import axios from "axios";

async function getPermisos(menuId: number) {
    try {
        const response = await axios.post(`${api_url}permisos/permitir`, {
            userId: Number(localStorage.getItem('user_id')),
            menuId: menuId
        });
        return response.data.body;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
    }
}

export { getPermisos };