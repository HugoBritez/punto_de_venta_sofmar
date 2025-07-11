import { useQuery } from "@tanstack/react-query";
import { getConsultaVentas } from "../repos/proveedoresPublicRepo";

export const useConsultaProveedores = (fechaDesde: string, fechaHasta: string, proveedor: number, cliente?: number | null) => {
    return useQuery({
        queryKey: ['consulta-ventas-proveedores', fechaDesde, fechaHasta, proveedor, cliente],
        queryFn: () => {
            console.log('Ejecutando consulta con parámetros:', { fechaDesde, fechaHasta, proveedor, cliente });
            return getConsultaVentas(fechaDesde, fechaHasta, proveedor, cliente);
        },
        enabled: !!fechaDesde && !!fechaHasta && !!proveedor,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    })
}