import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthState {
  token: string;
  userId: string;
  userName: string;
  userSuc: string;
  permisosAutorizarPedido: number;
  permisoVerUtilidad: number;
  permisoVerProveedor: number;
  tokenExpiration: number
  rol: number
  movimiento: number
  permisos_menu: {
    acceso: number;
    menu_id: number;
    menu_descripcion: string;
  }[]

}


interface LoginData {
  token: string;
  usuario: [{
    op_codigo: string;
    op_nombre: string;
    op_sucursal: string;
    op_autorizar: number;
    op_ver_utilidad: number;
    op_ver_proveedor: number;
    op_movimiento: number;
    rol: number
    permisos_menu: {
      acceso: number;
      menu_id: number;
      menu_descripcion: string;
    }[]
  }];
}

interface AuthContextType {
  auth: AuthState | null;
  login: (data: LoginData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date().getTime());
  const INACTIVITY_THRESHOLD = 10 * 60 * 1000;

  useEffect(() => {
    const loadAuthState = () => {
      const movimiento = localStorage.getItem('operador_movimiento');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('user_name');
      const userSuc = localStorage.getItem('user_suc');
      const permisosAutorizarPedido = Number(localStorage.getItem('permisos_autorizar_pedido'));
      const permisoVerUtilidad = Number(localStorage.getItem('permiso_ver_utilidad'));
      const permisoVerProveedor = Number(localStorage.getItem('permiso_ver_proveedor'));
      const tokenExpiration = Number(localStorage.getItem('token_expiration'));
      const rol = Number(localStorage.getItem('rol'));


      if (token && userId && userName && userSuc) {
        setAuth({ token, userId, userName, userSuc, permisosAutorizarPedido, permisoVerUtilidad, permisoVerProveedor, tokenExpiration, rol, movimiento: Number(movimiento), permisos_menu: [] });
        axios.defaults.headers.common['Authorization'] = token;
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
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  events.forEach(event => window.addEventListener(event, updateActivity));
  
  return () => {
    events.forEach(event => window.removeEventListener(event, updateActivity));
  };
}, []);

useEffect(() => {
  if (auth?.tokenExpiration) {
    const checkSession = setInterval(() => {
      const now = new Date().getTime();
      const inactiveTime = now - lastActivity;
      

      if (now > auth.tokenExpiration && inactiveTime >= INACTIVITY_THRESHOLD) {
        logout();
      }
    }, 1000);
    
    return () => clearInterval(checkSession);
  }
}, [auth?.tokenExpiration, lastActivity]);


  const login = (data: LoginData) => {
    const expirationTime = new Date().getTime() + (30 * 60 * 1000);


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
      permisos_menu: data.usuario[0].permisos_menu

    };


    localStorage.setItem('token', authData.token);
    localStorage.setItem('user_id', authData.userId);
    localStorage.setItem('user_name', authData.userName);
    localStorage.setItem('user_suc', authData.userSuc);
    localStorage.setItem('permisos_autorizar_pedido', authData.permisosAutorizarPedido.toString());
    localStorage.setItem('operador_movimiento', authData.userId);

    localStorage.setItem('permiso_ver_utilidad', authData.permisoVerUtilidad.toString());
    localStorage.setItem('permiso_ver_proveedor', authData.permisoVerProveedor.toString());
    localStorage.setItem('token_expiration', expirationTime.toString()); 
    localStorage.setItem('rol', authData.rol?  authData.rol.toString() : '7');
    localStorage.setItem('permisos_menu', JSON.stringify(authData.permisos_menu));
    
    setAuth(authData);

    axios.defaults.headers.common['Authorization'] = authData.token;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_suc');
    localStorage.removeItem('permisos_autorizar_pedido');
    localStorage.removeItem('permiso_ver_utilidad');
    localStorage.removeItem('permiso_ver_proveedor');
    localStorage.removeItem('operador_movimiento');
    setAuth(null);
    localStorage.removeItem('token_expiration'); 
    localStorage.removeItem('permisos_menu');
    localStorage.removeItem('rol');

    delete axios.defaults.headers.common['Authorization'];
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};