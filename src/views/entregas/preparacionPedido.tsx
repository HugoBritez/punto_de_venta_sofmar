import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  Input,
  useToast,
  InputGroup,
  InputLeftElement,
  Flex,
  useMediaQuery,
  Checkbox,
  FormLabel,
  Select,
  RadioGroup,
  Radio,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { Handshake, Printer } from "lucide-react";
import MenuContextual from "../../modules/MenuContextual";

import { Moneda, Sucursal, Vendedor } from "@/types/shared_interfaces";
import DocumentoPreparacion from "./documento-preparacion";
import FloatingCard from "@/modules/FloatingCard";
import StickerCajas from "./sticker-cajas";
import { createRoot } from "react-dom/client";

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

interface PedidosNuevo {
  pedido_id: number;
  cliente: string;
  moneda: string;
  fecha: Date;
  factura: string;
  area: string;
  siguiente_area: string;
  estado: "Pendiente" | "Facturado" | "Todos";
  condicion: "Crédito" | "Contado";
  operador: string;
  vendedor: string;
  deposito: string;
  p_cantcuotas: number;
  p_entrega: number;
  p_autorizar_a_contado: boolean;
  acuerdo: string;
  imprimir: number;
  imprimir_preparacion: number;
  obs: string;
  total: number;
  cliente_id: number;
  cantidad_cajas: number;
  detalles: [
    {
      codigo: number;
      descripcion_articulo: string;
      cantidad_vendida: number;
      bonificacion: "V" | "B";
      d_cantidad: number;
      precio: number;
      ultimo_precio: number;
      porc_costo: number;
      porcentaje: number;
      descuento: number;
      exentas: number;
      cinco: number;
      diez: number;
      dp_lote: string;
      vencimiento: string;
      comision: number;
      actorizado: number;
      obs: string;
      cant_stock: number;
      dp_codigolote: number;
      cant_pendiente: number;
      cantidad_verificada: number;
    }
  ];
}

interface Cliente {
  cli_codigo: number;
  cli_interno: number;
  cli_razon: string;
  cli_ruc: string;
  cli_limitecredito: number;
}

interface ConsultaPedidosProps {
  onSelectPedido?: (pedido: Pedidos, detalles: DetallePedidos[]) => void;
  onClose?: () => void;
  isModal?: boolean;
  clienteSeleccionado?: Cliente | null;
}

