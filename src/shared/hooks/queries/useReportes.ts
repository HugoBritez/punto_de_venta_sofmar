import { useQuery } from "@tanstack/react-query";
import { getPedidosFacturados, PedidosFacturadosProps } from "@/repos/reportesRepository";

export const usePedidosFacturados = (props: PedidosFacturadosProps) => {
    return useQuery({
        queryKey: ["pedidos-facturados", props],
        queryFn: () => getPedidosFacturados(props),
        enabled: !!props.fechaDesde && !!props.fechaHasta,
        retry: false,
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    })
}