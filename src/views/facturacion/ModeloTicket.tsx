import { Configuraciones } from "@/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ModeloTicketProps {
    id_venta?: number;
    monto_entregado?: number;
    monto_recibido?: number;
    vuelto?: number;
    onImprimir?: boolean;
}

interface VentaTicket {
    codigo: number;
    tipo_venta: string;
    fecha_venta: string;
    fecha_vencimiento: string;
    cajero: string;
    vendedor: string;
    cliente: string;
    direccion: string;
    telefono: string;
    ruc: string;
    subtotal: number;
    total_descuento: number;
    total_a_pagar: number;
    total_exentas: number;
    total_diez: number;
    total_cinco: number;
    detalles: {
        codigo: number;
        descripcion: string;
        cantidad: number;
        precio: number;
        total: number;
    }[];
}

const ModeloTicket = ({id_venta = 134812, monto_entregado = 0, monto_recibido = 0, vuelto = 0, onImprimir = false}: ModeloTicketProps) => {
    const [venta, setVenta] = useState<VentaTicket | null>(null);
    const [configuraciones, setConfiguraciones] = useState<Configuraciones[] | null>(null);
    const nombreEmpresa = configuraciones?.[0]?.valor || "N/A";
    const rucEmpresa = configuraciones?.[30]?.valor || "N/A";
    const fechaActual = new Date().toLocaleDateString('es-PY', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const toast = useToast()


    const generarPDF = async () => {
      try {
        const elemento = document.getElementById("ticket");
        if (!elemento) {
          console.error("Elemento 'ticket' no encontrado");
          return;
        }

        // Aumentamos el scale para mejor calidad
        const scale = 4;

        // Configuración específica para html2canvas
        const canvas = await html2canvas(elemento, {
          scale: scale,
          useCORS: true,
          logging: true,
          width: elemento.offsetWidth,
          height: elemento.offsetHeight,
          windowWidth: elemento.scrollWidth,
          windowHeight: elemento.scrollHeight,
        });

        // Crear PDF en formato A4
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        // Dimensiones de A4 en mm
        const pageWidth = 210;
        const pageHeight = 297;

        // Calcular las dimensiones para mantener la proporción
        const imgWidth = pageWidth - 20; // 10mm de margen en cada lado
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Agregar la imagen al PDF
        let heightLeft = imgHeight;
        let position = 0; // Margen superior inicial

        // Primera página
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0, // Margen izquierdo
          position,
          imgWidth,
          imgHeight
        );

        // Si el contenido es más alto que una página, agregar más páginas
        while (heightLeft >= pageHeight) {
          position = heightLeft - pageHeight;
          pdf.addPage();
          pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            10,
            position,
            imgWidth,
            imgHeight
          );
          heightLeft -= pageHeight;
        }

        // Guardar el PDF
        pdf.save(`ticket_venta_${id_venta}.pdf`);
      } catch (error) {
        console.error("Error al generar PDF:", error);
        toast({
          title: "Error al generar PDF",
          description: "Hubo un problema al generar el documento",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    useEffect(() => {
      if (onImprimir) {
        generarPDF();
      }
    }, [onImprimir]);



    const getConfiguraciones = async () =>{
        try{
            const response  = await axios.get(`${api_url}configuraciones/todos`)
            setConfiguraciones(response.data.body)
        }catch(error){
            console.error('Error al obtener las configuraciones:', error);
        }
    }

    const getVenta = async () => {
        try{
            const response = await axios.get(`${api_url}venta/venta-imprimir`,
                {
                    params: {
                        ventaId: id_venta
                    }
                }
            )
            console.log(response.data.body)
            setVenta(response.data.body)
        }catch(error){
            console.error('Error al obtener la venta:', error);
        }
    }
    useEffect(() => {
        getConfiguraciones();
        getVenta();
    }, []);
    
  return (
    <div id="ticket">
      <div className="pl-8 pt-8 flex flex-col w-full bg-white ">
        <div className="flex flex-col w-1/6 gap-1 justify-center items-center border-2 border-gray-300 rounded-md">
          <div className="flex flex-row gap-2">
            <p>{nombreEmpresa}</p>
            <p>-</p>
            <p>{rucEmpresa}</p>
          </div>
          <p>{fechaActual}</p>
          <p>Venta Nro. {venta?.codigo}</p>
          <p>C. Venta: {venta?.tipo_venta}</p>
          <p>Vencimiento: {venta?.fecha_vencimiento}</p>
          <p>Cajero: {venta?.cajero}</p>
          <p>Vendedor: {venta?.vendedor}</p>
          <p>Cliente: {venta?.cliente}</p>
          <p>Direccion: {venta?.direccion}</p>
          <p>Telefono: {venta?.telefono}</p>
          <div>
            <div className="flex flex-row justify-between">
              <p>Articulo</p>
              <p>Cantidad</p>
              <p>Precio</p>
            </div>
            <p className="text-center">
              ----------------------------------------------
            </p>
            <div className="flex flex-col gap-2">
              {venta?.detalles.map((detalle) => (
                <div key={detalle.codigo} className="flex flex-row gap-2">
                  <p>{detalle.descripcion}</p>
                  <p>
                    {detalle.cantidad} x {detalle.precio}
                  </p>
                </div>
              ))}
              <p className="text-center">
                ----------------------------------------------
              </p>
            </div>
            <p>Subtotal: {venta?.subtotal}</p>
            <p>Descuento: {venta?.total_descuento}</p>
            <p>Total a pagar: {venta?.total_a_pagar}</p>
            <p className="text-center">
              ----------------------------------------------
            </p>
            <p>Monto entregado: {monto_entregado}</p>
            <p>Monto recibido: {monto_recibido}</p>
            <p>Vuelto: {vuelto}</p>
          </div>
          <p> &lt;&lt;&lt; No valido como comprobante fiscal &gt;&gt;&gt; </p>
          <p>
            {" "}
            &lt;&lt;&lt; Pasadas las 24hs, no se aceptan cambios ni devoluciones
            &gt;&gt;&gt;{" "}
          </p>
          <p> &lt;&lt;&lt; Gracias por su compra &gt;&gt;&gt; </p>
        </div>
      </div>
    </div>
  );
}

export default ModeloTicket
