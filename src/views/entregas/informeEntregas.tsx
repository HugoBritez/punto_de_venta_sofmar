import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Camion,
  Chofer,
  Configuraciones,
  Sucursal,
} from "@/types/shared_interfaces";
import { useEffect, useState } from "react";
import axios from "axios";
import { api_url } from "@/utils";
import { fetchCamiones as fetchCamionesAPI } from "@/views/entregas/fetchMetodos";
import { fetchChoferes as fetchChoferesAPI } from "@/views/entregas/fetchMetodos";
import {
  Flex,
  Input,
  ModalHeader,
  ModalCloseButton,
  Modal,
  ModalContent,
  useDisclosure,
  ModalOverlay,
  ModalBody,
  Button,
  ModalFooter,
  Divider,
} from "@chakra-ui/react";

interface ResumenEntregas {
  camion: string;
  chofer: string;
  codigo_ruteo: number;
  detalles: {
    cliente: string;
    estado: number;
    hora_entrada: string;
    hora_salida: string;
    diferencia_horas: string;
    id: number;
    monto: number;
    nro_factura: string;
    observacion: string;
    tipo_reparto: string;
  }[];
  estado_ruteo: string;
  fecha_ruteo: string;
  hora_llegada_ruteo: string;
  hora_salida_ruteo: string;
  km_actual: string;
  km_ultimo: string;
  moneda: string;
  sucursal: string;
  total_cobros: number;
  total_pagos: number;
  total_pedidos: number;
  total_ventas: number;
  total_monto: number;
  tiempo_total: string;
}

