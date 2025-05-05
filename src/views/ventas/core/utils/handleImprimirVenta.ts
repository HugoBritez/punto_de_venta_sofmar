import { ImprimirFacturaTicketComponent } from "../components/ImprimirFacturaTicketComponent";
import { ImprimirTicketComponent } from "../components/ImprimirTicket";

interface HandleImprimirVentaProps {
    ventaId: number;
    accion: "print" | "download" | "b64"
    montoEntregado: number;
    montoRecibido: number;
    vuelto: number;
    onImprimir: boolean;
    imprimirFactura: boolean;
}

export const handleImprimirVenta = async (props: HandleImprimirVentaProps) => {
    if (props.imprimirFactura) {
        if (props.imprimirFactura) {
            await ImprimirFacturaTicketComponent({
                ventaId: props.ventaId,
                accion: props.accion,
                montoEntregado: props.montoEntregado,
                montoRecibido: props.montoRecibido,
                vuelto: props.vuelto,
                onImprimir: props.onImprimir
            });
        } else {
            await ImprimirTicketComponent({
                ventaId: props.ventaId,
                accion: props.accion,
                montoEntregado: props.montoEntregado,
                montoRecibido: props.montoRecibido,
                vuelto: props.vuelto,
                onImprimir: props.onImprimir
            })
        }
    }
}