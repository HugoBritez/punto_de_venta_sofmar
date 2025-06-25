import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VentaRapidaConfigState {
    sucursalSeleccionada: number | null;
    depositoSeleccionado: number | null;
    listaPrecioSeleccionada: number | null;
    tipoRenderizacion: "tabla" | "lista";
    tipoVenta: number; // 1 = Factura, 2 = Ticket
    
    // Actions
    setSucursalSeleccionada: (sucursalId: number) => void;
    setDepositoSeleccionado: (depositoId: number) => void;
    setListaPrecioSeleccionada: (listaPrecioId: number) => void;
    setTipoRenderizacion: (tipo: "tabla" | "lista") => void;
    setTipoVenta: (tipo: number) => void;
    resetConfig: () => void;
}

export const useVentaRapidaConfigStore = create<VentaRapidaConfigState>()(
    persist(
        (set) => ({
            sucursalSeleccionada: null,
            depositoSeleccionado: null,
            listaPrecioSeleccionada: null,
            tipoRenderizacion: "tabla",
            tipoVenta: 1,
            
            setSucursalSeleccionada: (sucursalId: number) => 
                set({ sucursalSeleccionada: sucursalId }),
            
            setDepositoSeleccionado: (depositoId: number) => 
                set({ depositoSeleccionado: depositoId }),
            
            setListaPrecioSeleccionada: (listaPrecioId: number) => 
                set({ listaPrecioSeleccionada: listaPrecioId }),
            
            setTipoRenderizacion: (tipo: "tabla" | "lista") => 
                set({ tipoRenderizacion: tipo }),
            
            setTipoVenta: (tipo: number) => 
                set({ tipoVenta: tipo }),
            
            resetConfig: () => set({ 
                sucursalSeleccionada: null, 
                depositoSeleccionado: null,
                listaPrecioSeleccionada: null,
                tipoRenderizacion: "tabla",
                tipoVenta: 1
            })
        }),
        {
            name: 'venta-rapida-config-storage',
            partialize: (state) => ({ 
                sucursalSeleccionada: state.sucursalSeleccionada,
                depositoSeleccionado: state.depositoSeleccionado,
                listaPrecioSeleccionada: state.listaPrecioSeleccionada,
                tipoRenderizacion: state.tipoRenderizacion,
                tipoVenta: state.tipoVenta
            })
        }
    )
); 