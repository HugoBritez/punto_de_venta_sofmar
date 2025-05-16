import {
  Camion,
  Chofer,
  Moneda,
  Sucursal,
  DetalleEntrega,
  Entrega,
  Proveedor,
  Cliente,
} from "@/shared/types/shared_interfaces";
import {
  Box,
  Flex,
  FormLabel,
  Heading,
  Input,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  Modal,
  Select,
  useDisclosure,
  useMediaQuery,
  VStack,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  Th,
  Thead,
  Tr,
  Tbody,
  Td,
  Table,
  useToast,
  Badge
} from "@chakra-ui/react";
import { CheckCircle, Handshake } from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchSucursales as fetchSucursalesAPI,
  fetchCamiones as fetchCamionesAPI,
  fetchChoferes as fetchChoferesAPI,
  fetchMonedas as fetchMonedasAPI,
  fetchPedidos as fetchPedidosAPI,
  fetchVentas as fetchVentasAPI,
  fetchDetallePedidos as fetchDetallePedidosAPI,
  fetchDetalleVentas as fetchDetalleVentasAPI,
  fetchClientes as fetchClientesAPI,
  fetchProveedores as fetchProveedoresAPI,
} from "./fetchMetodos";
import axios from "axios";
import { api_url } from "@/utils";

interface Ruteo {
  fecha: string;
  hora_s: string;
  hora_l: string;
  chofer: number;
  oprador: number;
  camion: number;
  sucursal: number;
  moneda: number;
  km_actual: number;
  ult_km: number;
  estado: number;
}

interface DetallePedido {
  pedido: number;
}

interface DetalleVenta {
  venta: number;
}

interface DetallePago {
  pago: number;
}

interface DetalleCobro {
  cobro: number;
}

interface DetalleRuteo {
  monto: number;
  estado: number;
  obs: string;
  hora_e: string;
  hora_s: string;
  cliente_zona: string;
  detalle_pedidos?: DetallePedido;
  detalle_ventas?: DetalleVenta;
  detalle_pagos?: DetallePago;
  detalle_cobros?: DetalleCobro;
}

interface RepartoData {
  ruteo: Ruteo;
  detalle_ruteo: DetalleRuteo[];
}

interface RepartoResponse {
  success: boolean;
  mensaje: string;
  ruteoId?: number;
  error?: string;
}

interface ItemTabla {
  tipo: string;
  zona: string;
  id: number | undefined;
  fecha: string;
  factura: string;
  cliente: string;
  condicion: string;
  monto: number;
  vendedor: string;
  observacion: string;
  color: string;
  onClick?: () => void;
}