const InformeEntregas = () => {
  const [configuracionesEmpresa, setConfiguracionesEmpresa] = useState<
    Configuraciones[]
  >([]);

  const nombreEmpresa = configuracionesEmpresa[0]?.valor || "N/A";
  const rucEmpresa = configuracionesEmpresa[30]?.valor || "N/A";
  const fechaCompletaActual = new Date().toLocaleDateString();

  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fechaHasta, setFechaHasta] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState<
    number[]
  >([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [choferesSeleccionados, setChoferesSeleccionados] = useState<number[]>(
    []
  );
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [camionesSeleccionados, setCamionesSeleccionados] = useState<number[]>(
    []
  );
  const [resumenEntregas, setResumenEntregas] = useState<ResumenEntregas[]>([]);

  const tipoReparto = [
    {
      id: 1,
      tipo: "Pendientes",
    },
    {
      id: 2,
      tipo: "En camino",
    },
    {
      id: 3,
      tipo: "Entregados",
    },
    {
      id: 4,
      tipo: "Todos",
    },
  ];

  const [tipoRepartoSeleccionado, setTipoRepartoSeleccionado] = useState<
    number[]
  >([]);

  const {
    isOpen: isOpenSucursal,
    onOpen: onOpenSucursal,
    onClose: onCloseSucursal,
  } = useDisclosure();

  const {
    isOpen: isOpenChofer,
    onOpen: onOpenChofer,
    onClose: onCloseChofer,
  } = useDisclosure();

  const {
    isOpen: isOpenCamion,
    onOpen: onOpenCamion,
    onClose: onCloseCamion,
  } = useDisclosure();

  const {
    isOpen: isOpenTipoReparto,
    onOpen: onOpenTipoReparto,
    onClose: onCloseTipoReparto,
  } = useDisclosure();

  const fetchConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguracionesEmpresa(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursales(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCamiones = async () => {
    try {
      const response = await fetchCamionesAPI();
      setCamiones(response);
    } catch (error) {
      console.error("Error al obtener camiones:", error);
    }
  };

  const fetchChoferes = async () => {
    try {
      const response = await fetchChoferesAPI();
      setChoferes(response);
    } catch (error) {
      console.error("Error al obtener choferes:", error);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
    fetchSucursales();
    fetchCamiones();
    fetchChoferes();
  }, []);

  const fetchResumenEntregas = async () => {
    try {
      const response = await axios.get(`${api_url}reparto/resumen-repartos`, {
        params: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          sucursales: sucursalesSeleccionadas,
          choferes: choferesSeleccionados,
          camiones: camionesSeleccionados,
          tipos: tipoRepartoSeleccionado,
        },
      });
      console.log(response.data.body);

      setResumenEntregas(response.data.body);
    } catch (error) {
      console.error("Error al obtener el resumen de entregas:", error);
    }
  };

  const generarPDF = async () => {
    const elemento = document.getElementById("reporte");
    if (!elemento) return;

    // Generar el canvas a partir del elemento
    const canvas = await html2canvas(elemento, {
      scrollX: 0,
      scrollY: 0,
      windowWidth: elemento.scrollWidth,
      windowHeight: elemento.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");

    // Dimensiones del PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Dimensiones del canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    let yOffset = 0; // Posición vertical para empezar a recortar
    const marginTop = 8; // Margen superior para las páginas adicionales
    const marginBottom = 24; // Margen inferior
    let pageNumber = 1; // Número de página inicial

    while (yOffset < canvasHeight) {
      // Crear un canvas temporal para la sección de la página actual
      const pageCanvas = document.createElement("canvas");
      // Ajustar el tamaño de la página con margen inferior
      const pageHeight = Math.min(
        canvasHeight - yOffset,
        (canvasWidth * (pdfHeight - marginTop - marginBottom)) / pdfWidth
      );

      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) {
        console.error("No se pudo obtener el contexto 2D del canvas.");
        return;
      }

      context.drawImage(
        canvas,
        0,
        yOffset,
        canvasWidth,
        pageHeight, // Parte del canvas original
        0,
        0,
        canvasWidth,
        pageHeight // Dibujo en el nuevo canvas
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageHeightScaled = (pageHeight * pdfWidth) / canvasWidth;

      if (yOffset > 0) {
        pdf.addPage();
      }

      // Dibujar líneas y cuadros
      pdf.setDrawColor(145, 158, 181);
      pdf.setLineWidth(0.3);
      pdf.rect(5, marginTop - 5, pdfWidth - 10, 32); // Cuadro principal
      pdf.line(5, marginTop + 2, pdfWidth - 5, marginTop + 2); // Línea debajo de la cabecera
      pdf.line(5, marginTop + 20, pdfWidth - 5, marginTop + 20); // Línea debajo de la información adicional

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      pdf.text(`Empresa: ${nombreEmpresa}`, 15, marginTop);
      pdf.text(`RUC: ${rucEmpresa}`, pdfWidth / 2, marginTop);
      pdf.text(
        `${fechaCompletaActual} - ${localStorage.getItem("user_name")}`,
        pdfWidth - 40,
        marginTop
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Informe de entregas", pdfWidth / 2, marginTop + 8, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.text(`Fecha desde: ${fechaDesde}`, 10, marginTop + 12);
      pdf.text(`Fecha hasta: ${fechaHasta}`, 10, marginTop + 16);
      pdf.text(
        `Sucursales: ${
          sucursalesSeleccionadas &&
          sucursalesSeleccionadas.length === sucursales.length
            ? "Todos"
            : sucursalesSeleccionadas && sucursalesSeleccionadas?.length > 0
            ? sucursalesSeleccionadas?.map((dep) => dep).join(", ")
            : "Ninguno en especifico"
        }`,
        pdfWidth / 2 - 15,
        marginTop + 12
      );

      pdf.text(
        `Choferes: ${
          choferesSeleccionados &&
          choferesSeleccionados.length === choferes.length
            ? "Todos"
            : choferesSeleccionados && choferesSeleccionados?.length > 0
            ? choferesSeleccionados?.map((dep) => dep).join(", ")
            : "Ninguno en especifico"
        }`,
        pdfWidth / 2 - 15,
        marginTop + 16
      );

      pdf.text(
        `Camiones: ${
          camionesSeleccionados &&
          camionesSeleccionados.length === camiones.length
            ? "Todos"
            : camionesSeleccionados && camionesSeleccionados?.length > 0
            ? camionesSeleccionados?.map((dep) => dep).join(", ")
            : "Ninguno en especifico"
        }`,
        pdfWidth - 60,
        marginTop + 12
      );
      pdf.text(
        `Estados: ${
          tipoRepartoSeleccionado &&
          tipoRepartoSeleccionado.length === tipoReparto.length
            ? "Todos"
            : tipoRepartoSeleccionado && tipoRepartoSeleccionado?.length > 0
            ? tipoRepartoSeleccionado?.map((dep) => dep).join(", ")
            : "Ninguno en especifico"

        }`,
        pdfWidth - 60,
        marginTop + 16
      );


      pdf.text(`Página: ${pageNumber}`, 10, marginTop + 24);
      pageNumber++;

      // Agregar la imagen de la página
      pdf.addImage(
        pageImgData,
        "PNG",
        0,
        marginTop + 30,
        pdfWidth,
        pageHeightScaled - marginBottom
      );

      yOffset += pageHeight;
    }

    pdf.save(`reporte_ventas_${fechaCompletaActual}.pdf`);
  };

  return (
    <Flex flexDirection="column" height="100vh" bg={"gray.100"} p={2}>
      <Flex
        flexDir={"column"}
        bg={"white"}
        p={2}
        borderRadius={"md"}
        w={"100%"}
        h={"100%"}
      >
        <Flex
          flexDir={"row"}
          gap={2}
          border={"1px "}
          borderColor={"gray.300"}
          rounded={"md"}
          p={4}
        >
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Sucursal"
            readOnly
            onClick={onOpenSucursal}
            value={
              sucursalesSeleccionadas.length > 0
                ? sucursalesSeleccionadas.map((sucursal) => sucursal).join(", ")
                : undefined
            }
          />
          <Input
            type="text"
            placeholder="Chofer"
            readOnly
            onClick={onOpenChofer}
            value={
              choferesSeleccionados.length > 0
                ? choferesSeleccionados.map((chofer) => chofer).join(", ")
                : undefined
            }
          />
          <Input
            type="text"
            placeholder="Camion"
            readOnly
            onClick={onOpenCamion}
            value={
              camionesSeleccionados.length > 0
                ? camionesSeleccionados.map((camion) => camion).join(", ")
                : undefined
            }
          />
          <Input
            type="text"
            placeholder="Tipo de reparto"
            readOnly
            value={
              tipoRepartoSeleccionado.length > 0
                ? tipoRepartoSeleccionado.map((tipo) => tipo).join(", ")
                : undefined
            }
            onClick={onOpenTipoReparto}
          />
          <Flex flexDir={"row"} gap={2}>
            <Button
              colorScheme="red"
              onClick={() => {
                setSucursalesSeleccionadas([]);
                setChoferesSeleccionados([]);
                setCamionesSeleccionados([]);
                setResumenEntregas([]);
              }}
            >
              Limpiar
            </Button>
            <Button colorScheme="blue" onClick={fetchResumenEntregas}>
              Procesar
            </Button>
            <Button
              colorScheme="green"
              isDisabled={resumenEntregas.length === 0}
              onClick={generarPDF}
            >
              Imprimir
            </Button>
          </Flex>
        </Flex>

        <Flex
          flexDir={"column"}
          w={"100%"}
          bg={"white"}
          rounded={"md"}
          px={16}
          mt={4}
        >
          <div className="w-full">
            <div className="border border-gray-300 rounded-md p-2">
              <div className="flex flex-row gap-2 justify-between items-center mb-1">
                <p className="font-semibold">Empresa: {nombreEmpresa}</p>
                <p className="font-semibold">RUC: {rucEmpresa}</p>
                <div>
                  <p className="font-semibold">{fechaCompletaActual}</p>
                  <p className="font-semibold">
                    {localStorage.getItem("user_name")}
                  </p>
                </div>
              </div>
              <Divider />
              <p className="text-2xl font-bold text-center my-2">
                Informe de entrega de pedidos
              </p>
              <div className="flex flex-row gap-2  items-center">
                <div className="flex flex-1 flex-col gap-2">
                  <p>
                    <strong>Fecha desde:</strong> {fechaDesde}
                  </p>
                  <p>
                    <strong>Fecha hasta:</strong> {fechaHasta}
                  </p>
                  <p>
                    <strong>Sucursales:</strong>{" "}
                    {sucursalesSeleccionadas.length > 0
                      ? sucursalesSeleccionadas
                          .map((sucursal) => sucursal)
                          .join(", ")
                      : "Ninguno en especifico"}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <p>
                    <strong>Choferes:</strong>{" "}
                    {choferesSeleccionados.length > 0
                      ? choferesSeleccionados.map((chofer) => chofer).join(", ")
                      : "Ninguno en especifico"}
                  </p>
                  <p>
                    <strong>Camiones:</strong>{" "}
                    {camionesSeleccionados.length > 0
                      ? camionesSeleccionados.map((camion) => camion).join(", ")
                      : "Ninguno en especifico"}
                  </p>
                </div>
              </div>
              <Divider />
              <div className="flex flex-row gap-2 justify-between items-center my-2">
                <p className="font-semibold">
                  Total de entregas: {resumenEntregas.length}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 my-2 w-full px-8" id="reporte">
            {resumenEntregas.map((entrega) => (
              <div className="border border-gray-300 rounded-sm p-2 mb-2">
                <div className="flex flex-row gap-2 justify-between items-center">
                  <p className="font-semibold">
                    Entrega #{entrega.codigo_ruteo}
                  </p>
                  <p className="font-semibold">{entrega.fecha_ruteo}</p>
                  <p className="font-semibold">Sucursal: {entrega.sucursal}</p>
                </div>
                <Divider />
                <div className="flex flex-row gap-2 justify-between items-center">
                  <p className="font-semibold">Chofer: {entrega.chofer}</p>
                  <p className="font-semibold">Camion: {entrega.camion}</p>
                  <p className="font-semibold">
                    Estado: {entrega.estado_ruteo}
                  </p>
                </div>
                <Divider />
                <div className="flex flex-row  justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Hora salida: {entrega.hora_salida_ruteo}
                    </p>
                    <p className="font-semibold">
                      Hora llegada: {entrega.hora_llegada_ruteo}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Km salida: {entrega.km_actual}
                    </p>

                    <p className="font-semibold">
                      Km llegada: {entrega.km_ultimo}
                    </p>
                  </div>
                </div>
                <Divider />
                <p className="text-center font-bold my-2">
                  Detalles de entrega
                </p>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Tipo Reparto
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Razón Social
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Nro. Factura
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Importe
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Hora llegada
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Hora Salida
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Tiempo
                      </th>
                      <th className="border border-gray-300 px-4 py-1 text-left">
                        Observación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrega.detalles.map((detalle) => (
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.tipo_reparto}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.cliente}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.nro_factura}
                        </td>

                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.monto}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.hora_entrada}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.hora_salida}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.diferencia_horas}
                        </td>
                        <td className="border border-gray-300 px-4 py-1">
                          {detalle.observacion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-row gap-8 justify-end items-center">
                  <p className="text-center font-bold my-2">
                    Total de entregas: {entrega.detalles.length}
                  </p>
                  <p className="text-center font-bold my-2">
                    Tiempo total: {entrega.tiempo_total}
                  </p>
                  <p className="text-center font-bold my-2">
                    Total importe: {entrega.total_monto}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2  my-2 border border-gray-300 rounded-md p-2">
              <div className="flex flex-row gap-2 justify-around items-center w-full mt-12">
                <div>
                  <p>
                    .........................................................................
                  </p>
                  <p className="text-center font-bold my-2">
                    {localStorage.getItem("user_name")}
                  </p>
                </div>
                <div>
                  <p>
                    .........................................................................
                  </p>
                  <p className="text-center font-bold my-2">Supervisor</p>
                </div>
                <div>
                  <p>
                    .........................................................................
                  </p>
                  <p className="text-center font-bold my-2">Gerente</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-center text-2xl font-bold my-2">
                  Rendicion para caja:
                </p>

                <table className="w-1/2 mx-auto border border-gray-300">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Total en Efectivo
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Total en Cheques
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Total en Transferencias
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        POS/QR
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Monto Total
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold w-3/4"></td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-1/2 mx-auto border border-gray-300 mt-4">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Firma y aclaracion del responsable
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold w-1/4">
                        Firma y aclaracion del tesorero
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right w-3/4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Flex>
      </Flex>

      <Modal isOpen={isOpenSucursal} onClose={onCloseSucursal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sucursales</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2}>
              {sucursales.map((sucursal) => (
                <Flex
                  key={sucursal.id}
                  flexDir={"row"}
                  gap={2}
                  bg={
                    sucursalesSeleccionadas.includes(sucursal.id)
                      ? "blue.100"
                      : "white"
                  }
                  _hover={{
                    bg: sucursalesSeleccionadas.includes(sucursal.id)
                      ? "blue.400"
                      : "gray.100",
                  }}
                  p={2}
                  borderRadius={"md"}
                  onClick={() => {
                    if (sucursalesSeleccionadas.includes(sucursal.id)) {
                      setSucursalesSeleccionadas(
                        sucursalesSeleccionadas.filter(
                          (id) => id !== sucursal.id
                        )
                      );
                    } else {
                      setSucursalesSeleccionadas([
                        ...sucursalesSeleccionadas,
                        sucursal.id,
                      ]);
                    }
                  }}
                >
                  <p
                    className={`text-md font-semibold  ${
                      sucursalesSeleccionadas.includes(sucursal.id)
                        ? "text-black"
                        : "text-gray-500"
                    }`}
                  >
                    {sucursal.descripcion}
                  </p>
                </Flex>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setSucursalesSeleccionadas([]);
              }}
              colorScheme="red"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenChofer} onClose={onCloseChofer}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choferes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2} overflow={"auto"} h={"600px"}>
              {choferes.map((chofer) => (
                <Flex
                  key={chofer.id}
                  flexDir={"row"}
                  gap={2}
                  bg={
                    choferesSeleccionados.includes(chofer.id)
                      ? "blue.100"
                      : "white"
                  }
                  _hover={{
                    bg: choferesSeleccionados.includes(chofer.id)
                      ? "blue.400"
                      : "gray.100",
                  }}
                  p={2}
                  borderRadius={"md"}
                  onClick={() => {
                    if (choferesSeleccionados.includes(chofer.id)) {
                      setChoferesSeleccionados(
                        choferesSeleccionados.filter((id) => id !== chofer.id)
                      );
                    } else {
                      setChoferesSeleccionados([
                        ...choferesSeleccionados,
                        chofer.id,
                      ]);
                    }
                  }}
                >
                  <p
                    className={`text-md font-semibold  ${
                      choferesSeleccionados.includes(chofer.id)
                        ? "text-black"
                        : "text-gray-500"
                    }`}
                  >
                    {chofer.nombre}
                  </p>
                </Flex>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setChoferesSeleccionados([]);
              }}
              colorScheme="red"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenCamion} onClose={onCloseCamion}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Camiones</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2} overflow={"auto"} h={"600px"}>
              {camiones.map((camion) => (
                <Flex
                  key={camion.id}
                  flexDir={"row"}
                  gap={2}
                  bg={
                    camionesSeleccionados.includes(camion.id)
                      ? "blue.100"
                      : "white"
                  }
                  _hover={{
                    bg: camionesSeleccionados.includes(camion.id)
                      ? "blue.400"
                      : "gray.100",
                  }}
                  p={2}
                  borderRadius={"md"}
                  onClick={() => {
                    if (camionesSeleccionados.includes(camion.id)) {
                      setCamionesSeleccionados(
                        camionesSeleccionados.filter((id) => id !== camion.id)
                      );
                    } else {
                      setCamionesSeleccionados([
                        ...camionesSeleccionados,
                        camion.id,
                      ]);
                    }
                  }}
                >
                  <p
                    className={`text-md font-semibold  ${
                      camionesSeleccionados.includes(camion.id)
                        ? "text-black"
                        : "text-gray-500"
                    }`}
                  >
                    {camion.descripcion}
                  </p>
                </Flex>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setCamionesSeleccionados([]);
              }}
              colorScheme="red"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenTipoReparto} onClose={onCloseTipoReparto}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tipo de reparto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2} overflow={"auto"} h={"600px"}>
              {tipoReparto.map((tipo) => (
                <Flex
                  key={tipo.id}
                  flexDir={"row"}
                  gap={2}
                  bg={
                    tipoRepartoSeleccionado.includes(tipo.id)
                      ? "blue.100"
                      : "white"
                  }
                  _hover={{
                    bg: tipoRepartoSeleccionado.includes(tipo.id)
                      ? "blue.400"
                      : "gray.100",
                  }}
                  p={2}
                  borderRadius={"md"}
                  onClick={() => {
                    if (tipoRepartoSeleccionado.includes(tipo.id)) {
                      setTipoRepartoSeleccionado(
                        tipoRepartoSeleccionado.filter((id) => id !== tipo.id)
                      );
                    } else {
                      setTipoRepartoSeleccionado([
                        ...tipoRepartoSeleccionado,
                        tipo.id,
                      ]);
                    }
                  }}
                >
                  <p
                    className={`text-md font-semibold  ${
                      tipoRepartoSeleccionado.includes(tipo.id)
                        ? "text-black"
                        : "text-gray-500"
                    }`}
                  >
                    {tipo.tipo}
                  </p>
                </Flex>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setTipoRepartoSeleccionado([]);
              }}
              colorScheme="red"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default InformeEntregas;
