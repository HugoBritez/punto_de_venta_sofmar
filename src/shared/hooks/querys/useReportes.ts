import { useQuery } from "@tanstack/react-query";
import { getPedidosFacturados, type PedidosFacturadosProps } from "../../api/reportesRepository";
import type { GetReporteMovimientoArticulosParams } from "../../types/reportes";
import { VentasRepository } from "../../api/ventasRepository";

export const usePedidosFacturados = (props: PedidosFacturadosProps) => {
    return useQuery({
        queryKey: ["pedidos-facturados", props],
        queryFn: () => getPedidosFacturados(props),
        enabled: Boolean(props.fechaDesde && props.fechaHasta),
        staleTime: 1000 * 60,
    })
}


export const useGetReporteMovimientoArticulos = (params: GetReporteMovimientoArticulosParams | null) => {
    return useQuery({
        queryKey: ['reporte-movimiento-articulos', params],
        queryFn: () => VentasRepository.GetReporteMovimientoArticulos(params!),
        enabled: Boolean(params && params.AnioInicio && params.VendedorId),
        staleTime: 1000 * 60,
    })
}