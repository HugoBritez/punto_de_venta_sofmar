import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse, Usuario } from '../types/auth';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAuthData: (data: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      setAuthData: (data: LoginResponse) => {
        // Tomamos el primer usuario del array ya que la API devuelve una lista
        const usuario = data.usuario[0];
        set({
          token: data.token,
          usuario,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // nombre para el almacenamiento persistente
    }
  )
);