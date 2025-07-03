import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PedidosConfigState {
    sucursalSeleccionada: number | null;
    depositoSeleccionado: number | null;
    listaPrecioSeleccionada: number | null;
    monedaSeleccionada: number | null;
    vendedorSeleccionado: number | null;
    
    // Actions
    setSucursalSeleccionada: (sucursalId: number) => void;
    setDepositoSeleccionado: (depositoId: number) => void;
    setListaPrecioSeleccionada: (listaPrecioId: number) => void;
    setMonedaSeleccionada: (monedaId: number) => void;
    setVendedorSeleccionado: (vendedorId: number) => void;
    resetConfig: () => void;
}

export const usePedidosConfigStore = create<PedidosConfigState>()(
    persist(
        (set) => ({
            sucursalSeleccionada: null,
            depositoSeleccionado: null,
            listaPrecioSeleccionada: null,
            monedaSeleccionada: null,
            vendedorSeleccionado: null,
            
            setSucursalSeleccionada: (sucursalId: number) => 
                set({ sucursalSeleccionada: sucursalId }),
            
            setDepositoSeleccionado: (depositoId: number) => 
                set({ depositoSeleccionado: depositoId }),
            
            setListaPrecioSeleccionada: (listaPrecioId: number) => 
                set({ listaPrecioSeleccionada: listaPrecioId }),
            
            setMonedaSeleccionada: (monedaId: number) => 
                set({ monedaSeleccionada: monedaId }),
            
            setVendedorSeleccionado: (vendedorId: number) => 
                set({ vendedorSeleccionado: vendedorId }),
            
            resetConfig: () => set({ 
                sucursalSeleccionada: null, 
                depositoSeleccionado: null,
                listaPrecioSeleccionada: null,
                monedaSeleccionada: null,
                vendedorSeleccionado: null
            })
        }),
        {
            name: 'pedidos-config-storage',
            partialize: (state) => ({ 
                sucursalSeleccionada: state.sucursalSeleccionada,
                depositoSeleccionado: state.depositoSeleccionado,
                listaPrecioSeleccionada: state.listaPrecioSeleccionada,
                monedaSeleccionada: state.monedaSeleccionada,
                vendedorSeleccionado: state.vendedorSeleccionado
            })
        }
    )
);