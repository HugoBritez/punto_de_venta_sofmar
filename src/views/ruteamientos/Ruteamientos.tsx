import {
  Box,
  Divider,
  Flex,
  FormLabel,
  Input,
  InputGroup,
  Select,
  useMediaQuery,
  VStack,
  Grid,
  IconButton,
  Tabs,
  TabList,
  Tab,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Textarea,
  Text,
  Heading,
  Table,
  Tr,
  Th,
  Td,
  Thead,
  Tbody,
} from "@chakra-ui/react";
import { Filter, FilterX, Pencil, Printer, Truck } from "lucide-react";
import HeaderComponent from "../modules/Header";
import { useEffect, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import RuteamientoCard from "./RuteamientoCard";
import axios from "axios";
import { api_url } from "@/utils";
import { Agenda, Cliente, Vendedor } from "@/types/shared_interfaces";
import { es } from "date-fns/locale";
import { useAuth } from "@/services/AuthContext";
import Auditar from "@/services/AuditoriaHook";
import { usePDF } from "react-to-pdf";

const periodos = [
  { label: "Hoy", value: "hoy" },
  { label: "Mañana", value: "manana" },
  { label: "Siguientes 3 Días", value: "tresDias" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mes", value: "mes" },
];

const Ruteamientos = () => {
  const { toPDF, targetRef } = usePDF({ filename: `informeRuteamiento.pdf` });
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
  const [vendedorFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [ruteamientos, setRuteamientos] = useState<Agenda[]>([]);
  const toast = useToast();

  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [vendedor, setVendedor] = useState("");
  const [planificacion, setPlanificacion] = useState(1);
  const [prioridad, setPrioridad] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState(-1);
  const [filtroCondicion, setFiltroCondicion] = useState(-1);
  const [filtroPlanificacion, setFiltroPlanificacion] = useState(1);
  const [filtroOrden, setFiltroOrden] = useState("2");
  const [observacion, setObservacion] = useState("");
  const [fechaAgendamiento, setFechaAgendamiento] = useState("");
  const [horaProxima, setHoraProxima] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorBusqueda, setVendedorBusqueda] = useState("");
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [recomendacionesClientes, setRecomendacionesClientes] = useState<
    typeof clientes
  >([]);
  const [recomendacionesVendedores, setRecomendacionesVendedores] = useState<
    typeof vendedores
  >([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<
    (typeof clientes)[0] | null
  >(null);
  const [, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  const vendedorActual = Number(localStorage.getItem("user_id"));
  const operadorNombre = localStorage.getItem("user_name");
  const handlePeriodoChange = (index: number) => {
    setPeriodoSeleccionado(index);
    const hoy = new Date();
    let nuevaFechaDesde = hoy;
    let nuevaFechaHasta = hoy;

    switch (periodos[index].value) {
      case "hoy":
        nuevaFechaDesde = hoy;
        nuevaFechaHasta = hoy;
        break;
      case "manana":
        nuevaFechaDesde = addDays(hoy, 1);
        nuevaFechaHasta = addDays(hoy, 1);
        break;
      case "tresDias":
        nuevaFechaDesde = hoy;
        nuevaFechaHasta = addDays(hoy, 3);
        break;
      case "semana":
        nuevaFechaDesde = startOfWeek(hoy);
        nuevaFechaHasta = endOfWeek(hoy);
        break;
      case "mes":
        nuevaFechaDesde = startOfMonth(hoy);
        nuevaFechaHasta = endOfMonth(hoy);
        break;
    }

    setFechaDesde(format(nuevaFechaDesde, "yyyy-MM-dd"));
    setFechaHasta(format(nuevaFechaHasta, "yyyy-MM-dd"));
  };

  const agregarRuteamiento = () => {
    if (!clienteSeleccionado) {
      toast({
        title: "Error al agregar ruteamiento",
        description: "Debe seleccionar un cliente para poder agendar la visita",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const diaExacto = format(parseISO(fechaAgendamiento), "EEEE", {
        locale: es,
      });
      axios.post(`${api_url}agendas/agregar`, {
        a_codigo: 0,
        a_fecha: fechaAgendamiento,
        a_hora: horaProxima,
        a_dias: diaExacto,
        a_cliente: clienteSeleccionado?.cli_codigo,
        a_vendedor: vendedor || vendedorActual,
        a_planificacion: 1,
        a_prioridad: prioridad,
        a_obs: observacion,
        a_prox_llamada: "0001-01-01",
        a_hora_prox: "",
        a_prox_acti: "",
        a_visitado: 0,
        a_visitado_prox: 0,
        a_latitud: "",
        a_longitud: "",
        a_estado: 1,
        a_operador: vendedorActual,
      });
      toast({
        title: "Ruteamiento agregado",
        description: "La visita se ha agendado correctamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      Auditar(
        125,
        1,
        vendedorActual,
        vendedorActual,
        `Se agendó una visita a ${clienteSeleccionado?.cli_razon} para el día ${diaExacto} a las ${horaProxima} por el usuario ${vendedorActual}`
      );

      setClienteBusqueda("");
      setVendedorBusqueda("");
      setVendedor("");
      setPlanificacion(0);
      setPrioridad(0);
      setObservacion("");
      setClienteSeleccionado(null);
      setFechaAgendamiento("");
      setHoraProxima("");
      fetchRuteamientos();
    } catch (error) {
      toast({
        title: "Error al agregar ruteamiento",
        description:
          "Ocurrió un error al agregar el ruteamiento, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchRuteamientos = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        cliente: clienteFiltro,
        vendedor: vendedorFiltro,
        visitado: filtroCondicion,
        estado: filtroEstado,
        planificacion: filtroPlanificacion,
        orden: filtroOrden,
      });
      setRuteamientos(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar los ruteamientos",
        description:
          "Ocurrió un error al cargar los ruteamientos, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchVendedores = async () => {
    if (!auth) {
      setError("No estás autentificado");
      return;
    }
    try {
      const response = await axios.get(`${api_url}usuarios`);
      setVendedores(response.data.body);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
      toast({
        title: "Error",
        description: "Hubo un problema al traer los artículos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchClientes = async () => {
    if (!auth) {
      setError("No estás autentificado");
      return;
    }
    try {
      const response = await axios.get(`${api_url}clientes`);
      setClientes(response.data.body);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
      toast({
        title: "Error",
        description: "Hubo un problema al traer los artículos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBusquedaCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaCliente = e.target.value;
    setClienteBusqueda(busquedaCliente);
    if (busquedaCliente.length > 0) {
      const filteredRecomendacionesClientes = clientes
        .filter(
          (cliente) =>
            cliente.cli_razon
              .toLowerCase()
              .includes(busquedaCliente.toLowerCase()) ||
            cliente.cli_ruc.includes(busquedaCliente) ||
            cliente.cli_interno.toString().includes(busquedaCliente)
        )
        .slice(0, 5);
      setRecomendacionesClientes(filteredRecomendacionesClientes);
    } else {
      setRecomendacionesClientes([]);
    }
  };

  const handleBusquedaVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaVendedor = e.target.value;
    setVendedorBusqueda(busquedaVendedor);

    if (busquedaVendedor.length > 0) {
      const filteredVendedores = vendedores
        .filter(
          (vendedor) =>
            vendedor.op_nombre
              .toLowerCase()
              .includes(busquedaVendedor.toLowerCase()) ||
            vendedor.op_codigo.toString().includes(busquedaVendedor)
        )
        .slice(0, 5);

      setRecomendacionesVendedores(filteredVendedores);

      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].op_codigo);
      } else {
        setVendedor("");
      }
    } else {
      setRecomendacionesVendedores([]);
      setVendedor("");
    }
  };

  useEffect(() => {
    fetchRuteamientos();
  }, [
    fechaDesde,
    fechaHasta,
    planificacion,
    prioridad,
    filtroEstado,
    filtroCondicion,
    filtroPlanificacion,
    filtroOrden,
  ]);

  const cancelarAgenda = () => {
    setFechaAgendamiento("");
    setHoraProxima("");
    setClienteBusqueda("");
    setVendedorBusqueda("");
    setVendedor("");
    setPlanificacion(0);
    setPrioridad(0);
    setObservacion("");
    setClienteSeleccionado(null);
  };

  return (
    <Box maxW={"100vw"} p={2}>
      <VStack spacing={4} align={"stretch"}>
        <HeaderComponent Icono={Truck} titulo="Consulta de ruteamientos" />

        {isMobile && (
          <Flex gap={4}>
            {/* <InputGroup>
              <Input
                placeholder="Filtrar por vendedor"
                value={vendedorFiltro}
                onChange={(e) => setVendedorFiltro(e.target.value)}
              />
            </InputGroup> */}
            <InputGroup>
              <Input
                placeholder="Filtrar por cliente"
                value={clienteFiltro}
                onChange={(e) => setClienteFiltro(e.target.value)}
              />
            </InputGroup>
            <IconButton
              icon={<Pencil />}
              onClick={() => {
                onOpen();
                fetchClientes();
                fetchVendedores();
              }}
              aria-label={"Escribir nuevo ruteamiento"}
              colorScheme="green"
            />
            <IconButton
              icon={mostrarFiltros ? <FilterX /> : <Filter />}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              aria-label={""}
            />
          </Flex>
        )}
        {(isMobile && mostrarFiltros) || !isMobile ? (
          <Flex
            flexDirection={["column", "column", "row"]}
            gap={4}
            justifyContent="space-between"
          >
            <Box flex={1}>
              <FormLabel>Desde:</FormLabel>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </Box>
            <Box flex={1}>
              <FormLabel>Hasta:</FormLabel>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </Box>
            <Box flex={1}>
              <FormLabel>Estado:</FormLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(Number(e.target.value))}
              >
                <option value={-1}>Todos</option>
                <option value={1}>Activos</option>
                <option value={0}>Anulados</option>
              </Select>
            </Box>
            <Box flex={1}>
              <FormLabel>Condición:</FormLabel>
              <Select
                value={filtroCondicion}
                onChange={(e) => setFiltroCondicion(Number(e.target.value))}
              >
                <option value={-1}>Todos</option>
                <option value={1}>Visitado</option>
                <option value={0}>No visitado</option>
              </Select>
            </Box>
            <Box flex={1}>
              <FormLabel>Planificación:</FormLabel>
              <Select
                value={filtroPlanificacion}
                onChange={(e) => setFiltroPlanificacion(Number(e.target.value))}
              >
                <option value={1}>Con Planificación</option>
                <option value={0}>Sin Planificación</option>
              </Select>
            </Box>
            <Box flex={1}>
              <FormLabel>Ordenado por:</FormLabel>
              <Select
                value={filtroOrden}
                onChange={(e) => setFiltroOrden(e.target.value)}
              >
                <option value="0">Prioridad</option>
                <option value="1">Código</option>
                <option value="2">Fecha</option>
              </Select>
            </Box>
            <IconButton
              mt={8}
              icon={<Pencil />}
              onClick={() => {
                onOpen();
                fetchClientes();
                fetchVendedores();
              }}
              aria-label={"Escribir nuevo ruteamiento"}
              colorScheme="green"
            />
            <IconButton
              mt={8}
              icon={<Printer />}
              onClick={() => {
                onOpenModal();
              }}
              aria-label={"imprimir informe"}
              colorScheme="blue"
            />
          </Flex>
        ) : null}
        <Tabs
          index={periodoSeleccionado}
          onChange={handlePeriodoChange}
          variant={"solid-rounded"}
          colorScheme="green"
          w={"50%"}
        >
          <TabList>
            {periodos.map((periodo, index) => (
              <Tab key={index} fontSize={"sm"}>
                {periodo.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
        <Divider orientation="horizontal" my={4} />
        <Grid
          width={"100%"}
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={4}
        >
          {ruteamientos.map((ruteamiento) => (
            <RuteamientoCard
              key={ruteamiento.a_codigo}
              clienteNombre={ruteamiento.cliente}
              observacion={ruteamiento.a_obs}
              vendedor={ruteamiento.vendedor}
              prioridad={ruteamiento.a_prioridad}
              ruteamientoId={ruteamiento.a_codigo}
              fecha={ruteamiento.fecha}
              hora={ruteamiento.a_hora}
              dia={ruteamiento.a_dias}
              latitud={ruteamiento.a_latitud}
              longitud={ruteamiento.a_longitud}
              clienteTelefono={ruteamiento.cli_tel}
              misVisitas={ruteamiento.mis_visitas}
              misVisitasCliente={ruteamiento.mis_visitas_cliente}
              visitado={ruteamiento.a_visitado}
              planificacion={ruteamiento.a_planificacion}
              estado={ruteamiento.a_estado}
              l_longitud={ruteamiento.l_longitud}
              l_latitud={ruteamiento.l_latitud}
              fetchRuteamientos={fetchRuteamientos}
            />
          ))}
        </Grid>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent zIndex={9998}>
          <ModalHeader>Nuevo Agendamiento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={4}>
              <Box>
                <Box>
                  <Input
                    id="cliente-search"
                    placeholder="Buscar cliente por nombre o RUC"
                    value={clienteBusqueda}
                    onChange={handleBusquedaCliente}
                    aria-autocomplete="list"
                    aria-controls="cliente-recommendations"
                    mb={4}
                  />
                  {recomendacionesClientes.length > 0 && (
                    <Box
                      id="cliente-recommendations"
                      position="relative"
                      top="100%"
                      left={0}
                      right={0}
                      zIndex={10}
                      bg="white"
                      boxShadow="md"
                      borderRadius="md"
                      mt={1}
                      className="recomendaciones-menu"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {recomendacionesClientes.map((cliente) => {
                        return (
                          <Box
                            key={cliente.cli_codigo}
                            p={2}
                            _hover={{ bg: "gray.100" }}
                            cursor="pointer"
                            onClick={() => {
                              setClienteBusqueda(cliente.cli_razon);
                              setClienteSeleccionado(cliente);
                              setRecomendacionesClientes([]);
                            }}
                          >
                            <Text fontWeight="bold">{cliente.cli_razon}</Text>
                            <Text as="span" color="gray.500" fontSize="sm">
                              RUC: {cliente.cli_ruc}
                            </Text>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  <Input
                    id="vendedor-search"
                    placeholder="Buscar vendedor (Por defecto el usuario actual)"
                    value={vendedorBusqueda}
                    onChange={handleBusquedaVendedor}
                    onFocus={() => {
                      if (vendedor) {
                        setVendedorBusqueda("");
                        setRecomendacionesVendedores([]);
                      }
                    }}
                    aria-autocomplete="list"
                    aria-controls="vendedor-recommendations"
                  />
                  {vendedor && (
                    <Text mt={2} fontWeight="bold" color="green.500">
                      Vendedor seleccionado: {vendedor}
                    </Text>
                  )}
                  {recomendacionesVendedores.length === 0 &&
                    vendedorBusqueda.length > 0 &&
                    !vendedor && (
                      <Text color="red.500" mt={2}>
                        No se encontró vendedor con ese código
                      </Text>
                    )}
                  {recomendacionesVendedores.length > 0 && (
                    <Box
                      id="vendedor-recommendations"
                      position="relative"
                      top="100%"
                      left={0}
                      right={0}
                      zIndex={9999}
                      bg="white"
                      boxShadow="md"
                      borderRadius="md"
                      mt={1}
                      className="recomendaciones-menu"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {recomendacionesVendedores.map((vendedor) => (
                        <Box
                          key={vendedor.op_codigo}
                          p={2}
                          _hover={{ bg: "gray.100" }}
                          cursor="pointer"
                          onClick={() => {
                            setVendedorBusqueda(vendedor.op_codigo);
                            setVendedor(vendedor.op_codigo);
                            setRecomendacionesVendedores([]);
                          }}
                        >
                          <Text fontWeight="bold">{vendedor.op_nombre}</Text>
                          <Text as="span" color="gray.500" fontSize="sm">
                            Código: {vendedor.op_codigo}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Flex gap={4} my={4}>
                  <Box flexGrow={1}>
                    <FormLabel>Fecha a agendar:</FormLabel>
                    <Input
                      type="date"
                      value={fechaAgendamiento}
                      onChange={(e) => setFechaAgendamiento(e.target.value)}
                    />
                  </Box>
                  <Box flexGrow={1}>
                    <FormLabel>Hora:</FormLabel>
                    <Input
                      type="time"
                      value={horaProxima}
                      onChange={(e) => setHoraProxima(e.target.value)}
                    />
                  </Box>
                </Flex>

                <Flex gap={4} mb={4}>
                  <Box flexGrow={1}>
                    <FormLabel>Tipo de visita:</FormLabel>
                    <Select
                      placeholder="Planificación"
                      value={planificacion}
                      onChange={(e) => setPlanificacion(Number(e.target.value))}
                    >
                      <option value={1}>Con Planificación</option>
                      <option value={0}>Sin Planificación</option>
                    </Select>
                  </Box>

                  <Box flexGrow={1}>
                    <FormLabel>Prioridad:</FormLabel>
                    <Select
                      placeholder="Prioridad"
                      value={prioridad}
                      onChange={(e) => setPrioridad(Number(e.target.value))}
                    >
                      <option value={3}>Baja</option>
                      <option value={2}>Media</option>
                      <option value={1}>Alta</option>
                    </Select>
                  </Box>
                </Flex>

                <FormLabel>Observación:</FormLabel>
                <Textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  h={"200px"}
                  variant={"filled"}
                />
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant={"outline"}
              colorScheme="red"
              onClick={() => {
                cancelarAgenda();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                agregarRuteamiento();
                onClose();
              }}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenModal} onClose={onCloseModal} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              ref={targetRef}
              py={8}
              px={16}
            >
              <Flex flexDir={"column"}>
                <Text fontSize="lg" textAlign="end">
                  {operadorNombre} - {fechaHasta} -{" "}
                  {format(new Date(), "HH:mm:ss")} - Web
                </Text>
                <Heading as="h1" size="2xl" textAlign="center" mb={4}>
                  Informe de Ruteamientos
                </Heading>
                <Divider orientation="horizontal" my={4} />
                <Flex flexDir={"column"} gap={4}>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    {" "}
                    Cliente: Todos
                  </Text>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    {" "}
                    Vendedor: {operadorNombre}
                  </Text>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    {" "}
                    Desde: {fechaDesde} Hasta: {fechaHasta}
                  </Text>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    Estado:{" "}
                    {filtroEstado === -1
                      ? "Todos"
                      : filtroEstado === 1
                      ? "Activos"
                      : "Anulados"}
                  </Text>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    Planificación:{" "}
                    {filtroPlanificacion === -1
                      ? "Todos"
                      : filtroPlanificacion === 1
                      ? "Planificados"
                      : "Sin planificación"}
                  </Text>
                  <Text fontWeight={"bold"} fontSize={"xx-large"}>
                    Condición:{" "}
                    {filtroCondicion === -1
                      ? "Todos"
                      : filtroCondicion === 1
                      ? "Visitados"
                      : "No visitados"}
                  </Text>
                </Flex>
                <Divider orientation="horizontal" my={4} />
                <Table size={"md"} variant={"striped"}>
                  <Thead>
                    <Tr>
                      <Th fontSize={"x-large"}>Código</Th>
                      <Th fontSize={"x-large"}>Fecha</Th>
                      <Th fontSize={"x-large"}>Hora</Th>
                      <Th fontSize={"x-large"}>Dia</Th>
                      <Th fontSize={"x-large"}>Cliente</Th>
                      <Th fontSize={"x-large"}>Visitado</Th>
                      <Th fontSize={"x-large"}>Obs.</Th>
                      <Th fontSize={"x-large"}>F. Prox</Th>
                      <Th fontSize={"x-large"}>V. Prox</Th>
                      <Th fontSize={"x-large"}>Planificado</Th>
                      <Th fontSize={"x-large"}>Vendedor</Th>
                    </Tr>
                    <Tr>
                      <Box my={8} />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ruteamientos.map((ruteamiento) => (
                      <Tr key={ruteamiento.a_codigo}>
                        <Td fontSize={"x-large"}>{ruteamiento.a_codigo}</Td>
                        <Td fontSize={"x-large"}>{ruteamiento.fecha}</Td>
                        <Td fontSize={"x-large"}>{ruteamiento.a_hora}</Td>
                        <Td fontSize={"x-large"}>{ruteamiento.a_dias}</Td>
                        <Td fontSize={"x-large"}>{ruteamiento.cliente}</Td>
                        <Td fontSize={"x-large"}>
                          {ruteamiento.a_visitado === 1 ? "Si" : "No"}
                        </Td>
                        <Td fontSize={"x-large"}>{ruteamiento.a_obs}</Td>
                        <Td fontSize={"x-large"}>
                          {ruteamiento.a_prox_llamada}
                        </Td>
                        <Td fontSize={"x-large"}>
                          {ruteamiento.a_prox_acti === "" ? "No" : "Sí"}
                        </Td>
                        <Td fontSize={"x-large"}>
                          {ruteamiento.a_planificacion === 1 ? "Si" : "No"}
                        </Td>
                        <Td fontSize={"x-large"}>{ruteamiento.vendedor}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={()=>{
              toPDF(targetRef.current);
              onCloseModal();
            }}>
              Descargar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Ruteamientos;
