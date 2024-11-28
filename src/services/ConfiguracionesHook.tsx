import axios from "axios";
import { api_url } from "@/utils";

export async function traerConfiguraciones() {
    try {
        const response = await axios.get(`${api_url}configuraciones/por_id?ids=55`, 
        
        );
        
        
        const elementoEspecifico = response.data.body.find((item: { id: number; }) => item.id === 55);
        
        // Guardar el elemento específico en localStorage
        if (elementoEspecifico) {
            localStorage.setItem('cobrarEnBalcon', JSON.stringify(elementoEspecifico));
            console.log(elementoEspecifico)
        } else {
            console.log('Elemento con id 55 no encontrado');
        }
        
        return elementoEspecifico;
    } catch (error) {
        console.log(error);
        throw error;
    }
}