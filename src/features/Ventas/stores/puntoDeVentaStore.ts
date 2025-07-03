import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PuntoDeVentaMobileState {
    sucursalSeleccionada: number | null;
    depositoSeleccionado: number | null;
    listaPrecioSeleccionada: number | null;
    monedaSeleccionada: number | null;
    tipoDocumento: "FACTURA" | "TICKET" | "NOTA INTERNA";
    condicion: number; // 0 = Contado, 1 = Crédito
    
    // Actions
    setSucursalSeleccionada: (sucursalId: number) => void;
    setDepositoSeleccionado: (depositoId: number) => void;
    setListaPrecioSeleccionada: (listaPrecioId: number) => void;
    setMonedaSeleccionada: (monedaId: number) => void;
    setTipoDocumento: (tipo: "FACTURA" | "TICKET" | "NOTA INTERNA") => void;
    setCondicion: (condicion: number) => void;
    resetConfig: () => void;
}

export const usePuntoDeVentaMobileStore = create<PuntoDeVentaMobileState>()(
    persist(
        (set) => ({
            sucursalSeleccionada: null,
            depositoSeleccionado: null,
            listaPrecioSeleccionada: null,
            monedaSeleccionada: null,
            tipoDocumento: "FACTURA",
            condicion: 0,
            
            setSucursalSeleccionada: (sucursalId: number) => 
                set({ sucursalSeleccionada: sucursalId }),
            
            setDepositoSeleccionado: (depositoId: number) => 
                set({ depositoSeleccionado: depositoId }),
            
            setListaPrecioSeleccionada: (listaPrecioId: number) => 
                set({ listaPrecioSeleccionada: listaPrecioId }),
            
            setMonedaSeleccionada: (monedaId: number) => 
                set({ monedaSeleccionada: monedaId }),
            
            setTipoDocumento: (tipo: "FACTURA" | "TICKET" | "NOTA INTERNA") => 
                set({ tipoDocumento: tipo }),
            
            setCondicion: (condicion: number) => 
                set({ condicion: condicion }),
            
            resetConfig: () => set({ 
                sucursalSeleccionada: null, 
                depositoSeleccionado: null,
                listaPrecioSeleccionada: null,
                monedaSeleccionada: null,
                tipoDocumento: "FACTURA",
                condicion: 0
            })
        }),
        {
            name: 'punto-de-venta-mobile-config-storage',
            partialize: (state) => ({ 
                sucursalSeleccionada: state.sucursalSeleccionada,
                depositoSeleccionado: state.depositoSeleccionado,
                listaPrecioSeleccionada: state.listaPrecioSeleccionada,
                monedaSeleccionada: state.monedaSeleccionada,
                tipoDocumento: state.tipoDocumento,
                condicion: state.condicion
            })
        }
    )
);