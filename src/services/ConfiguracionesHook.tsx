import axios from "axios";
import { api_url } from "@/utils";

export async function traerConfiguraciones() {
    try {
        const response = await axios.get(`${api_url}configuraciones/por_id?ids=55`, 
        );
        const elementoEspecifico = response.data.body.find((item: { id: number; }) => item.id === 55);
        
        // Guardar el elemento específico en sessionStorage
        if (elementoEspecifico) {
            sessionStorage.setItem('cobrarEnBalcon', JSON.stringify(elementoEspecifico));
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

export const getConfiguraciones = async () => {
  try {
    const response = await axios.get(
      `${api_url}configuraciones/get-configuraciones`
    );
    console.log("Respuesta de la API:", response.data);

    if (response.data?.body) {
      // Verificamos que exista data.body
      const configuraciones =
        typeof response.data.body === "string"
          ? JSON.parse(response.data.body)
          : response.data.body;

      console.log(
        "Configuraciones (body) convertidas a JSON:",
        configuraciones
      );

      // Guardar en sessionStorage
      sessionStorage.setItem(
        "configuraciones",
        JSON.stringify(configuraciones)
      );

      // Verificar que se guardó correctamente
      const configuracionesGuardadas =
        sessionStorage.getItem("configuraciones");
      console.log(
        "Configuraciones guardadas en sessionStorage:",
        configuracionesGuardadas ? JSON.parse(configuracionesGuardadas) : null
      );
      return configuraciones;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    return null;
  }
};