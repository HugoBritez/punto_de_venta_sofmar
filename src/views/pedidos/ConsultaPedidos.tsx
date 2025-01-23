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
  Checkbox,
} from "@chakra-ui/react";
import { format, subDays, startOfWeek, startOfMonth, parse } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { Handshake, Printer, ShoppingCart } from "lucide-react";
import PedidoModal from "./imprimirPedido";
import MenuContextual from "../../modules/MenuContextual";
import { useSwitch } from "@/services/SwitchContext";
import PedidoModalEstilizado from "./imprimirPedidoEstilizado";
import AutorizacionModal from "../../modules/AutorizacionModal";

interface Pedidos {
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
  area_actual: string;
  area_sgte: string;
}

interface DetallePedidos {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  exentas: number;
  cinco: number;
  diez: number;
  codlote: string;
  lote: string;
  ar_editar_desc: number;
  costo: number;
  precio_compra: number;
  bonificacion: number;
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

interface ConsultaPedidosProps {
  onSelectPedido?: (pedido: Pedidos, detalles: DetallePedidos[]) => void;
  onClose?: () => void;
  isModal?: boolean;
  clienteSeleccionado?: Cliente | null;
}

export default function ConsultaPedidos({
  onSelectPedido,
  onClose,
  isModal = false,
  clienteSeleccionado,
}: ConsultaPedidosProps) {
  const [pedidos, setPedidos] = useState<Pedidos[]>([]);
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [facturaFiltro] = useState("");
  const [idFiltro, setIdFiltro] = useState("");
  const [detallePedido, setDetallePedido] = useState<DetallePedidos[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(
    null
  );
  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutorizacionModalOpen, setIsAutorizacionModalOpen] = useState(false);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const { isSwitchOn } = useSwitch();
  const permisoDeAutorizacion = Number(
    sessionStorage.getItem("permisos_autorizar_pedido")
  );

  const verUtilidad = Number(sessionStorage.getItem("permiso_ver_utilidad"));
  const [verUltimoCosto, setVerUltimoCosto] = useState(0);

  useEffect(() => {
    fetchPedidos();
    console.log(sessionStorage.getItem("user_id"));
    console.log(permisoDeAutorizacion);
    console.log(verUtilidad);
  }, [fechaDesde, fechaHasta]);

  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${api_url}pedidos/consultas`, {
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
      setPedidos(response.data.body);
      console.log(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar los presupuestos",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetallePedido = async (codigo: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api_url}pedidos/detalles?cod=${codigo}`
      );
      setDetallePedido(response.data.body);
      setPedidoId(codigo);
      console.log(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar el detalle del pedido",
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

  const formatNumber = (value: number) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString("es-ES", { minimumFractionDigits: 0 });
    }
    return value;
  };

  const formatCantidad = (cantidad: string | number) => {
    const numericValue = Number(cantidad);
    if (!isNaN(numericValue)) {
      return Math.floor(numericValue).toString(); // Removes decimals
    }
    return cantidad;
  };

  const filteredPedido = pedidos.filter(
    (pedido) =>
      pedido.vendedor.toLowerCase().includes(vendedorFiltro.toLowerCase()) &&
      pedido.cliente.toLowerCase().includes(clienteFiltro.toLowerCase()) &&
      pedido.factura.toLowerCase().includes(facturaFiltro.toLowerCase()) &&
      pedido.codigo.toString().includes(idFiltro)
  );

  const handleVentaClick = (codigo: number) => {
    if (pedidoSeleccionado === codigo) {
      setPedidoSeleccionado(null);
      setDetallePedido([]);
      setPedidoId(codigo);
    } else {
      setPedidoSeleccionado(codigo);
      fetchDetallePedido(codigo);
    }
  };

  const handleModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAutorizacionModal = () => {
    setIsAutorizacionModalOpen(true);
  };

  const handleAutorizacionCloseModal = () => {
    setIsAutorizacionModalOpen(false);
  };

  const handleSelectPedido = (pedido: Pedidos) => {
    if (pedido.area_actual !== "Ventas") {
      toast({
        title: "Autorización requerida",
        description: "Primero se debe autorizar el pedido",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onSelectPedido) {
      onSelectPedido(pedido, detallePedido);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack spacing={4} align="stretch" bg={'white'} p={2} borderRadius={'md'} boxShadow={'sm'} h={'100%'}>
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <Handshake size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Consulta de Pedidos</Heading>
          <Box ml={"auto"} display={'flex'} gap={4}>
            <Flex gap={2}>
              <Checkbox colorScheme="green" fontWeight={'bold'} value={verUltimoCosto} onChange={(e)=>{
                setVerUltimoCosto(e.target.checked ? 1 : 0);
              }}>
                Ult. Costo
              </Checkbox>
            </Flex>
            <MenuContextual />
          </Box>
          
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

        <Flex flexDir={isMobile? 'column' : 'row'} gap={4}>
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
              placeholder="Buscar por nº de presupuesto"
              value={idFiltro}
              onChange={(e) => setIdFiltro(e.target.value)}
            />
          </InputGroup>
        </Flex>
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
                <Th>Moneda</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th textAlign="right">Descuento</Th>
                <Th textAlign="right">Total</Th>
                <Th>Operador</Th>
                <Th>Vendedor</Th>
                <Th>Area actual</Th>
                <Th></Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPedido.map((pedido: Pedidos) => (
                <React.Fragment key={pedido.codigo}>
                  <Tr
                    bg={
                      pedido.estado_desc === "Confirmado" ? "red.100" : "white"
                    }
                  >
                    <Td>{pedido.codigo}</Td>
                    <Td>{pedido.moneda}</Td>
                    <Td>{pedido.cliente}</Td>
                    <Td>
                      {(() => {
                        try {
                          const parsedDate = parse(
                            pedido.fecha,
                            "dd/MM/yyyy",
                            new Date()
                          );
                          return format(parsedDate, "dd/MM/yyyy");
                        } catch (error) {
                          console.error("Invalid date format:", pedido.fecha);
                          return "Invalid date";
                        }
                      })()}
                    </Td>
                    <Td textAlign="right">{formatNumber(pedido.descuento)}</Td>
                    <Td textAlign="right">{formatNumber(pedido.total)}</Td>
                    <Td>{pedido.operador}</Td>
                    <Td>{pedido.vendedor}</Td>
                    <Td>{pedido.area_actual}</Td>
                    <Td>
                      <Button
                        size="md"
                        onClick={() => handleVentaClick(pedido.codigo)}
                        colorScheme={
                          pedidoSeleccionado === pedido.codigo
                            ? "yellow"
                            : "green"
                        }
                      >
                        {pedidoSeleccionado === pedido.codigo ? "-" : "+"}
                      </Button>
                    </Td>
                    <Td>
                      {isModal && (
                        <Button
                          size="md"
                          onClick={() => handleSelectPedido(pedido)}
                          colorScheme="blue"
                          leftIcon={<ShoppingCart size={16} />}
                          isDisabled={
                            pedido.estado_desc === "Finiquitado" ? true : false
                          }
                        >
                          {pedido.estado_desc === "Finiquitado"
                            ? "Finiquitado"
                            : "Convertir a venta"}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                  <Tr style={{ padding: 0, margin: 0, height: "0px" }}>
                    <Td colSpan={12} style={{ padding: 0, margin: 0 }}>
                      <Collapse in={pedidoSeleccionado === pedido.codigo}>
                        <Box p={4} bg="gray.100" rounded="md">
                          <Heading size="sm" mb={2}>
                            Detalle del Presupuesto
                          </Heading>
                          <Table size="sm" variant="striped" py={4}>
                            <Thead bg={"blue.200"}>
                              <Tr>
                                <Th>Código</Th>
                                <Th>Descripción</Th>
                                <Th>Cantidad</Th>
                                <Th textAlign="right">Precio</Th>
                                {verUtilidad === 1 && (
                                  <>
                                    <Th textAlign="right">V/B</Th>
                                    <Th textAlign="right">
                                      Costo
                                    </Th>
                                    <Th textAlign="right">
                                      % Utilidad (Costo)
                                    </Th>
                                    <Th textAlign="right">
                                      % Utilidad (Venta)
                                    </Th>
                                  </>
                                )}
                                
                                <Th textAlign="right">Descuento</Th>
                                <Th textAlign="right">Exentas</Th>
                                <Th textAlign="right">5%</Th>
                                <Th textAlign="right">10%</Th>
                                <Th textAlign="right">Lote</Th>
                                <Th textAlign="right">Subtotal</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg={"white"}>
                              {detallePedido.map((detalle) => (
                                <Tr key={detalle.det_codigo}>
                                  <Td>{detalle.art_codigo}</Td>
                                  <Td>{detalle.descripcion}</Td>
                                  <Td textAlign={'center'}>{formatCantidad(detalle.cantidad)}</Td>
                                  <Td textAlign="right">
                                    {formatNumber(detalle.precio)}
                                  </Td>
                                  {verUtilidad === 1 && (
                                    <>
                                      <Td textAlign="right">
                                        {detalle.bonificacion === 0
                                          ? "V"
                                          : "B"}
                                      </Td>
                                      <Td textAlign="right">
                                        {formatNumber(verUltimoCosto === 1 ? detalle.costo : detalle.precio_compra)}
                                      </Td>
                                      <Td textAlign="right">
                                        {(
                                          ((detalle.precio - (verUltimoCosto === 1 ? detalle.costo : detalle.precio_compra)) /
                                          (verUltimoCosto === 1 ? detalle.costo : detalle.precio_compra)) *
                                          100
                                        ).toFixed(2)}
                                        %
                                      </Td>
                                      <Td textAlign="right">
                                        {(
                                          ((detalle.precio - (verUltimoCosto === 1 ? detalle.costo : detalle.precio_compra)) /
                                            detalle.precio) *
                                          100
                                        ).toFixed(2)}
                                        %
                                      </Td>
                                    </>
                                  )}
                                  
                                  <Td textAlign="center">
                                    {formatNumber(detalle.descuento)}
                                  </Td>
                                  <Td textAlign={"right"}>
                                    {formatNumber(detalle.exentas)}
                                  </Td>
                                  <Td textAlign={"right"}>
                                    {formatNumber(detalle.cinco)}
                                  </Td>
                                  <Td textAlign={"right"}>
                                    {formatNumber(detalle.diez)}
                                  </Td>
                                  <Td textAlign={"right"}>{detalle.lote}</Td>
                                  <Td textAlign="right">
                                    {formatNumber(
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
                            <Button colorScheme="blue" onClick={handleModal}>
                              <Printer />
                            </Button>
                            <Button
                              colorScheme="green"
                              onClick={handleAutorizacionModal}
                              isDisabled={
                                pedido.area_sgte != null ? false : true
                              }
                            >
                              Autorizar
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
      {isSwitchOn ? (
        <PedidoModalEstilizado
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pedidoId={pedidoId}
        />
      ) : (
        <PedidoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pedidoID={pedidoId}
        />
      )}
      <AutorizacionModal
        isOpen={isAutorizacionModalOpen}
        onOpen={handleAutorizacionModal}
        onClose={handleAutorizacionCloseModal}
        pedidoId={pedidoId} // Pasa el ID del pedido al modal
        fetchPedidos={fetchPedidos}
      />
    </Box>
  );
}
