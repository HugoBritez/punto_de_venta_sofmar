import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Tabs,
  TabList,
  Tab,
  HStack,
  InputGroup,
  InputLeftElement,
  Collapse,
  Button,
  Flex,
  useMediaQuery,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { Dot, HandCoins, Printer } from "lucide-react";
import VentaModal from "./imprimirVenta";
import { useAuth } from "@/services/AuthContext";
import Auditar from "@/services/AuditoriaHook";
import { Tooltip } from "@chakra-ui/react";

interface Venta {
  codigo: number;
  codcliente: number;
  cliente: string;
  moneda: string;
  fecha: string;
  codsucursal: number;
  sucursal: string;
  vendedor: string;
  operador: string;
  total: number;
  descuento: number;
  saldo: number;
  condicion: string;
  vencimiento: string;
  factura: string;
  obs: string;
  estado: number;
  estado_desc: string;
}

interface DetalleVenta {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  descripcion_editada?: string;
  cantidad: number;
  precio: number;
  descuento: number;
  exentas: number;
  cinco: number;
  diez: number;
  lote: string;
  vencimiento: string;
}

interface Cliente {
  cli_codigo: number;
  cli_interno: number;
  cli_razon: string;
  cli_ruc: string;
  cli_limitecredito: number;
}

const periodos = [
  { label: "Hoy", value: "hoy" },
  { label: "Ayer", value: "ayer" },
  { label: "Últimos 3 Días", value: "tresDias" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mes", value: "mes" },
];

interface ConsultaDeVentasProps {
  clienteSeleccionado?: Cliente | null;
}

export default function ResumenVentas({
  clienteSeleccionado,
}: ConsultaDeVentasProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [facturaFiltro, setFacturaFiltro] = useState("");
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(
    null
  );
  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleID, setSaleID] = useState<number | null>(null);
  const { auth } = useAuth();

  const {
    isOpen: isAdvertenciaModalOpen,
    onOpen: handleOpenAdvertenciaModal,
    onClose: handleCLoseAdvertenciaModal,
  } = useDisclosure();

  useEffect(() => {
    fetchVentas();
    console.log(auth?.rol);
  }, [fechaDesde, fechaHasta]);

  const fetchVentas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        sucursal: "",
        cliente: clienteSeleccionado
          ? clienteSeleccionado.cli_codigo
          : clienteFiltro,
        vendedor: vendedorFiltro,
        articulo: "",
        moneda: "",
        factura: facturaFiltro,
      });
      setVentas(response.data.body);
      console.log(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar las ventas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetalleVenta = async (codigo: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api_url}venta/detalles?cod=${codigo}`
      );
      setDetalleVenta(response.data.body);
      setSaleID(codigo);
      console.log(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar el detalle de la venta",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodoChange = (index: number) => {
    setPeriodoSeleccionado(index);
    const hoy = new Date();
    let nuevaFechaDesde = hoy;

    switch (periodos[index].value) {
      case "hoy":
        nuevaFechaDesde = hoy;
        break;
      case "ayer":
        nuevaFechaDesde = subDays(hoy, 1);
        break;
      case "tresDias":
        nuevaFechaDesde = subDays(hoy, 2);
        break;
      case "semana":
        nuevaFechaDesde = startOfWeek(hoy);
        break;
      case "mes":
        nuevaFechaDesde = startOfMonth(hoy);
        break;
    }

    setFechaDesde(format(nuevaFechaDesde, "yyyy-MM-dd"));
    setFechaHasta(format(hoy, "yyyy-MM-dd"));
  };

  // const formatNumber = (value: number) => {
  //   const numericValue = Number(value);
  //   if (!isNaN(numericValue)) {
  //     return numericValue.toLocaleString('es-ES', { minimumFractionDigits: 0 });
  //   }
  //   return value;
  // }

  const formatCantidad = (cantidad: string | number) => {
    const numericValue = Number(cantidad);
    if (!isNaN(numericValue)) {
      return Math.floor(numericValue).toString(); 
    }
    return cantidad;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-PY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredVentas = ventas.filter(
    (venta) =>
      venta.vendedor.toLowerCase().includes(vendedorFiltro.toLowerCase()) &&
      venta.cliente.toLowerCase().includes(clienteFiltro.toLowerCase()) &&
      venta.factura.toLowerCase().includes(facturaFiltro.toLowerCase())
  );

  const handleVentaClick = (codigo: number) => {
    if (ventaSeleccionada === codigo) {
      setVentaSeleccionada(null);
      setDetalleVenta([]);
      setSaleID(codigo);
    } else {
      setVentaSeleccionada(codigo);
      fetchDetalleVenta(codigo);
    }
  };

  const handleModal = () => {
    setIsModalOpen(true);
  };

  const handleCLoseModal = () => {
    setIsModalOpen(false);
  };

  const anularVenta = async (metodo: number) => {
    try {
      const response = await axios.post(`${api_url}venta/anular-venta`, {
        codigo: ventaSeleccionada,
        userId: auth?.userId,
        metodo: metodo,
      });
      console.log(response.data);
      toast({
        title: "Venta anulada",
        description: "La venta ha sido anulada exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchVentas();
      Auditar(
        5,
        3,
        ventaSeleccionada,
        Number(auth?.userId),
        `Venta Nro. ${ventaSeleccionada} anulada por ${auth?.userName}`
      );
    } catch (error) {
      toast({
        title: "Error al anular la venta",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="full" m={2} p={5}>
      <VStack spacing={4} align="stretch">
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <HandCoins size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Consulta de Ventas</Heading>
        </Flex>

        <HStack spacing={4}>
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
        </HStack>

        <HStack spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por vendedor"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nº de factura"
              value={facturaFiltro}
              onChange={(e) => setFacturaFiltro(e.target.value)}
            />
          </InputGroup>
        </HStack>
        <Tabs
          index={periodoSeleccionado}
          onChange={handlePeriodoChange}
          variant={"solid-rounded"}
          colorScheme="green"
        >
          <TabList>
            {periodos.map((periodo, index) => (
              <Tab key={index}>{periodo.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <Box
          height={"600px"}
          overflowY={"auto"}
          maxWidth={"90vw"}
          overflowX={"auto"}
        >
          <Table variant="simple">
            <Thead bg={"blue.100"}>
              <Tr>
                <Th>Codigo</Th>
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Vendedor</Th>
                <Th>Operador</Th>
                <Th>Factura</Th>
                <Th>Condicion</Th>
                <Th>Moneda</Th>
                <Th textAlign="right">Saldo</Th>
                <Th textAlign="right">Descuento</Th>
                <Th textAlign="right">Total</Th>
                <Th>Estado</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVentas.map((venta) => (
                <React.Fragment key={venta.codigo}>
                  <Tr
                  >
                    <Td>{venta.codigo}</Td>
                    <Td>
                      {new Date(
                        venta.fecha.split(" : ")[0] + "T00:00:00"
                      ).toLocaleDateString("es-ES")}
                    </Td>
                    <Td>{venta.cliente}</Td>
                    <Td>{venta.vendedor}</Td>
                    <Td>{venta.operador}</Td>
                    <Td>{venta.factura}</Td>
                    <Td>{venta.condicion}</Td>
                    <Td>{venta.moneda}</Td>
                    <Td textAlign="right">{formatCurrency(venta.saldo)}</Td>
                    <Td textAlign="right">{formatCurrency(venta.descuento)}</Td>
                    <Td textAlign="right">{formatCurrency(venta.total)}</Td>
                    <Td>
                      <Box>
                      <Tooltip label={venta.estado_desc} aria-label="A tooltip">
                        <Box><Dot strokeWidth={8}  color={venta.estado === 0? 'red' : 'green'}/></Box>
                      </Tooltip>
                      </Box>
                    </Td>
                    <Td>
                      <Button
                        size="md"
                        onClick={() => handleVentaClick(venta.codigo)}
                        colorScheme={
                          ventaSeleccionada === venta.codigo
                            ? "yellow"
                            : "green"
                        }
                      >
                        {ventaSeleccionada === venta.codigo ? "-" : "+"}
                      </Button>
                    </Td>
                  </Tr>
                  <Tr style={{ padding: 0, margin: 0, height: "0px" }}>
                    <Td colSpan={12} style={{ padding: 0, margin: 0 }}>
                      <Collapse in={ventaSeleccionada === venta.codigo}>
                        <Box p={4} bg="gray.100" rounded="md">
                          <Heading size="sm" mb={2}>
                            Detalle de la Venta
                          </Heading>
                          <Table size="sm" variant="striped" py={4}>
                            <Thead bg={"blue.200"}>
                              <Tr>
                                <Th>Código</Th>
                                <Th>Descripción</Th>
                                <Th>Cantidad</Th>
                                <Th textAlign="right">Precio</Th>
                                <Th textAlign="right">Descuento</Th>
                                <Th textAlign="right">Subtotal</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg={"white"}>
                              {detalleVenta.map((detalle) => (
                                <Tr key={detalle.det_codigo}>
                                  <Td>{detalle.art_codigo}</Td>
                                  <Td>
                                    {detalle.descripcion_editada === ""
                                      ? detalle.descripcion
                                      : detalle.descripcion_editada}
                                  </Td>
                                  <Td textAlign={"left"}>
                                    {formatCantidad(detalle.cantidad)}
                                  </Td>
                                  <Td textAlign="right">
                                    {formatCurrency(detalle.precio)}
                                  </Td>
                                  <Td textAlign="right">
                                    {formatCurrency(detalle.descuento)}
                                  </Td>
                                  <Td textAlign="right">
                                    {formatCurrency(
                                      (detalle.precio - detalle.descuento) *
                                        detalle.cantidad
                                    )}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                          <Flex
                            flexDirection={"row"}
                            justify={"end"}
                            gap={4}
                            width={"full"}
                            my={4}
                          >
                            {auth?.rol === 7 ? (
                              <Button
                                colorScheme="red"
                                onClick={handleOpenAdvertenciaModal}
                                isDisabled={
                                  venta.estado_desc.toLowerCase() === "anulado"
                                    ? true
                                    : false
                                }
                              >
                                Anular Venta
                              </Button>
                            ) : null}
                            <Button colorScheme="blue" onClick={handleModal}>
                              <Printer />
                            </Button>
                          </Flex>
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
      <Modal
        isOpen={isAdvertenciaModalOpen}
        onClose={handleCLoseAdvertenciaModal}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccione metodo de anulación</ModalHeader>
          <ModalCloseButton />
          <ModalBody></ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => {
              anularVenta(1)
              handleCLoseAdvertenciaModal()
              }}>
              Anular factura completa
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                handleCLoseAdvertenciaModal()
                anularVenta(0)}}
            >
              Anular solo venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <VentaModal
        isOpen={isModalOpen}
        onClose={handleCLoseModal}
        ventaId={saleID}
      />
    </Box>
  );
}
