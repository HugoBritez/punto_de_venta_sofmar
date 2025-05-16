import { Configuraciones } from "@/shared/types/shared_interfaces";
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
    timbrado: string;
    factura: string;
    factura_valido_desde: string;
    factura_valido_hasta: string;
    detalles: {
        codigo: number;
        descripcion: string;
        cantidad: number;
        precio: number;
        total: number;
    }[];
}

const ModeloFactura = ({id_venta = 134812, monto_recibido = 0, vuelto = 0, onImprimir = false}: ModeloTicketProps) => {
    const [venta, setVenta] = useState<VentaTicket | null>(null);
    const [configuraciones, setConfiguraciones] = useState<Configuraciones[] | null>(null);
    const nombreEmpresa = configuraciones?.[0]?.valor || "N/A";
    const rucEmpresa = configuraciones?.[30]?.valor || "N/A";
    const rubroEmpresa = configuraciones?.[1]?.valor || "N/A";
    const telefonoEmpresa = configuraciones?.[2]?.valor || "N/A";
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
            const elemento = document.getElementById("factura");
            if (!elemento) {
              console.error("Elemento 'factura' no encontrado");
              return;
            }

            // Aumentamos el scale para mejor calidad
            const scale = 2;

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
            const imgWidth = pageWidth; // 10mm de margen en cada lado
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
                0,
                position,
                imgWidth,
                imgHeight
              );
              heightLeft -= pageHeight;
            }

            // Guardar el PDF
            pdf.save(`factura_venta_${id_venta}.pdf`);
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

    const formatNumber = (number: number) => {
        return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace('.', ',');
    }

    useEffect(() => {
      if (onImprimir) {
        generarPDF();
      }
    }, [onImprimir]);

  return (
    <div id="factura">
      <div className="flex flex-col w-full bg-white ">
        <div className="flex flex-col w-1/4 gap-1 justify-center items-center border-2 border-gray-300 rounded-md py-4">
          <div className="flex flex-row gap-2">
            <p className="text-2xl">{nombreEmpresa}</p>
            <p>-</p>
            <p className="text-2xl">{rucEmpresa}</p>
          </div>
          <p className="text-2xl">{rubroEmpresa}</p>
          <p className="text-2xl">{telefonoEmpresa}</p>
          <p>--------------------------------------------</p>
          <p className="text-2xl">Timbrado: {venta?.timbrado}</p>
          <p className="text-2xl">Valido desde: {venta?.factura_valido_desde}</p>
          <p className="text-2xl">Valido hasta: {venta?.factura_valido_hasta}</p>
          <p className="text-2xl">Nro: {venta?.factura}</p>
          <p className="text-2xl"> *** IVA INCLUIDO ***</p>
          <p className="text-2xl">
            --------------------------------------------
          </p>
          <p className="text-2xl">Fecha Emision:{fechaActual}</p>
          <p className="text-2xl">Cajero: {venta?.cajero}</p>
          <p className="text-2xl">Vendedor: {venta?.vendedor}</p>
          <p className="text-2xl">Cliente: {venta?.cliente}</p>
          <p className="text-2xl">RUC: {venta?.ruc}</p>
          <p className="text-2xl">Direccion: {venta?.direccion}</p>
          <p className="text-2xl">Telefono: {venta?.telefono}</p>
          <div>
            <div className="flex flex-row justify-between">
              <p className="text-2xl">Articulo</p>
              <p className="text-2xl">Cantidad</p>
              <p className="text-2xl">Precio</p>
            </div>
            <p className="text-center text-2xl">
              ----------------------------------------------
            </p>
            <div className="flex flex-col gap-2">
              {venta?.detalles.map((detalle) => (
                <div key={detalle.codigo} className="flex flex-row gap-2">
                  <p className="text-2xl">{detalle.descripcion}</p>
                  <p className="text-2xl">
                    {detalle.cantidad} x {detalle.precio}
                  </p>
                </div>
              ))}
              <p className="text-center">
                ----------------------------------------------
              </p>
            </div>
            <p className="text-2xl">Subtotal: {venta?.subtotal}</p>
            <p className="text-2xl">Descuento: {venta?.total_descuento}</p>
            <p className="text-2xl">Total a pagar: {venta?.total_a_pagar}</p>
            <p className="text-center text-2xl">
              ----------------------------------------------
            </p>
            <p className="text-2xl">Monto recibido: {monto_recibido}</p>
            <p className="text-2xl">Vuelto: {vuelto}</p>
            <p className="text-center text-2xl">
              ----------------------------------------------
            </p>
            <p className="text-center text-2xl">DETALLE POR CONCEPTOS</p>
            <p className="text-center text-2xl">
              ----------------------------------------------
            </p>
            <p className="text-2xl">T. Exentas: Gs. {venta?.total_exentas}</p>
            <p className="text-2xl">T. Gravadas 10%: Gs. {venta?.total_diez}</p>
            <p className="text-2xl">T. Gravadas 5%: Gs. {venta?.total_cinco}</p>
            <p className="text-2xl">
              Liq. IVA 5%: Gs.{" "}
              {venta?.total_cinco ? formatNumber(venta.total_cinco / 22) : 0}
            </p>
            <p className="text-2xl">
              Liq. IVA 10%: Gs.{" "}
              {venta?.total_diez ? formatNumber(venta.total_diez / 11) : 0}
            </p>
            <p className="text-2xl">
              Total Liq. IVA Gs.{" "}
              {formatNumber(
                (venta?.total_cinco ? venta.total_cinco / 22 : 0) +
                  (venta?.total_diez ? venta.total_diez / 11 : 0)
              )}
            </p>
          </div>
          <p className="text-center">
            ----------------------------------------------
          </p>
          <p className="text-2xl"> &lt;&lt;&lt; Gracias por su compra &gt;&gt;&gt; </p>
          <p className="text-2xl"> &lt;&lt;&lt; DUPLICADO ARCHIVO TRIBUTARIO&gt;&gt;&gt; </p>
          <p className="text-2xl"> &lt;&lt;&lt; ORIGINAL CLIENTE &gt;&gt;&gt; </p>
        </div>
      </div>
    </div>
  );
}

export default ModeloFactura
