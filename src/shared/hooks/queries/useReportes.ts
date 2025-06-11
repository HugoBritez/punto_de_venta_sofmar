import { useQuery } from "@tanstack/react-query";
import { getPedidosFacturados, PedidosFacturadosProps } from "@/repos/reportesRepository";

export const usePedidosFacturados = (props: PedidosFacturadosProps) => {
    return useQuery({
        queryKey: ["pedidos-facturados", props],
        queryFn: () => getPedidosFacturados(props),
        enabled: Boolean(props.fechaDesde && props.fechaHasta),
        staleTime: 1000 * 60,
    })
}