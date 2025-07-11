import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LoginProveedor } from "../types/LoginProveedorResponse.type";

interface ProveedorAuthStore {
    proveedor: LoginProveedor | null;
    token: string | null;
    proEsAdmin: number;
    setProveedor: (proveedor: LoginProveedor) => void;
    setProEsAdmin: (proEsAdmin: number) => void;
}   

export const useProveedorAuthStore = create<ProveedorAuthStore>()(
    persist((set) => ({
        proveedor: null,
        token: null,
        proEsAdmin: 0,
        setProveedor: (proveedor) => set({ proveedor }),
        setToken: (token: string) => set({ token }),    
        setProEsAdmin: (proEsAdmin: number) => set({ proEsAdmin }),
    }), {
        name: "proveedor-auth",
        storage: createJSONStorage(() => localStorage),
    })
)
