import { api_url } from "@/utils";
import axios from "axios";
import jsPDF from "jspdf";
import { useEffect } from "react";
import { useState } from "react";
import html2canvas from "html2canvas";
import { Button, Input, InputGroup, InputLeftElement, useToast } from "@chakra-ui/react";
import { Vendedor } from "@/types/shared_interfaces";
import { SearchIcon } from "@chakra-ui/icons";
import FloatingCard from "@/modules/FloatingCard";

interface StickerData {
  pedido_id: number;
  cantidad_cajas: number;
  cliente_id: number;
  cliente: string;
  ciudad: string;
  direccion: string;
  barrio: string;
}

interface StickerCajasProps {
  pedidoId: number | null;
  preparadoPor ? : String;
}

const StickerCajas = ({ pedidoId, preparadoPor }: StickerCajasProps) => {
  const [stickerData, setStickerData] = useState<StickerData | null>(null);
  const [preparadores, setPreparadores] = useState<Vendedor[]>([]);
  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);
  const [preparadorBusqueda, setPreparadorBusqueda] = useState<string>("");
  const toast = useToast();

    const getPreparadores = async (busqueda: string) => {
      try {
        const response = await axios.get(`${api_url}usuarios/preparadores`, {
          params: {
            buscar: busqueda,
          },
        });
        setPreparadores(response.data.body);
      } catch (error) {
        toast({
          title: "Error al cargar los preparadores",
          description: "Por favor, intenta de nuevo más tarde",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    
  const handleBusquedaPreparador = (busqueda: string) => {
    setPreparadorBusqueda(busqueda);
    getPreparadores(busqueda);
  };

  const handleSelectPreparador = (preparador: Vendedor) => {
    setPreparadorBusqueda(preparador.op_nombre);
    toast({
      title: "Preparador seleccionado",
      description: preparador.op_nombre,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setIsFloatingCardVisible(false);
  };

  useEffect(() => {
    const fetchStickerData = async () => {
      try {
        const response = await axios.get(`${api_url}pedidos/numero-cajas`, {
          params: {
            id: pedidoId,
          },
        });
        setStickerData(response.data.body[0]);
      } catch (error) {
        console.error("Error al obtener los datos del sticker:", error);
      }
    };
    fetchStickerData();
  }, [pedidoId]);

  if (!stickerData) {
    return <div>Cargando datos del sticker...</div>;
  }

const generarPDF = async () => {
  try {
    const elemento = document.getElementById("sticker-container");
    if (!elemento) {
      console.error("Elemento 'sticker-container' no encontrado");
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
    const imgWidth = pageWidth - 20; // 10mm de margen en cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Agregar la imagen al PDF
    let heightLeft = imgHeight;
    let position = 10; // Margen superior inicial

    // Primera página
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      10, // Margen izquierdo
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
    pdf.save(`stickers_pedido_${pedidoId}.pdf`);
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

  const stickers = Array.from(
    { length: stickerData.cantidad_cajas },
    (_, index) => (
      <div key={index} className="w-full h-full mb-4">
        <div
          style={{
            width: "25.5cm",
            height: "16cm",
            border: "3px solid black",
            margin: "0",
            position: "relative",
          }}
          className="rounded-md p-2 gap-8"
        >
          <div className="flex flex-row items-center border-b border-black gap-2 [&>p]:text-3xl py-4">
            <p className="font-bold">Cod. Cliente: </p>
            <p>{stickerData.cliente_id}</p>
          </div>
          <div className="flex flex-row items-center border-b border-black gap-2 [&>p]:text-3xl py-4">
            <p className="font-bold">Cliente:</p>
            <p>{stickerData.cliente}</p>
          </div>
          <div className="flex flex-row items-center border-b border-black gap-2 [&>p]:text-3xl py-4">
            <p className="font-bold">Direccion:</p>
            <p>{stickerData.direccion}</p>
          </div>
          <div className="flex flex-row items-center justify-between border-b border-black gap-2 py-4">
            <div className="flex flex-row items-center [&>p]:text-3xl">
              <p className="font-bold">Pedido Nro.</p>
              <p>{stickerData.pedido_id}</p>
            </div>
            <div className="flex flex-row items-center gap-2 [&>p]:text-3xl">
              <p className="font-bold">Caja:</p>
              <p>
                {index + 1}/{stickerData.cantidad_cajas}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between border-b border-black gap-4 pb-2 [&>div>p]:text-3xl py-4">
            <div className="flex flex-col items-center w-[50%] ">
              <p className="font-bold">Volumen</p>
              <div className="w-full h-20 border border-black"></div>
            </div>
            <div className="flex flex-col items-center w-[50%] ">
              <p className="font-bold">Peso</p>
              <div className="w-full h-20 border border-black"></div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between [&>p]:text-3xl py-4">
            <p className="font-bold">Preparado por:</p>
            <p>{new Date().toLocaleString()}</p>
          </div>
          <div className="flex flex-row items-center mt-6 gap-2 [&>p]:text-3xl">
            <p className="text-center font-bold">Verificado por:</p>
            <p>{preparadoPor}</p>
          </div>
        </div>
      </div>
    )
  );
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row justify-end w-full mb-4">
        <InputGroup position={"relative"} zIndex={2}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar preparador"
            value={preparadorBusqueda}
            onChange={(e) => handleBusquedaPreparador(e.target.value)}
            onClick={() => setIsFloatingCardVisible(true)}
            w={"300px"}
          />
          <FloatingCard<Vendedor>
            isVisible={isFloatingCardVisible}
            items={preparadores}
            onClose={() => setIsFloatingCardVisible(false)}
            onSelect={handleSelectPreparador}
            renderItem={(item) => <p>{item.op_nombre}</p>}
          />
        </InputGroup>
        <Button onClick={generarPDF} ml={2}>
          Generar PDF
        </Button>
      </div>
      <div
        className="w-full  py-4 grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-max justify-center items-center"
        id="sticker-container"
      >
        {stickers}
      </div>
    </div>
  );
};

export default StickerCajas;
