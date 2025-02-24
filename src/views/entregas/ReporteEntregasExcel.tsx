import { api_url } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ReporteEntregas {
    id_pedido: number;
    fecha_pedido: string;
    deposito: string;
    sucursal: string;
    cliente: string;
    cantidad_cajas: number;
    verificado_por: string;
    preparado_por: string;
    cantidad_items: number;
    total_pedido: number;
    factura: string;
    fecha_factura: string;
}

interface ReporteEntregasProps {
    fechaDesde: string;
    fechaHasta: string;
}

const ReporteEntregasExcel = ({fechaDesde, fechaHasta, }: ReporteEntregasProps) => {
    const [datosReporte, setDatosReporte] = useState<ReporteEntregas[]>([]);
    const fechaActual = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit"
    });
    
    const traerDatos = async () => {
        try{
            const response = await axios.get(`${api_url}pedidos/reporte-de-preparacion`,
                {
                    params: {
                        fecha_desde: fechaDesde,
                        fecha_hasta: fechaHasta,
                    }
                }
            )
            setDatosReporte(response.data.body)
            generarExcelConFormato(response.data.body)
        } catch (error) {
            console.log(error);
        }
    }

    const generarExcelConFormato = (datos: typeof datosReporte) => {
        const ws = XLSX.utils.json_to_sheet(datos);

          ws['A1'].s = { font: { bold: true }, fill: { fgColor: { rgb: "4895e1" } } };
          ws["!cols"] = [
            { wch: 10 }, 
            { wch: 20 }, 
            { wch: 20 }, 
            { wch: 20 }, 
            { wch: 20 }, 
            { wch: 10 }, 
            { wch: 30 }, 
            { wch: 30 }, 
            { wch: 10 }, 
            { wch: 20 }, 
            { wch: 20 }, 
            { wch: 20 }, 
          ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte de Entregas");
        XLSX.writeFile(wb, `reporte_entregas_${fechaActual}.xlsx`);
    }

    useEffect(() => {
        traerDatos();
    }, [])

    return null;
}

export default ReporteEntregasExcel;