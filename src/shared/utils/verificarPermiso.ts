import { useAuth } from "../../services/AuthContext";

export const puedeCrear = (grupo: number, orden: number): boolean => {
    const { auth } = useAuth();
    const permiso = auth?.permisos_menu.find(
      p => p.menu_grupo === grupo && p.menu_orden === orden
    );
    return Boolean(permiso?.crear === 1) || auth?.userName === "admin" || auth?.userName === "Sofmar";
  };
  
  export const puedeEditar = (grupo: number, orden: number): boolean => {
    const { auth } = useAuth();
    const permiso = auth?.permisos_menu.find(
      p => p.menu_grupo === grupo && p.menu_orden === orden
    );
    return Boolean(permiso?.editar === 1) || auth?.userName === "admin" || auth?.userName === "Sofmar";
  };
  