const RuteamientoPedidos = () => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);

  const [fechaActual, setFechaActual] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const operadorActual = sessionStorage.getItem("user_id");
  const operadorNombre = sessionStorage.getItem("user_name");


  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [choferSeleccionado, setChoferSeleccionado] = useState<Chofer | null>(
    null
  );

  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [camionSeleccionado, setCamionSeleccionado] = useState<Camion | null>(
    null
  );

  const [horaSalida] = useState<string>("");
  const [horaLlegada] = useState<string>("");

  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );

  const [kmActual, setKmActual] = useState<number>(0);
  const [kmFinal, setKmFinal] = useState<number>(0);

  const [fecha_desde, setFechaDesde] = useState<string>(
    new Date(Date.now() - 86400000).toISOString().split("T")[0]
  );
  const [fecha_hasta, setFechaHasta] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [pedidos, setPedidos] = useState<DetalleEntrega[]>([]);
  const [ventas, setVentas] = useState<DetalleEntrega[]>([]);

  const [detalleVentas, setDetalleVentas] = useState<Entrega[]>([]);
  const [detallePedidos, setDetallePedidos] = useState<Entrega[]>([]);

  const [detalleRuteoSeleccionado, setDetalleRuteoSeleccionado] = useState<
    DetalleRuteo[]
  >([]);

  const [itemSeleccionado, setItemSeleccionado] =
    useState<DetalleEntrega | null>(null);


  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteSeleccionadoParaFiltro, setClienteSeleccionadoParaFiltro] = useState<number | null>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  //funciones y metodos

  const {
    isOpen: isCamionesModalOpen,
    onOpen: onCamionesModalOpen,
    onClose: onCamionesModalClose,
  } = useDisclosure();

  const {
    isOpen: isChoferesModalOpen,
    onOpen: onChoferesModalOpen,
    onClose: onChoferesModalClose,
  } = useDisclosure();

  const {
    isOpen: isDetallePedidoOpen,
    onOpen: onDetallePedidoOpen,
    onClose: onDetallePedidoClose,
  } = useDisclosure();

  const {
    isOpen: isDetalleVentaOpen,
    onOpen: onDetalleVentaOpen,
    onClose: onDetalleVentaClose,
  } = useDisclosure();

  const {
    isOpen: isCobroModalOpen,
    onOpen: onCobroModalOpen,
    onClose: onCobroModalClose,
  } = useDisclosure();

  const {
    isOpen: isPagoModalOpen,
    onOpen: onPagoModalOpen,
    onClose: onPagoModalClose,
  } = useDisclosure();

  const {
    isOpen: isClienteModalOpen,
    onOpen: onClienteModalOpen,
    onClose: onClienteModalClose,
  } = useDisclosure();


  const toast = useToast();


  const fetchSucursales = async () => {
    try {
      const response = await fetchSucursalesAPI();
      setSucursales(response);
      setSucursalSeleccionada(response[0]);
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
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

  const fetchMonedas = async () => {
    try {
      const response = await fetchMonedasAPI();
      setMonedas(response);
    } catch (error) {
      console.error("Error al obtener monedas:", error);
    }
  };

  const fetchVentas = async () => {
    try {
      const response = await fetchVentasAPI(fecha_desde, fecha_hasta, clienteSeleccionadoParaFiltro);
      setVentas(response);
      console.log("Ventas", response);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    }

  };

  const fetchDetalleVentas = async (id: number) => {
    try {
      const response = await fetchDetalleVentasAPI(id);
      setDetalleVentas(response);
    } catch (error) {
      console.error("Error al obtener detalle de ventas:", error);
    }
  };

  const fetchDetallePedidos = async (id: number) => {
    try {
      const response = await fetchDetallePedidosAPI(id);
      setDetallePedidos(response);
    } catch (error) {
      console.error("Error al obtener detalle de pedidos:", error);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await fetchPedidosAPI(fecha_desde, fecha_hasta, clienteSeleccionadoParaFiltro);
      setPedidos(response);
      console.log("Pedidos", response);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }

  };

  const fetchClientes = async (busqueda: string = '') => {
    try {
      const response = await fetchClientesAPI(busqueda);
      setClientes(response);
      console.log("Clientes", response);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await fetchProveedoresAPI();
      setProveedores(response);
      console.log("Proveedores", response);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  useEffect(() => {
    fetchSucursales();
    fetchCamiones();
    fetchChoferes();
    fetchMonedas();
    fetchProveedores();
  }, []);

  const formatearNumero = (numero: number | string) => {
    const numeroRedondeado = Math.round(Number(numero));
    return numeroRedondeado.toLocaleString("es-PY");
  };

  const insertarReparto = async (
    data: RepartoData
  ): Promise<RepartoResponse> => {
    try {
      const response = await axios.post<RepartoResponse>(
        `${api_url}reparto/insertar`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.mensaje || "Error al insertar el reparto"
        );
      }
      throw new Error("Error inesperado al insertar el reparto");
    }
  };

  const insertarRepartoTabla = async () => {
    if (!choferSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un chofer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!camionSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un camion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!sucursalSeleccionada) {
      toast({
        title: "Error",
        description: "Debe seleccionar una sucursal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Validar que haya detalles seleccionados

    if (detalleRuteoSeleccionado.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un pedido, venta, pago o cobro",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log("Detalle ruteo", detalleRuteoSeleccionado);
    const nuevoReparto: RepartoData = {
      ruteo: {
        fecha: fechaActual,
        hora_s: horaSalida,
        hora_l: horaLlegada,
        chofer: choferSeleccionado.id,
        oprador: Number(operadorActual) || 0,
        camion: camionSeleccionado.id,
        sucursal: sucursalSeleccionada.id,
        moneda: monedaSeleccionada?.mo_codigo || 1,
        km_actual: kmActual,
        ult_km: kmFinal,
        estado: 1,
      },
      detalle_ruteo: detalleRuteoSeleccionado.map((detalle) => ({
        monto: detalle.monto,
        estado: 1,
        cliente_zona: detalle.cliente_zona,
        obs: detalle.obs || "",
        hora_e: detalle.hora_e || "",
        hora_s: detalle.hora_s || "",
        ...(detalle.detalle_pedidos && {
          detalle_pedidos: detalle.detalle_pedidos,
        }),
        ...(detalle.detalle_ventas && {
          detalle_ventas: detalle.detalle_ventas,
        }),
        ...(detalle.detalle_pagos && { detalle_pagos: detalle.detalle_pagos }),
        ...(detalle.detalle_cobros && {
          detalle_cobros: detalle.detalle_cobros,
        }),
      })),
    };

    try {
      await insertarReparto(nuevoReparto);
        toast({
          title: "Exito",
          description: "Reparto insertado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setDetalleRuteoSeleccionado([]);
        fetchPedidos();
        fetchVentas();
        setItemSeleccionado(null);
        setDetallePedidos([]);
        setDetalleVentas([]);
        setChoferSeleccionado(null);
        setCamionSeleccionado(null);
        setMonedaSeleccionada(null);
        setSucursalSeleccionada(null);
    } catch (error) {
      console.error("Error:", error);
      toast({


        title: "Error",
        description: "Error al insertar el reparto",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  // Para pedidos
  const agregarDetallePedido = () => {
    if (!itemSeleccionado) return;

    // Verificar si ya existe
    const yaExiste = detalleRuteoSeleccionado.some(
      (detalle) => detalle.detalle_pedidos?.pedido === itemSeleccionado.id
    );

    if (yaExiste) {
      alert("Este pedido ya ha sido agregado al ruteo");
      return;
    }

    const nuevoDetalle: DetalleRuteo = {
      monto: itemSeleccionado.monto,
      estado: 1,
      obs: itemSeleccionado.observacion || "",
      hora_e: "",
      hora_s: "",
      detalle_pedidos: {
        pedido: itemSeleccionado.id,
      },
      cliente_zona: itemSeleccionado.cliente_zona,
    };
    setDetalleRuteoSeleccionado([...detalleRuteoSeleccionado, nuevoDetalle]);
    onDetallePedidoClose();
  };

  // Para ventas
  const agregarDetalleVenta = () => {
    if (!itemSeleccionado) return;
    console.log("No hay item seleccionado");

    // Verificar si ya existe
    const yaExiste = detalleRuteoSeleccionado.some(
      (detalle) => detalle.detalle_ventas?.venta === itemSeleccionado.id
    );
    console.log("Ya existe", yaExiste);
    if (yaExiste) {
      alert("Esta venta ya ha sido agregada al ruteo");
      return;
    }

    const nuevoDetalle: DetalleRuteo = {
      monto: itemSeleccionado.monto,
      estado: 1,
      obs: itemSeleccionado.observacion || "",
      hora_e: "",

      hora_s: "",
      detalle_ventas: {
        venta: itemSeleccionado.id,
      },
      cliente_zona: itemSeleccionado.cliente_zona,
    };
    setDetalleRuteoSeleccionado([...detalleRuteoSeleccionado, nuevoDetalle]);
    onDetalleVentaClose();
  };

  // Para pagos (mantener para cuando se implemente)
  const agregarDetallePago = (pago: { id: number; monto: number, cliente_zona: string }) => {
    const yaExiste = detalleRuteoSeleccionado.some(
      (detalle) => detalle.detalle_pagos?.pago === pago.id
    );

    if (yaExiste) {
      alert("Este pago ya ha sido agregado al ruteo");
      return;
    }

    const nuevoDetalle: DetalleRuteo = {
      monto: 0,
      estado: 1,
      obs: "",
      hora_e: "",
      hora_s: "",
      detalle_pagos: {
        pago: pago.id,
      },
      cliente_zona: pago.cliente_zona,
    };
    setDetalleRuteoSeleccionado([...detalleRuteoSeleccionado, nuevoDetalle]);
  };

  // Para cobros (mantener para cuando se implemente)
  const agregarDetalleCobro = (cobro: { id: number; monto: number, cliente_zona: string }) => {
    const yaExiste = detalleRuteoSeleccionado.some(
      (detalle) => detalle.detalle_cobros?.cobro === cobro.id
    );

    if (yaExiste) {
      alert("Este cobro ya ha sido agregado al ruteo");
      return;
    }

    const nuevoDetalle: DetalleRuteo = {
      monto: 0,
      estado: 1,
      obs: "",  
      hora_e: "",
      hora_s: "",
      detalle_cobros: {
        cobro: cobro.id,
      },
      cliente_zona: cobro.cliente_zona,
    };
    setDetalleRuteoSeleccionado([...detalleRuteoSeleccionado, nuevoDetalle]);
  };

  const estaSeleccionado = (item: { id: number | undefined }) => {
    return detalleRuteoSeleccionado.some(
      (detalle) =>
        detalle.detalle_pedidos?.pedido === item.id ||
        detalle.detalle_ventas?.venta === item.id
    );
  };

  function buscarProveedor(searchTerm: string) {
    return proveedores.filter((proveedor) => 
      proveedor.pro_razon.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function obtenerNombreClientePorId(clienteId: number) {
    const cliente = clientes.find(
      (cliente) => cliente.cli_codigo === clienteId
    );
    return cliente?.cli_razon || "-";
  }

  function obtenerNombreProveedorPorId(proveedorId: number) {
    const proveedor = proveedores.find(
      (proveedor) => proveedor.pro_codigo === proveedorId
    );
    return proveedor?.pro_razon || "-";
  }

const deseleccionarItem = (id: number | undefined) => {
  setDetalleRuteoSeleccionado(
    detalleRuteoSeleccionado.filter(
      (detalle) =>
        detalle.detalle_pedidos?.pedido !== id &&
        detalle.detalle_ventas?.venta !== id &&
        detalle.detalle_pagos?.pago !== id &&
        detalle.detalle_cobros?.cobro !== id
    )
  );
};


  return (
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack
        spacing={4}
        align="stretch"
        bg={"white"}
        p={2}
        borderRadius={"md"}
        boxShadow={"sm"}
        h={"100%"}
        overflowY={"auto"}
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
            Ruteamiento de pedidos
          </Heading>
        </Flex>
        <Flex flexDirection={isMobile ? "column" : "row"} gap={2}>
          <Box>
            <FormLabel>Sucursal</FormLabel>
            <Select
              value={sucursalSeleccionada?.id}
              onChange={(e) =>
                setSucursalSeleccionada(
                  sucursales.find(
                    (sucursal) => sucursal.id === Number(e.target.value)
                  ) || null
                )
              }
            >
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.descripcion}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>Fecha:</FormLabel>
            <Input
              type="date"
              value={fechaActual}
              onChange={(e) => setFechaActual(e.target.value)}
            />
          </Box>
          <Box>
            <FormLabel>Operador:</FormLabel>
            <Input disabled type="text" value={operadorNombre || ""} readOnly />
          </Box>
          <Box flex={1}>
            <FormLabel>Camion:</FormLabel>

            <Input
              type="text"
              value={camionSeleccionado?.descripcion || "Seleccionar camion"}
              readOnly
              onClick={onCamionesModalOpen}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Chofer:</FormLabel>
            <Input
              type="text"
              value={choferSeleccionado?.nombre || "Seleccionar chofer"}
              readOnly
              onClick={onChoferesModalOpen}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Moneda:</FormLabel>
            <Select
              value={monedaSeleccionada?.mo_descripcion}
              onChange={(e) =>
                setMonedaSeleccionada(
                  monedas.find(
                    (moneda) => moneda.mo_codigo === Number(e.target.value)
                  ) || null
                )
              }
            >
              {monedas.map((moneda) => (
                <option
                  key={moneda.mo_descripcion}
                  value={moneda.mo_descripcion}
                >
                  {moneda.mo_descripcion}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel>Km actual:</FormLabel>
            <Input
              type="number"
              value={kmActual}
              onChange={(e) => setKmActual(Number(e.target.value))}
            />
          </Box>
          <Box>
            <FormLabel>Km final:</FormLabel>
            <Input
              type="number"
              value={kmFinal}
              onChange={(e) => setKmFinal(Number(e.target.value))}
            />
          </Box>
        </Flex>
        <Flex
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          border={"1px #bfc6d3 solid"}
          p={2}
          rounded={"md"}
        >
          <Box>
            <FormLabel>Fecha desde:</FormLabel>
            <Input
              type="date"
              value={fecha_desde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </Box>
          <Box>
            <FormLabel>Fecha hasta:</FormLabel>
            <Input
              type="date"
              value={fecha_hasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </Box>
          <Box>
            <FormLabel>Filtrar por cliente:</FormLabel>
            <Input
              type="text"
              placeholder="Seleccionar cliente"
              value={clienteSeleccionadoParaFiltro || ""}
              readOnly
              onClick={onClienteModalOpen}
            />
          </Box>
          <Box
            justifyContent={"center"}
            alignItems={isMobile ? "center" : "end"}
            display={"flex"}
            flexDirection={isMobile ? "column" : "row"}
            gap={2}
          >
            <Button
              colorScheme="blue"
              variant={"outline"}
              onClick={() => {
                fetchPedidos();
                fetchVentas();
              }}
              w={isMobile ? "100%" : "auto"}
            >
              Buscar pedidos/ventas
            </Button>

            <Button
              colorScheme="green"
              variant={"outline"}
              onClick={onCobroModalOpen}
              w={isMobile ? "100%" : "auto"}
            >
              Agregar cliente
            </Button>
            <Button
              colorScheme="orange"
              variant={"outline"}
              onClick={onPagoModalOpen}
              w={isMobile ? "100%" : "auto"}
            >
              Agregar proveedor
            </Button>
          </Box>
        </Flex>
        <Flex flexDirection="column" gap={2}>
          {!isMobile && (
            <Flex
              flexDirection="row"
              gap={2}
              border="1px #bfc6d3 solid"
              p={2}
              rounded="md"
              bg="gray.100"
              w="100%"
              justifyContent="space-between"
            >
              <Text flex={1} fontWeight="bold">
                Tipo
              </Text>
              <Text flex={1} fontWeight="bold">
                Zona
              </Text>
              <Text flex={1} fontWeight="bold">
                ID
              </Text>
              <Text flex={1} fontWeight="bold">
                Fecha
              </Text>
              <Text flex={1} fontWeight="bold">
                Factura
              </Text>
              <Text flex={1} fontWeight="bold">
                Cliente/Proveedor
              </Text>
              <Text flex={1} fontWeight="bold">
                Condición
              </Text>
              <Text flex={1} fontWeight="bold">
                Monto
              </Text>
              <Text flex={1} fontWeight="bold">
                Vendedor
              </Text>
              <Text flex={1} fontWeight="bold">
                Observaciones
              </Text>
            </Flex>
          )}
          {[
            ...[...ventas, ...pedidos]
              .sort((a, b) => {
                if (a.factura && !b.factura) return -1;
                if (!a.factura && b.factura) return 1;
                return 0;
              })
              .map(
                (item): ItemTabla => ({
                  tipo: pedidos.includes(item) ? "Pedido" : "Venta",
                  zona: item.cliente_zona,
                  id: item.id,
                  fecha: item.fecha,
                  factura: item.factura,
                  cliente: item.cliente,
                  condicion: item.condicion,
                  monto: item.monto,
                  vendedor: item.vendedor,
                  observacion: item.observacion,
                  color: pedidos.includes(item) ? "blue" : "green",
                  onClick: () => {
                    if (estaSeleccionado(item)) {
                      deseleccionarItem(item.id);
                    } else {
                      setItemSeleccionado(item);
                      if (pedidos.includes(item)) {
                        fetchDetallePedidos(item.id);
                        onDetallePedidoOpen();
                      } else {
                        fetchDetalleVentas(item.id);
                        onDetalleVentaOpen();
                      }
                    }
                  },
                })
              ),
            ...detalleRuteoSeleccionado

              .filter(
                (detalle) => detalle.detalle_pagos || detalle.detalle_cobros
              )
              .map(
                (detalle): ItemTabla => ({
                  tipo: detalle.detalle_pagos ? "Pago" : "Cobro",
                  zona: detalle.cliente_zona,
                  id:
                    detalle.detalle_pagos?.pago ||
                    detalle.detalle_cobros?.cobro,
                  fecha: "-",
                  factura: "-",
                  cliente: detalle.detalle_pagos
                    ? "Pagar a: " +
                      obtenerNombreProveedorPorId(
                        detalle.detalle_pagos?.pago || 0
                      )
                    : "Cobrar a: " +
                      obtenerNombreClientePorId(
                        detalle.detalle_cobros?.cobro || 0
                      ),
                  condicion: "-",
                  monto: detalle.monto,
                  vendedor: "-",
                  observacion: detalle.obs,
                  color: detalle.detalle_pagos ? "orange" : "purple",
                })
              ),
          ].map((item) =>
            isMobile ? (
              <Box
                key={`${item.tipo}-${item.id}`}
                border="1px #bfc6d3 solid"
                p={4}
                rounded="md"
                bg={estaSeleccionado(item) ? `${item.color}.50` : "white"}
                borderLeft={`4px solid ${item.color}`}
                position="relative"
                w="100%"
                cursor={item.onClick ? "pointer" : "default"}
                _hover={{
                  bg: estaSeleccionado(item) ? `${item.color}.100` : "gray.100",
                }}
                onClick={item.onClick}
              >
                {estaSeleccionado(item) && (
                  <Box
                    position="absolute"
                    right={2}
                    top={2}
                    bg={`${item.color}.500`}
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <CheckCircle size={16} />
                  </Box>
                )}
                <VStack align="stretch" spacing={2}>
                  <Badge
                    colorScheme={
                      item.color === "blue"
                        ? "blue"
                        : item.color === "green"
                        ? "green"
                        : item.color === "orange"
                        ? "orange"
                        : "purple"
                    }
                    px={2}
                    py={1}
                    w="fit-content"
                  >
                    {item.tipo}
                  </Badge>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">ID:</Text>
                    <Text>#{item.id}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Zona:</Text>
                    <Text>{item.zona}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Fecha:</Text>
                    <Text>{item.fecha}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Factura:</Text>
                    <Text>{item.factura}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Cliente/Proveedor:</Text>
                    <Text>{item.cliente}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Condición:</Text>
                    <Text>{item.condicion}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Monto:</Text>
                    <Text>{formatearNumero(item.monto)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Vendedor:</Text>
                    <Text>{item.vendedor}</Text>
                  </Flex>
                  {item.observacion && (
                    <Box>
                      <Text color="gray.600">Observaciones:</Text>
                      <Text>{item.observacion}</Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            ) : (
              <Flex
                key={`${item.tipo}-${item.id}`}
                flexDirection="row"
                gap={2}
                border="1px #bfc6d3 solid"
                p={2}
                rounded="md"
                bg={estaSeleccionado(item) ? `${item.color}.50` : "white"}
                borderLeft={`4px solid ${item.color}`}
                borderRight={`4px solid ${item.color}`}
                position="relative"
                w="100%"
                justifyContent="space-between"
                cursor={item.onClick ? "pointer" : "default"}
                _hover={{
                  bg: estaSeleccionado(item) ? `${item.color}.100` : "gray.100",
                }}
                onClick={item.onClick}
              >
                {estaSeleccionado(item) && (
                  <Box
                    position="absolute"
                    right={2}
                    top={2}
                    bg={`${item.color}.500`}
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <CheckCircle size={16} />
                  </Box>
                )}
                <Text flex={1}>{item.tipo}</Text>
                <Text flex={1}>{item.zona}</Text>
                <Text flex={1}>{item.id}</Text>
                <Text flex={1}>{item.fecha}</Text>
                <Text flex={1}>{item.factura}</Text>
                <Text flex={1}>{item.cliente}</Text>
                <Text flex={1}>{item.condicion}</Text>
                <Text flex={1}>{formatearNumero(item.monto)}</Text>
                <Text flex={1}>{item.vendedor}</Text>
                <Text flex={1}>{item.observacion}</Text>
              </Flex>
            )
          )}
        </Flex>
        <Flex
          gap={2}
          justifyContent={"flex-end"}
          position={isMobile ? "relative" : "fixed"}
          bottom={isMobile ? 0 : 4}
          right={isMobile ? 0 : 4}
          zIndex={10}
          bg={"gray.100"}
          p={2}
          rounded={"md"}
        >
          <Button colorScheme="blue" onClick={insertarRepartoTabla}>
            Procesar
          </Button>
          <Button colorScheme="red" onClick={onDetallePedidoClose}>
            Cancelar
          </Button>
        </Flex>
      </VStack>
      <Modal isOpen={isCamionesModalOpen} onClose={onCamionesModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Lista de camiones</Heading>
          </ModalHeader>
          <ModalBody>
            <Flex
              gap={2}
              overflowY={"auto"}
              h={"500px"}
              flexDirection={"column"}
            >
              {camiones.map((camion) => (
                <Box
                  key={camion.id}
                  bg={
                    camionSeleccionado?.id === camion.id
                      ? "blue.200"
                      : "gray.100"
                  }
                  p={2}
                  rounded={"md"}
                  onClick={() => setCamionSeleccionado(camion)}
                  cursor={"pointer"}
                  _hover={{ bg: "gray.200" }}
                >
                  <Flex alignItems={"center"} gap={2}>
                    <Text>{camion.descripcion}</Text>
                    <p className="text-sm font-bold text-gray-500">
                      - {camion.chapa}
                    </p>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter justifyContent={"space-between"}>
            <Button
              variant={"outline"}
              colorScheme="red"
              onClick={() => {
                setCamionSeleccionado(null), onCamionesModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={onCamionesModalClose}>
              Seleccionar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isChoferesModalOpen} onClose={onChoferesModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Lista de choferes</Heading>
          </ModalHeader>
          <ModalBody>
            <Flex
              gap={2}
              overflowY={"auto"}
              h={"500px"}
              flexDirection={"column"}
            >
              {choferes.map((chofer) => (
                <Box
                  key={chofer.id}
                  bg={
                    choferSeleccionado?.id === chofer.id
                      ? "blue.200"
                      : "gray.100"
                  }
                  p={2}
                  rounded={"md"}
                  onClick={() => {
                    setChoferSeleccionado(chofer);
                    onChoferesModalClose();
                  }}
                  cursor={"pointer"}
                  _hover={{ bg: "gray.200" }}
                >
                  <Text>
                    {chofer.nombre} - {chofer.rol}
                  </Text>
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter justifyContent={"space-between"}>
            <Button
              variant={"outline"}
              colorScheme="red"
              onClick={() => {
                setChoferSeleccionado(null), onChoferesModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={onChoferesModalClose}>
              Seleccionar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isCobroModalOpen} onClose={onCobroModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Cobros</Heading>
          </ModalHeader>
          <ModalBody gap={4}>
            <Input
              placeholder="Buscar cliente"
              onChange={(e) => fetchClientes(e.target.value)}
            />
            <Flex
              flexDirection={"column"}
              gap={2}
              overflowY={"auto"}
              h={"500px"}
            >
              {clientes.map((cliente) => (
                <Box
                  key={cliente.cli_codigo}
                  p={2}
                  rounded={"md"}
                  bg={"gray.100"}
                  cursor={"pointer"}
                  _hover={{ bg: "gray.200" }}
                  onClick={() => {
                    agregarDetalleCobro({ id: cliente.cli_codigo, monto: 0, cliente_zona: cliente.zona });
                    onCobroModalClose();
                  }}
                >
                  <Text>{cliente.cli_razon}</Text>
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={onCobroModalClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isPagoModalOpen} onClose={onPagoModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Pagos</Heading>
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Buscar proveedor"
              onChange={(e) => setProveedores(buscarProveedor(e.target.value))}
            />

            <Flex
              flexDirection={"column"}
              gap={2}
              overflowY={"auto"}
              h={"500px"}
            >
              {proveedores.map((proveedor) => (
                <Box
                  key={proveedor.pro_codigo}
                  p={2}
                  rounded={"md"}
                  bg={"gray.100"}
                  cursor={"pointer"}
                  _hover={{ bg: "gray.200" }}
                  onClick={() => {
                    agregarDetallePago({ id: proveedor.pro_codigo, monto: 0, cliente_zona: proveedor.pro_zona });
                  }}
                >
                  <Text>{proveedor.pro_razon}</Text>
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={onPagoModalClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDetallePedidoOpen}
        onClose={onDetallePedidoClose}
        size={"3xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Detalle de pedidos</Heading>
          </ModalHeader>
          <ModalBody>
            <Flex>
              <Table variant={"striped"}>
                <Thead>
                  <Tr>
                    <Th>Codigo</Th>
                    <Th>Descripcion</Th>
                    <Th>Cantidad</Th>
                    <Th>Precio</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {detallePedidos.map((item) => (
                    <Tr>
                      <Td>{item.item}</Td>
                      <Td>{item.descripcion}</Td>
                      <Td>{formatearNumero(item.cantidad)}</Td>
                      <Td>{formatearNumero(item.precio)}</Td>
                      <Td>{formatearNumero(item.total)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={onDetallePedidoClose}>
              Cerrar
            </Button>
            <Button colorScheme="green" onClick={agregarDetallePedido}>
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDetalleVentaOpen}
        onClose={onDetalleVentaClose}
        size={"3xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Detalle de ventas</Heading>
          </ModalHeader>
          <ModalBody>
            <Flex>
              <Table variant={"striped"}>
                <Thead>
                  <Tr>
                    <Th>Codigo</Th>
                    <Th>Descripcion</Th>
                    <Th>Cantidad</Th>
                    <Th>Precio</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {detalleVentas.map((item) => (
                    <Tr>
                      <Td>{item.item}</Td>
                      <Td>{item.descripcion}</Td>
                      <Td>{formatearNumero(item.cantidad)}</Td>
                      <Td>{formatearNumero(item.precio)}</Td>
                      <Td>{formatearNumero(item.total)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button colorScheme="red" onClick={onDetalleVentaClose}>
              Cerrar
            </Button>
            <Button colorScheme="green" onClick={agregarDetalleVenta}>
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isClienteModalOpen} onClose={onClienteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size={"md"}>Seleccionar cliente</Heading>
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Buscar cliente"
              onChange={(e) => fetchClientes(e.target.value)}
            />
            <Flex
              flexDirection={"column"}
              gap={2}
              overflowY={"auto"}
              h={"500px"}
            >
              {clientes.map((cliente) => (
                <Box
                  key={cliente.cli_codigo}
                  p={2}
                  rounded={"md"}
                  bg={"gray.100"}
                  cursor={"pointer"}
                  _hover={{ bg: "gray.200" }}
                  onClick={() => {
                    setClienteSeleccionadoParaFiltro(cliente.cli_codigo);
                    onClienteModalClose();
                  }}
                >
                  <Text>{cliente.cli_razon}</Text>
                </Box>
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};


export default RuteamientoPedidos;
