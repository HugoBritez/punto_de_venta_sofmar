import {
  Box,
  Divider,
  Flex,
  FormLabel,
  Input,
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
} from "@chakra-ui/react";
import { Filter, FilterX, Pencil, Printer, Truck } from "lucide-react";
import HeaderComponent from "@/modules/Header";
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
import axios from "axios";
import { api_url } from "@/utils";
import { Agenda, Cliente, Vendedor } from "@/types/shared_interfaces";
import { es } from "date-fns/locale";
import { useAuth } from "@/services/AuthContext";
import Auditar from "@/services/AuditoriaHook";
import { usePDF } from "react-to-pdf";
import { ModalMultiselector } from "@/modules/ModalMultiselector";
import DetalleRuteamiento from "./DetalleRuteamiento";
import ReporteAgendas from "./ReporteAgendas";

const periodos = [
  { label: "Hoy", value: "hoy" },
  { label: "Mañana", value: "manana" },
  { label: "Siguientes 3 Días", value: "tresDias" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mes", value: "mes" },
];

const PlanificacionRuteamientos = () => {
  const vendedorActual = Number(sessionStorage.getItem("user_id"));

  const { toPDF, targetRef } = usePDF({ filename: `informeRuteamiento.pdf` });
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
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
  const [clientesSeleccionadoParaFiltro, setClientesSeleccionadoParaFiltro] =
    useState<number[]>([]);
  const [vendedoresSeleccionadosParaFiltro, setVendedorSeleccionadoParaFiltro] =
    useState<number[]>([]);
  const [vendedorBusqueda, setVendedorBusqueda] = useState("");
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [recomendacionesVendedores, setRecomendacionesVendedores] = useState<
    typeof vendedores
  >([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<
    (typeof clientes)[0] | null
  >(null);
  const [, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  const operadorNombre = sessionStorage.getItem("user_name");


  const operador_rol = Number(sessionStorage.getItem("rol"));
  
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

  const tienePermisos = () =>{
    if (operador_rol === 7 || operador_rol === 11){
      return vendedoresSeleccionadosParaFiltro;
    } else {
      return vendedorActual;
    }
}

  const tienePermisosBooleano = () => {
    if (operador_rol === 7 || operador_rol === 11) {
      return false;
    } else {
      return true;
  };
}

  const fetchRuteamientos = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        cliente: clientesSeleccionadoParaFiltro,
        vendedor: tienePermisos(),
        visitado: filtroCondicion,
        estado: filtroEstado,
        planificacion: filtroPlanificacion,
        orden: filtroOrden,
      });
      console.log(response.data.body);

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

  const fetchVendedores = async (busqueda: string = "") => {
    if (!auth) {
      setError("No estás autentificado");
      return;
    }
    try {
      const response = await axios.get(`${api_url}usuarios`, {
        params: {
          buscar: busqueda,
        },
      });
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

  const fetchClientes = async (busqueda: string = "") => {
    if (!auth) {
      setError("No estás autentificado");
      return;
    }
    try {
      const response = await axios.get(`${api_url}clientes/get-clientes`, {
        params: {
          buscar: busqueda,
        },
      });
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
    fetchVendedores();
    console.log('rol del operador', operador_rol);
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

  const {
    onOpen: onClienteOpen,
    onClose: onClienteClose,
    isOpen: isClienteOpen,
  } = useDisclosure();

  const {
    onOpen: onVendedorOpen,
    onClose: onVendedorClose,
    isOpen: isVendedorOpen,
  } = useDisclosure();

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
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack
        spacing={4}
        align="stretch"
        bg={"white"}
        p={2}
        borderRadius={"md"}
        boxShadow={"sm"}
        h={"100%"}
      >
        <HeaderComponent Icono={Truck} titulo="Ingreso de planificaciones" />

        {isMobile && (
          <Flex gap={4}>
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
              <FormLabel>Filtrar por cliente:</FormLabel>
              <Input
                readOnly
                placeholder="Buscar cliente"
                onClick={() => onClienteOpen()}
              />
            </Box>
            <Box flex={1}>
              <FormLabel>Filtrar por vendedor:</FormLabel>
              <Input
                readOnly
                placeholder="Buscar vendedor"
                onClick={() => onVendedorOpen()}
                disabled = {tienePermisosBooleano()}
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
          {ruteamientos.map((ruteamiento) => {
            return (
              <DetalleRuteamiento
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
                clienteId={ruteamiento.cliente_id}
                deudas_cliente={ruteamiento.deudas_cliente}
                hora_llegada={ruteamiento.l_hora_inicio}
                hora_salida={ruteamiento.l_hora_fin}
                clienteRuc={ruteamiento.cli_ruc}
                clienteDireccion={ruteamiento.cli_dir}
              />
            );
          })}
        </Grid>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
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
                    onChange={(e) => {
                      setClienteBusqueda(e.target.value);
                      fetchClientes(e.target.value);
                    }}
                    aria-autocomplete="list"
                    aria-controls="cliente-recommendations"
                    mb={4}
                  />
                  {clientes.length > 0 && clienteBusqueda && (
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
                      {clientes.slice(0, 5).map((cliente) => (
                        <Box
                          key={cliente.cli_codigo}
                          p={2}
                          _hover={{ bg: "gray.100" }}
                          cursor="pointer"
                          onClick={() => {
                            setClienteBusqueda(cliente.cli_razon);
                            setClienteSeleccionado(cliente);
                            setClientes([]);
                          }}
                        >
                          <div className="flex flex-row gap-2 items-center justify-between">
                            <Text fontWeight="bold">{cliente.cli_razon}</Text>
                            <Text as="span" color="gray.500" fontSize="sm">
                              RUC: {cliente.cli_ruc}
                            </Text>
                          </div>
                          <p className="text-sm text-gray-500">
                            {cliente.cli_dir}
                          </p>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Input
                    id="vendedor-search"
                    placeholder={`Vendedor:  ${operadorNombre}`}
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
      <Modal isOpen={isOpenModal} onClose={onCloseModal} size={"full"}>
        <ModalOverlay />
        <ModalContent overflowY={"auto"}>
          <ModalCloseButton />
          <ModalBody>
            <ReporteAgendas
              Agendas={ruteamientos}
              onPrint={() => {
                toPDF(targetRef.current);
                onCloseModal();
              }}
              filtros={{
                fechaInicio: fechaDesde,
                fechaFin: fechaHasta,
                cliente: clientesSeleccionadoParaFiltro,
                estado:
                  filtroEstado === -1
                    ? "Todos"
                    : filtroEstado === 1
                    ? "Activos"
                    : "Anulados",
                planificacion:
                  filtroPlanificacion === -1
                    ? "Todos"
                    : filtroPlanificacion === 1
                    ? "Planificados"
                    : "Sin planificación",
                condicion:
                  filtroCondicion === -1
                    ? "Todos"
                    : filtroCondicion === 1
                    ? "Visitados"
                    : "No visitados",
              }}
            />
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ModalMultiselector
        isOpen={isClienteOpen}
        onClose={onClienteClose}
        title="Filtrar por cliente"
        items={clientes}
        onSearch={(busquedaCliente) => fetchClientes(busquedaCliente)}
        onSelect={(item) => {
          setClientesSeleccionadoParaFiltro((prev) => {
            if (!prev) return [item.cli_codigo];

            const exists = prev.includes(item.cli_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.cli_codigo);
            }
            return [...prev, item.cli_codigo];
          });
        }}
        onConfirm={() => {
          onClienteClose();
          fetchRuteamientos();
        }}
        idField="cli_codigo"
        displayField="cli_razon"
        selectedItems={clientesSeleccionadoParaFiltro?.map((codigo) => {
          const cliente = clientes.find((c) => c.cli_codigo === codigo);
          return cliente || { cli_codigo: codigo, cli_razon: "" };
        })}
        searchPlaceholder="Buscar cliente por nombre"
      />
      <ModalMultiselector
        isOpen={isVendedorOpen}
        onClose={onVendedorClose}
        title="Filtrar por vendedores"
        items={vendedores}
        onSearch={(busquedaVendedor) => fetchVendedores(busquedaVendedor)}
        onSelect={(item) => {
          setVendedorSeleccionadoParaFiltro((prev) => {
            if (!prev) return [Number(item.op_codigo)];
            const exists = prev.includes(Number(item.op_codigo));
            if (exists) {
              return prev.filter((codigo) => codigo !== Number(item.op_codigo));
            }
            return [...prev, Number(item.op_codigo)];
          });
        }}
        onConfirm={() => {
          onVendedorClose();
          fetchRuteamientos();
        }}
        idField="op_codigo"
        displayField="op_nombre"
        searchPlaceholder={`${operadorNombre}`}
        selectedItems={vendedoresSeleccionadosParaFiltro?.map((codigo) => {
          const vendedor = vendedores.find(
            (v) => v.op_codigo === String(codigo)
          );
          return vendedor || { op_codigo: String(codigo), op_nombre: "" };
        })}
      />
    </Box>
  );
};

export default PlanificacionRuteamientos;
