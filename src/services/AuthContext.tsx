import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface AuthState {
  token: string;
  userId: string;
  userName: string;
  userSuc: string;
  permisosAutorizarPedido: number;
  permisoVerUtilidad: number;
  permisoVerProveedor: number;
  tokenExpiration: number;
  rol: number;
  movimiento: number;
  permisos_menu: {
    acceso: number;
    menu_id: number;
    menu_descripcion: string;
  }[];
}

interface LoginData {
  token: string;
  usuario: [
    {
      op_codigo: string;
      op_nombre: string;
      op_sucursal: string;
      op_autorizar: number;
      op_ver_utilidad: number;
      op_ver_proveedor: number;
      op_movimiento: number;
      rol: number;
      permisos_menu: {
        acceso: number;
        menu_id: number;
        menu_descripcion: string;
        menu_grupo: number;
        menu_orden: number;
      }[];
    }
  ];


}

interface AuthContextType {
  auth: AuthState | null;
  login: (data: LoginData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date().getTime());
  const INACTIVITY_THRESHOLD = 10 * 60 * 1000;

  useEffect(() => {
    const loadAuthState = () => {
      const movimiento = sessionStorage.getItem("operador_movimiento");
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("user_id");
      const userName = sessionStorage.getItem("user_name");
      const userSuc = sessionStorage.getItem("user_suc");
      const permisosAutorizarPedido = Number(
        sessionStorage.getItem("permisos_autorizar_pedido")
      );
      const permisoVerUtilidad = Number(
        sessionStorage.getItem("permiso_ver_utilidad")
      );
      const permisoVerProveedor = Number(
        sessionStorage.getItem("permiso_ver_proveedor")
      );
      const tokenExpiration = Number(
        sessionStorage.getItem("token_expiration")
      );
      const rol = Number(sessionStorage.getItem("rol"));
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
        setAuth({
          token,
          userId,
          userName,
          userSuc,
          permisosAutorizarPedido,
          permisoVerUtilidad,
          permisoVerProveedor,
          tokenExpiration,
          rol,
          movimiento: Number(movimiento),
          permisos_menu: parsedPermisosMenu,
        });
        axios.defaults.headers.common["Authorization"] = token;
      }

      setIsLoading(false);
    };

    

    loadAuthState();
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      const currentTime = new Date().getTime();
      setLastActivity(currentTime);
    };
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  useEffect(() => {
    if (auth?.tokenExpiration) {
      const checkSession = setInterval(() => {
        const now = new Date().getTime();
        const inactiveTime = now - lastActivity;

        if (
          now > auth.tokenExpiration &&
          inactiveTime >= INACTIVITY_THRESHOLD
        ) {
          logout();
        }
      }, 1000);

      return () => clearInterval(checkSession);
    }
  }, [auth?.tokenExpiration, lastActivity]);

  const login = (data: LoginData) => {
    const expirationTime = new Date().getTime() + 30 * 60 * 1000;

    const permisosMenu = Array.isArray(data.usuario[0].permisos_menu)
      ? data.usuario[0].permisos_menu
      : [];

    const authData: AuthState = {
      token: `Bearer ${data.token}`,
      userId: data.usuario[0].op_codigo,
      userName: data.usuario[0].op_nombre,
      userSuc: data.usuario[0].op_sucursal,
      permisosAutorizarPedido: data.usuario[0].op_autorizar,
      permisoVerUtilidad: data.usuario[0].op_ver_utilidad,
      permisoVerProveedor: data.usuario[0].op_ver_proveedor,
      tokenExpiration: expirationTime,
      rol: data.usuario[0].rol,
      movimiento: data.usuario[0].op_movimiento,
      permisos_menu: permisosMenu,
    };

    sessionStorage.setItem("token", authData.token);
    sessionStorage.setItem("user_id", authData.userId);
    sessionStorage.setItem("user_name", authData.userName);
    sessionStorage.setItem("user_suc", authData.userSuc);
    sessionStorage.setItem(
      "permisos_autorizar_pedido",
      authData.permisosAutorizarPedido.toString()
    );
    sessionStorage.setItem(
      "operador_movimiento",
      authData.movimiento.toString()
    );
    sessionStorage.setItem(
      "permiso_ver_utilidad",
      authData.permisoVerUtilidad.toString()
    );
    sessionStorage.setItem(
      "permiso_ver_proveedor",
      authData.permisoVerProveedor.toString()
    );
    sessionStorage.setItem("token_expiration", expirationTime.toString());
    sessionStorage.setItem("rol", authData.rol ? authData.rol.toString() : "7");
    sessionStorage.setItem(
      "permisos_menu",
      JSON.stringify(authData.permisos_menu)
    );

    setAuth(authData);

    console.log("authData", authData);

    axios.defaults.headers.common["Authorization"] = authData.token;

  };


  const logout = () => {
    sessionStorage.clear();
    setAuth(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
