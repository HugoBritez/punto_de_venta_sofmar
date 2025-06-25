import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VerificadorConfigState {
    depositoSeleccionado: number | null;
    sucursalSeleccionada: number | null;
    
    // Actions
    setDepositoSeleccionado: (depositoId: number) => void;
    setSucursalSeleccionada: (sucursalId: number) => void;
    resetConfig: () => void;
}

export const useVerificadorConfigStore = create<VerificadorConfigState>()(
    persist(
        (set) => ({
            depositoSeleccionado: null,
            sucursalSeleccionada: null,
            
            setDepositoSeleccionado: (depositoId: number) => 
                set({ depositoSeleccionado: depositoId }),
            
            setSucursalSeleccionada: (sucursalId: number) => 
                set({ sucursalSeleccionada: sucursalId }),
            
            resetConfig: () => set({ 
                depositoSeleccionado: null, 
                sucursalSeleccionada: null 
            })
        }),
        {
            name: 'verificador-config-storage',
            partialize: (state) => ({ 
                depositoSeleccionado: state.depositoSeleccionado,
                sucursalSeleccionada: state.sucursalSeleccionada
            })
        }
    )
);