export default function PreparacionPedido({
  clienteSeleccionado,
}: ConsultaPedidosProps) {
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  // const permisoDeAutorizacion = Number(
  //   sessionStorage.getItem("permisos_autorizar_pedido")
  // );

  const [consolidarPedidos, setConsolidarPedidos] = useState(0);

  //nuevos filtros a tener en cuenta mas adelante
  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[] | null>(null);
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [monedas, setMonedas] = useState<Moneda[] | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<
    string | null
  >(null);
  const [articuloSeleccionado] = useState<number | null>(null);
  const [clienteSeleccionadoNuevo, setClienteSeleccionadoNuevo] = useState<
    number | null
  >(null);
  const [vendedorSeleccionadoNuevo, setVendedorSeleccionadoNuevo] = useState<
    number | null
  >(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<number | null>(
    null
  );
  const [nroPedido, setNroPedido] = useState<number | null>(null);
  const [estado, setEstado] = useState<number | null>(1);
  const [factura] = useState<string | null>(null);

  const [pedidosNuevo, setPedidosNuevo] = useState<PedidosNuevo[]>([]);

  const [isFloatingCardVisibleVendedor, setIsFloatingCardVisibleVendedor] =
    useState(false);
  const [isFloatingCardVisibleCliente, setIsFloatingCardVisibleCliente] =
    useState(false);

  const [vendedorBusqueda, setVendedorBusqueda] = useState<string>("");
  const [clienteBusqueda, setClienteBusqueda] = useState<string>("");

  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidosNuevo | null>(null);

  const [loading, setLoading] = useState(false);

  function setColor(estado: string, impreso: number) {
    if (impreso === 1) {
      return "bg-violet-400";
    }
    if (impreso === 0 && estado === "Anulado") {
      return "bg-pink-300";
    }

    if (estado === "Facturado" && impreso === 0) {
      return "bg-yellow-300";
    }
  }


  const getPedidosNuevo = async () => {
    setLoading(true);
    const queryData = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      sucursales: sucursalSeleccionada,
      clientes: clienteSeleccionado
        ? clienteSeleccionado.cli_codigo
        : clienteSeleccionadoNuevo,
      vendedores: vendedorSeleccionadoNuevo,
      articulo: articuloSeleccionado,
      nro_pedido: nroPedido,
      estado: estado,
      moneda: monedaSeleccionada,
      factura: factura,
      consolidar: consolidarPedidos,
    };
    try {
      const response = await axios.get(`${api_url}pedidos/consulta-pedidos`, {
        params: queryData,
      });
      console.log(response.data.body);
      setPedidosNuevo(response.data.body);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error al cargar los pedidos",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursales(response.data.body);
      setSucursalSeleccionada(response.data.body[0].id);
    } catch (error) {
      toast({
        title: "Error al cargar las sucursales",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getMonedas = async () => {
    try {
      const response = await axios.get(`${api_url}monedas`);
      setMonedas(response.data.body);
      setMonedaSeleccionada(response.data.body[0].mo_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar las monedas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getClientes = async (clienteBusqueda: string) => {
    try {
      const response = await axios.get(`${api_url}clientes/get-clientes`, {
        params: {
          buscar: clienteBusqueda,
        },
      });
      setClientes(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar los clientes",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getVendedores = async (vendedorBusqueda: string) => {
    try {
      const response = await axios.get(`${api_url}usuarios/vendedores`, {
        params: {
          buscar: vendedorBusqueda,
        },
      });
      setVendedores(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar los vendedores",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBusquedaVendedor = (vendedorBusqueda: string) => {
    setVendedorBusqueda(vendedorBusqueda);
    getVendedores(vendedorBusqueda);
  };

  const handleBusquedaCliente = (clienteBusqueda: string) => {
    setClienteBusqueda(clienteBusqueda);
    getClientes(clienteBusqueda);
  };

  const handleSelectVendedor = (vendedor: Vendedor) => {
    setVendedorSeleccionadoNuevo(Number(vendedor.op_codigo));
    toast({
      title: "Vendedor seleccionado",
      description: vendedor.op_nombre,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setIsFloatingCardVisibleVendedor(false);
    setVendedorBusqueda(vendedor.op_nombre);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSeleccionadoNuevo(Number(cliente.cli_codigo));
    toast({
      title: "Cliente seleccionado",
      description: cliente.cli_razon,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setIsFloatingCardVisibleCliente(false);
    setClienteBusqueda(cliente.cli_razon);
  };

  const handleSelectPedido = (pedido: PedidosNuevo) => {
    setPedidoSeleccionado(pedido);
  };

  useEffect(() => {
    console.log("Pedido seleccionado:", pedidoSeleccionado);
    getSucursales();
    getMonedas();
  }, []);

const imprimirDocumentoPreparacion = async (
  pedido_id: number | null,
  consolidar: number | null,
  cliente: number | null,
  fecha_desde: string | null,
  fecha_hasta: string | null,
  estado: number | null,
  action: "print" | "generate"
) =>{
  return new Promise<void>((resolve, reject)=>{
    const preparacionDiv = document.createElement("div");
    document.body.appendChild(preparacionDiv);

    const root = createRoot(preparacionDiv);
    root.render(
      <DocumentoPreparacion
        pedido_id={pedido_id}
        consolidar={consolidar || 0}
        cliente={cliente}
        fecha_desde={fecha_desde}
        fecha_hasta={fecha_hasta}
        estado={estado}
        action={action}
        onComplete={() => {
          root.unmount();
          document.body.removeChild(preparacionDiv);
          resolve();
        }}
        onError={(error) => {
          root.unmount();
          document.body.removeChild(preparacionDiv);
          reject(error);
        }}
      />
    );
  });
}

const ImprimirComponenteSticker = async (
  pedidoId: number,
  action: "print" | "generate"
) => {
  return new Promise<void>((resolve, reject) => {
    const stickerDiv = document.createElement("div");
    document.body.appendChild(stickerDiv);

    const root = createRoot(stickerDiv);
    root.render(
      <StickerCajas
        pedidoId={pedidoId}
        action={action}
        onComplete={() => {
          root.unmount();
          document.body.removeChild(stickerDiv);
          resolve();
        }}
        onError={(error) => {
          root.unmount();
          document.body.removeChild(stickerDiv);
          reject(error);
        }}
      />
    );
  });
};

const handleImprimir = async (action: "print" | "generate") => {
  if (pedidoSeleccionado) {
    try {
      if (
        pedidoSeleccionado.cantidad_cajas &&
        pedidoSeleccionado.cantidad_cajas > 0
      ) {
        await ImprimirComponenteSticker(
          pedidoSeleccionado.pedido_id,
          action
        );
      } else {
        console.log("Imprimiendo documento de preparacion");
        await actualizarEstadoPedidos([pedidoSeleccionado.pedido_id]);
        await imprimirDocumentoPreparacion(
          pedidoSeleccionado.pedido_id,
          0,
          null,
          fechaDesde,
          fechaHasta,
          estado,
          action
        );
      }
    } catch (error) {
      console.error("Error al procesar:", error);
      toast({
        title: `Error al ${action === "print" ? "imprimir" : "generar"} PDF`,
        description: "Hubo un problema al procesar el documento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  } else {
    toast({
      title: "Error",
      description: "No se ha seleccionado ningún pedido",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};


//TODO: pasar la responsabilidad de esta funcion al componente hijo, NUEVA RESPONSABILIDAD: SOLO ACTUALIZAR EL ESTADO DE LOS PEDIDOS
const actualizarEstadoPedidos = async (pedidoIds: number[]) => {
  if (!pedidoIds || pedidoIds.length === 0) {
    console.error("No hay pedidos para actualizar");
    return;
  }
  try {
    console.log("Actualizando pedidos:", pedidoIds);
    const response = await axios.post(
      `${api_url}pedidos/iniciar-preparacion-pedido`,
      { pedido_ids: pedidoIds, preparado_por: sessionStorage.getItem("user_id") }
    );
    console.log("Respuesta del servidor:", response.data); // Para debug
    if (response.data.status === "success" || response.status === 200) {
      toast({
        title: "Éxito",
        description: "Los pedidos han sido marcados como preparados",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Actualizar la lista de pedidos
      await getPedidosNuevo();
    } else {
      throw new Error(response.data.message || "Error al actualizar pedidos");
    }
  } catch (error) {
    console.error("Error detallado al actualizar estado:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    toast({
      title: "Error",
      description: `No se pudo actualizar el estado de los pedidos: ${errorMessage}`,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    throw error; // Re-lanzar el error para manejarlo en el nivel superior
  }
};

  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      bg={"gray.100"}
      h={"100vh"}
      w={"100%"}
      p={2}
      gap={2}
    >
      <VStack
        spacing={4}
        align="stretch"
        bg={"white"}
        p={2}
        borderRadius={"md"}
        boxShadow={"sm"}
      >
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <Handshake size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>
            Preparacion de Pedidos
          </Heading>
          <Box ml={"auto"} display={"flex"} gap={4}>
            <Flex gap={2}>
              <Checkbox
                colorScheme="green"
                fontWeight={"bold"}
                value={consolidarPedidos}
                onChange={(e) => {
                  setConsolidarPedidos(e.target.checked ? 1 : 0);
                }}
              >
                Consolidar Pedidos
              </Checkbox>
            </Flex>
            <MenuContextual />
          </Box>
        </Flex>
        <Flex gap={2} flexDir={isMobile ? "column" : "row"}>
          <div>
            <div
              className={
                isMobile ? "flex flex-col gap-2" : "flex flex-row gap-2"
              }
            >
              <Box>
                <FormLabel>Fecha hasta:</FormLabel>
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </Box>
              <Box>
                <FormLabel>Fecha hasta:</FormLabel>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </Box>
              <Box display={"flex"} flexDir={"column"}>
                <FormLabel>Sucursal:</FormLabel>
                <Select
                  value={sucursalSeleccionada || ""}
                  onChange={(e) => setSucursalSeleccionada(e.target.value)}
                  placeholder="Seleccione una sucursal"
                  w={"full"}
                >
                  {sucursales?.map((sucursal, index) => (
                    <option key={index} value={sucursal.id}>
                      {sucursal.descripcion}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <FormLabel>Moneda:</FormLabel>
                <Select
                  value={monedaSeleccionada || ""}
                  onChange={(e) =>
                    setMonedaSeleccionada(Number(e.target.value))
                  }
                  placeholder="Seleccione una moneda"
                  w={"full"}
                >
                  {monedas?.map((moneda, index) => (
                    <option key={index} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <FormLabel>Nro. Pedido:</FormLabel>
                <Input
                  placeholder="Buscar por nro. de pedido"
                  value={nroPedido || ""}
                  onChange={(e) => setNroPedido(Number(e.target.value))}
                />
              </Box>
            </div>
            <div className="p-2 flex flex-row gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <div className="p-4 bg-violet-400 rounded-md"></div>
                <p className="text-sm font-bold">
                  Pedido ya impreso para preparacion
                </p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-4 bg-blue-400 rounded-md"></div>
                <p className="text-sm font-bold">
                  Pedido ya verificado y empaquetado
                </p>
              </div>
            </div>
          </div>
          <div className="border border-gray-300 rounded-md p-2 flex flex-col h-full gap-4 justify-center items-center bg-orange-200">
            <p className="text-md font-bold relative -top-5 -left-24 bg-white px-2">
              Estado
            </p>
            <RadioGroup
              value={estado?.toString()}
              onChange={(e) => setEstado(Number(e))}
            >
              <Flex flexDir={"row"} gap={2}>
                <Radio value={"1"} bg={"white"}>
                  Pendiente
                </Radio>
                <Radio value={"2"} bg={"white"}>
                  Procesados
                </Radio>
                <Radio value={"3"} bg={"white"}>
                  Todos
                </Radio>
              </Flex>
            </RadioGroup>
          </div>
          <Flex flexDir={"column"} gap={2} flex={1}>
            <InputGroup position={"relative"} zIndex={2}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Filtrar por vendedor"
                value={vendedorBusqueda || ""}
                onChange={(e) => handleBusquedaVendedor(e.target.value)}
                onClick={() => {
                  setIsFloatingCardVisibleVendedor(true);
                }}
              />
              <FloatingCard<Vendedor>
                isVisible={isFloatingCardVisibleVendedor}
                items={vendedores || []}
                onClose={() => setIsFloatingCardVisibleVendedor(false)}
                onSelect={handleSelectVendedor}
                renderItem={(item) => <p>{item.op_nombre}</p>}
              />
            </InputGroup>
            <InputGroup position={"relative"} zIndex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Filtrar por cliente"
                value={clienteBusqueda || ""}
                onChange={(e) => handleBusquedaCliente(e.target.value)}
                onClick={() => {
                  setIsFloatingCardVisibleCliente(true);
                }}
              />
              <FloatingCard<Cliente>
                isVisible={isFloatingCardVisibleCliente}
                items={clientes || []}
                onClose={() => setIsFloatingCardVisibleCliente(false)}
                onSelect={handleSelectCliente}
                renderItem={(item) => <p>{item.cli_razon}</p>}
              />
            </InputGroup>
          </Flex>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleImprimir("print")}
              colorScheme="yellow"
              isLoading={loading}
            >
              <div className="flex flex-row gap-2 px-2 py-2">
                <p>Imprimir</p>
                <Printer />
              </div>
            </Button>
            <Button
              onClick={() => handleImprimir("generate")}
              colorScheme="orange"
              isLoading={loading}
            >
              <div className="flex flex-row gap-2 px-2 py-2">
                <p>Generar PDF</p>
                <SearchIcon />
              </div>
            </Button>
            <Button
              onClick={() => getPedidosNuevo()}
              colorScheme="green"
              isLoading={loading}
            >
              <div className="flex flex-row gap-2 px-2 py-2">
                <p>Procesar</p>
                <SearchIcon />
              </div>
            </Button>
          </div>
        </Flex>
      </VStack>
      <div
        className={
          isMobile
            ? "flex flex-col gap-2  w-full"
            : "flex flex-row gap-2 h-[75%] w-[100%]"
        }
      >
        <div
          className={
            isMobile
              ? "flex flex-col  h-full rounded-md w-[100%] overflow-y-auto gap-1"
              : "flex flex-col  h-full rounded-md w-[100%] overflow-y-auto gap-1"
          }
        >
          <div className="flex flex-col bg-white border border-gray-200 h-1/2 rounded-md w-full overflow-y-auto py-2">
            {loading ? (
              <div className="flex flex-row gap-2 justify-center items-center h-full w-[100%]">
                <Spinner />
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gray-100 p-2 rounded-sm border border-gray-200">
                  <tr className="text-sm font-bold border border-gray-200 [&>th]:p-2 [&>th]:border-r [&>th]:border-gray-200">
                    <th>Nro. Pedido</th>
                    <th>Cliente</th>
                    <th>Moneda</th>
                    <th>Fecha</th>
                    <th>Factura</th>
                    <th>Area Actual</th>
                    <th>Area Siguiente</th>
                    <th>Estado</th>
                    <th>Vendedor</th>
                    <th>Condicion</th>
                    <th>Operador</th>
                    <th>Deposito</th>
                  </tr>
                </thead>
                {pedidosNuevo.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center text-gray-500 font-bold"
                      >
                        No se encontraron pedidos
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="border border-gray-200 overflow-x-auto">
                    {pedidosNuevo.map((pedido) => (
                      <tr
                        className={
                          isMobile
                            ? `border border-gray-200 hover:bg-gray-200 cursor-pointer [&>td]:px-2 [&>td]:text-xs [&>td]:border-r [&>td]:border-gray-200
                            ${
                              pedido.cantidad_cajas > 0
                                ? "bg-violet-400"
                                : setColor(
                                    pedido.estado,
                                    pedido.imprimir_preparacion
                                  )
                            }`
                            : `border border-gray-200 hover:bg-gray-200 cursor-pointer [&>td]:px-2 [&>td]:border-r [&>td]:border-gray-200
                            ${
                              pedido.cantidad_cajas > 0
                                ? "bg-blue-400"
                                : setColor(
                                    pedido.estado,
                                    pedido.imprimir_preparacion
                                  )
                            }`
                        }
                        onClick={() => handleSelectPedido(pedido)}
                      >
                        <td>{pedido.pedido_id}</td>
                        <td>{pedido.cliente}</td>
                        <td>{pedido.moneda}</td>
                        <td>{format(pedido.fecha, "dd/MM/yyyy")}</td>
                        <td>{pedido.factura}</td>
                        <td>{pedido.area}</td>
                        <td>{pedido.siguiente_area}</td>
                        <td>{pedido.estado}</td>
                        <td>{pedido.vendedor}</td>
                        <td>{pedido.condicion}</td>
                        <td>{pedido.operador}</td>
                        <td>{pedido.deposito}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            )}
          </div>
          <div
            className={
              isMobile
                ? "flex flex-col bg-white border border-gray-200 h-[80%] rounded-md w-full overflow-y-auto py-2"
                : "flex flex-col bg-white border border-gray-200 h-1/2 rounded-md w-full overflow-y-auto py-2"
            }
          >
            {loading ? (
              <div className="flex flex-row gap-2 justify-center items-center h-full w-[100%]">
                <Spinner />
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gray-100 p-2 rounded-sm border border-gray-200">
                  <tr className="text-sm font-bold border border-gray-200 [&>th]:p-2 [&>th]:border-r [&>th]:border-gray-200">
                    <th>Codigo</th>
                    <th>Descripcion</th>
                    <th>Cantidad</th>
                    <th>Bonif.</th>
                    <th>Cant. Falt.</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Exentas</th>
                    <th>Cinco</th>
                    <th>Diez</th>
                    <th>Lote</th>
                    <th>Vencimiento</th>
                    <th>Comision</th>
                  </tr>
                </thead>
                {pedidosNuevo.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center text-gray-500 font-bold"
                      >
                        No se encontraron pedidos
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="border border-gray-200 overflow-x-auto">
                    {pedidoSeleccionado?.detalles.map((detalle) => (
                      <tr
                        className={
                          isMobile
                            ? `border border-gray-200 hover:bg-gray-200 cursor-pointer [&>td]:px-2 [&>td]:text-xs  [&>td]:border-r [&>td]:border-gray-200`
                            : `border border-gray-200 hover:bg-gray-200 cursor-pointer [&>td]:px-2 [&>td]:border-r [&>td]:border-gray-200`
                        }
                      >
                        <td className="text-xs">{detalle.codigo}</td>
                        <td className="text-xs">
                          {detalle.descripcion_articulo}
                        </td>
                        <td className="text-xs">{detalle.cantidad_vendida}</td>
                        <td className="text-xs">{detalle.bonificacion}</td>
                        <td className="text-xs">{detalle.d_cantidad}</td>
                        <td className="text-xs">{detalle.precio}</td>
                        <td className="text-xs">{detalle.descuento}</td>
                        <td className="text-xs">{detalle.exentas}</td>
                        <td className="text-xs">{detalle.cinco}</td>
                        <td className="text-xs">{detalle.diez}</td>
                        <td className="text-xs">{detalle.dp_lote}</td>
                        <td className="text-xs">{detalle.vencimiento}</td>
                        <td className="text-xs">{detalle.comision}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}

