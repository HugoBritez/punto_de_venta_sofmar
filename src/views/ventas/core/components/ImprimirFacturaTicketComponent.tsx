import ModeloFacturaNuevo from "@/views/facturacion/ModeloFacturaNuevo";
import { createRoot } from "react-dom/client";

interface ImprimirFacturaTicketComponentProps {
    ventaId: number;
    accion: "print" | "download" | "b64"
    montoEntregado: number;
    montoRecibido: number;
    vuelto: number;
    onImprimir: boolean;
}

export const ImprimirFacturaTicketComponent = ({ ventaId, accion, montoEntregado, montoRecibido, vuelto, onImprimir }: ImprimirFacturaTicketComponentProps) => {

    const facturaDiv = document.createElement("div");
    facturaDiv.style.display = "none";
    document.body.appendChild(facturaDiv);

    const root = createRoot(facturaDiv);
    root.render(
        <ModeloFacturaNuevo
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