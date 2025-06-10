// stores/menuPermissionsStore.ts
import { create } from 'zustand';

interface PermisoMenu {
  acceso: number;
  crear: number;
  editar: number;
  menu_id: number;
  menu_descripcion: string;
  menu_grupo: number;
  menu_orden: number;
}

interface MenuPermissionsState {
  permisosMenu: PermisoMenu[];
  setPermisosMenu: (permisos: PermisoMenu[]) => void;
}

// Función para cargar permisos del sessionStorage
const loadPermisosFromStorage = (): PermisoMenu[] => {
  try {
    const stored = sessionStorage.getItem("permisos_menu");
    if (!stored || stored === "undefined" || stored === "") {
      return [
        {
          acceso: 1,
          crear: 0,
          editar:0,
          menu_id: 0,
          menu_descripcion: "Inicio",
          menu_grupo: 0,
          menu_orden: 1,
        },
      ];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [
        {
          acceso: 1,
          crear: 0,
          editar:0,
          menu_id: 0,
          menu_descripcion: "Inicio",
          menu_grupo: 0,
          menu_orden: 1,
        },
      ];
    }

    return parsed;
  } catch (error) {
    console.warn("Error al cargar permisos_menu:", error);
    return [
      {
        acceso: 1,
        menu_id: 0,
        crear: 0,
        editar:0,
        menu_descripcion: "Inicio",
        menu_grupo: 0,
        menu_orden: 1,
      },
    ];
  }
};

export const useMenuPermissionsStore = create<MenuPermissionsState>((set) => ({
  // Inicializamos con los permisos del sessionStorage
  permisosMenu: loadPermisosFromStorage(),
  
  setPermisosMenu: (permisos) => {
    // Actualizamos tanto el store como el sessionStorage
    sessionStorage.setItem("permisos_menu", JSON.stringify(permisos));
    set({ permisosMenu: permisos });
  }
}));

export const useMenuPermissions = () => {
  const permisosMenu = useMenuPermissionsStore(state => state.permisosMenu);
  
  return {
    permisosMenu,
    getPermiso: (menu_grupo: number, menu_orden: number) => permisosMenu.find(p => p.menu_grupo === menu_grupo && p.menu_orden == menu_orden ),
  };
};