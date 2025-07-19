import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface LoginData {
    token: string;
    usuario: [{
      op_codigo: string;
      op_nombre: string;
      op_usuario: string;
      op_sucursal: string;
      op_autorizar: number;
      op_ver_utilidad: number;
      op_ver_proveedor: number;
      op_aplicar_descuento: number;
      op_movimiento: number;
      or_rol: number;
      op_graficos?: number;
      permisos_menu: {
        acceso: number;
        menu_id: number;
        menu_descripcion: string;
        menu_grupo: number;
        menu_orden: number;
        crear: number;
        editar: number;
      }[];
    }];
  }

  interface AuthState {
    token: string | null;
    usuario: LoginData['usuario'][0] | null;
    isLoading: boolean;
    tokenExpiration: number | null;
    lastActivity: number;
    
    // Actions
    login: (data: LoginData) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    updateActivity: () => void;
    initializeAuth: () => void;
  }

  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        token: null,
        usuario: null,
        isLoading: true,
        tokenExpiration: null,
        lastActivity: new Date().getTime(),
        
        initializeAuth: () => {
          // Cargar datos desde sessionStorage para compatibilidad
          const token = sessionStorage.getItem("token");
          const userId = sessionStorage.getItem("user_id");
          const userName = sessionStorage.getItem("user_name");
          const userSuc = sessionStorage.getItem("user_suc");
          const userUsuario = sessionStorage.getItem("user_usuario");
          const rol = Number(sessionStorage.getItem("rol"));
          const permisoVerUtilidad = Number(sessionStorage.getItem("permiso_ver_utilidad"));
          const permisosAutorizarPedido = Number(sessionStorage.getItem("permisos_autorizar_pedido"));
          const permisoVerProveedor = Number(sessionStorage.getItem("permiso_ver_proveedor"));
          const permisos_descuento = Number(sessionStorage.getItem("permisos_descuento"));
          const tokenExpiration = Number(sessionStorage.getItem("token_expiration"));
          const movimiento = Number(sessionStorage.getItem("operador_movimiento"));
          
          let parsedPermisosMenu = [];
          try {
            const permisosMenu = sessionStorage.getItem("permisos_menu");
            if (permisosMenu) {
              parsedPermisosMenu = JSON.parse(permisosMenu);
            }
          } catch (error) {
            console.error("Error parsing permisos_menu:", error);
          }

          if (token && userId && userName && userSuc) {
            const usuario = {
              op_codigo: userId,
              op_nombre: userName,
              op_usuario: userUsuario || "",
              op_sucursal: userSuc,
              op_autorizar: permisosAutorizarPedido,
              op_ver_utilidad: permisoVerUtilidad,
              op_ver_proveedor: permisoVerProveedor,
              op_aplicar_descuento: permisos_descuento,
              op_movimiento: movimiento,
              or_rol: rol,
              permisos_menu: parsedPermisosMenu,
            };

            set({
              token,
              usuario,
              tokenExpiration,
              isLoading: false,
              lastActivity: new Date().getTime()
            });

            // Configurar axios headers
            axios.defaults.headers.common["Authorization"] = token;
          } else {
            set({ isLoading: false });
          }
        },
        
        login: (data) => {
          const expirationTime = new Date().getTime() + 30 * 60 * 1000;
          
          // Guardar en sessionStorage para compatibilidad
          sessionStorage.setItem("token", `Bearer ${data.token}`);
          sessionStorage.setItem("user_id", data.usuario[0].op_codigo);
          sessionStorage.setItem("user_name", data.usuario[0].op_nombre);
          sessionStorage.setItem("user_suc", data.usuario[0].op_sucursal);
          sessionStorage.setItem("user_usuario", data.usuario[0].op_usuario);
          sessionStorage.setItem("permisos_autorizar_pedido", data.usuario[0].op_autorizar.toString());
          sessionStorage.setItem("operador_movimiento", data.usuario[0].op_movimiento.toString());
          sessionStorage.setItem("permiso_ver_utilidad", data.usuario[0].op_ver_utilidad.toString());
          sessionStorage.setItem("permiso_ver_proveedor", data.usuario[0].op_ver_proveedor.toString());
          sessionStorage.setItem("token_expiration", expirationTime.toString());
          sessionStorage.setItem("permisos_descuento", data.usuario[0].op_aplicar_descuento.toString());
          sessionStorage.setItem("rol", data.usuario[0].or_rol ? data.usuario[0].or_rol.toString() : "7");
          sessionStorage.setItem("permisos_menu", JSON.stringify(data.usuario[0].permisos_menu));
          
          set({
            token: `Bearer ${data.token}`,
            usuario: data.usuario[0],
            tokenExpiration: expirationTime,
            isLoading: false,
            lastActivity: new Date().getTime()
          });

          // Configurar axios headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        },
        
        logout: () => {
          // Limpiar sessionStorage
          sessionStorage.clear();
          set({
            token: null,
            usuario: null,
            tokenExpiration: null,
            isLoading: false,
            lastActivity: new Date().getTime()
          });

          // Limpiar axios headers
          delete axios.defaults.headers.common["Authorization"];
        },
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        updateActivity: () => {
          set({ lastActivity: new Date().getTime() });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          token: state.token, 
          usuario: state.usuario,
          tokenExpiration: state.tokenExpiration,
          lastActivity: state.lastActivity
        })
      }
    )
  );