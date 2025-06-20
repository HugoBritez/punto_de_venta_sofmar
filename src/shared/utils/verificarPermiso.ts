import { useAuthStore } from "../../shared/stores/authStore";

export const puedeCrear = (grupo: number, orden: number): boolean => {
    const permiso = useAuthStore.getState().usuario?.permisos_menu.find(
      p => p.menu_grupo === grupo && p.menu_orden === orden
    );
    return permiso?.crear === 1;
  };
  
  export const puedeEditar = (grupo: number, orden: number): boolean => {
    const permiso = useAuthStore.getState().usuario?.permisos_menu.find(
      p => p.menu_grupo === grupo && p.menu_orden === orden
    );
    return permiso?.editar === 1;
  };
  