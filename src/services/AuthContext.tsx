import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthState {
  token: string;
  userId: string;
  userName: string;
  userSuc: string;
  permisosAutorizarPedido: number;
  permisoVerUtilidad: number;
  tokenExpiration: number
  rol: number
}

interface LoginData {
  token: string;
  usuario: [{
    op_codigo: string;
    op_nombre: string;
    op_sucursal: string;
    op_autorizar: number;
    op_ver_utilidad: number;
    rol: number
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


  useEffect(() => {
    const loadAuthState = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('user_name');
      const userSuc = localStorage.getItem('user_suc');
      const permisosAutorizarPedido = Number(localStorage.getItem('permisos_autorizar_pedido'));
      const permisoVerUtilidad = Number(localStorage.getItem('permiso_ver_utilidad'));
      const tokenExpiration = Number(localStorage.getItem('token_expiration'));
      const rol = Number(localStorage.getItem('rol'));

      if (token && userId && userName && userSuc) {
        setAuth({ token, userId, userName, userSuc, permisosAutorizarPedido, permisoVerUtilidad, tokenExpiration, rol});
        axios.defaults.headers.common['Authorization'] = token;
      }
      setIsLoading(false);
    };

    loadAuthState();
  }, []);

  const login = (data: LoginData) => {
    const expirationTime = new Date().getTime() + (30 * 60 * 1000);

    console.log('Datos del login recibidos' ,data);

    const authData: AuthState = {
      token: `Bearer ${data.token}`,
      userId: data.usuario[0].op_codigo,
      userName: data.usuario[0].op_nombre,
      userSuc: data.usuario[0].op_sucursal,
      permisosAutorizarPedido: data.usuario[0].op_autorizar,
      permisoVerUtilidad: data.usuario[0].op_ver_utilidad,
      tokenExpiration: expirationTime,
      rol: data.usuario[0].rol
    };


    console.log('Datos del login a guardar en el localstorage' ,authData);

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user_id', authData.userId);
    localStorage.setItem('user_name', authData.userName);
    localStorage.setItem('user_suc', authData.userSuc);
    localStorage.setItem('permisos_autorizar_pedido', authData.permisosAutorizarPedido.toString());

    localStorage.setItem('permiso_ver_utilidad', authData.permisoVerUtilidad.toString());

    localStorage.setItem('rol', authData.rol?  authData.rol.toString() : '7');
    
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
    setAuth(null);
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