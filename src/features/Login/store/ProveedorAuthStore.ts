import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LoginProveedor } from "../types/LoginProveedorResponse.type";

interface ProveedorAuthStore {
    proveedor: LoginProveedor | null;
    token: string | null;
    proEsAdmin: number;
    sessionExpiration: number | null;
    setProveedor: (proveedor: LoginProveedor) => void;
    setToken: (token: string) => void;
    setProEsAdmin: (proEsAdmin: number) => void;
    setSessionExpiration: (expiration: number) => void;
    logout: () => void;
}

export const useProveedorAuthStore = create<ProveedorAuthStore>()(
    persist((set) => ({
        proveedor: null,
        token: null,
        proEsAdmin: 0,
        sessionExpiration: null,
        setProveedor: (proveedor) => set({ proveedor }),
        setToken: (token: string) => set({ token }),    
        setProEsAdmin: (proEsAdmin: number) => set({ proEsAdmin }),
        setSessionExpiration: (expiration: number) => set({ sessionExpiration: expiration }),
        logout: () => {
            // Limpiar localStorage
            localStorage.removeItem("proveedor-auth");
            // Limpiar sessionStorage
            sessionStorage.removeItem("proveedor-session-expiration");
            set({
                proveedor: null,
                token: null,
                proEsAdmin: 0,
                sessionExpiration: null,
            });
        },
    }), {
        name: "proveedor-auth",
        storage: createJSONStorage(() => localStorage),
    })
)
