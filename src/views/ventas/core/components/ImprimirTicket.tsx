import ModeloTicket from "@/views/facturacion/ModeloTicket";
import { createRoot } from "react-dom/client";

interface ImprimirTicketComponentProps {
    ventaId: number;
    accion: "print" | "download" | "b64"
    montoEntregado: number;
    montoRecibido: number;
    vuelto: number;
    onImprimir: boolean;
}

export const ImprimirTicketComponent = ({ ventaId, accion, montoEntregado, montoRecibido, vuelto, onImprimir }: ImprimirTicketComponentProps) => {

    const facturaDiv = document.createElement("div");
    facturaDiv.style.display = "none";
    document.body.appendChild(facturaDiv);

    const root = createRoot(facturaDiv);
    root.render(
        <ModeloTicket
            id_venta={ventaId}
            accion={accion}
            monto_entregado={montoEntregado}
            monto_recibido={montoRecibido}
            vuelto={vuelto}
            onImprimir={onImprimir}
        />
    );
    setTimeout(() => {
        root.unmount();
        document.body.removeChild(facturaDiv);
    }, 2000);
}