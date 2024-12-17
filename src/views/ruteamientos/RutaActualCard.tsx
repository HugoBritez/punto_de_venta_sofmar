import Auditar from "@/services/AuditoriaHook";
import { DetalleVenta, Nota, Venta } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";
import {
  BookOpenCheck,
  CalendarFold,
  CircleUserRound,
  LayoutList,
  MapPinCheckInside,
  MapPinPlus,
  Phone,
  Search,
  SquarePen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Pedidos, DetallePedidos } from "@/types/shared_interfaces";

interface RutaActualCardProps {
  clienteNombre?: string;
  clienteId?: number;
  clienteTelefono?: string;
  observacion?: string;
  fecha?: string;
  hora?: string;
  dia?: string;
  vendedor?: string;
  prioridad?: number;
  visitado?: number;
  planificacion?: number;
  latitud?: string;
  longitud?: string;
  estado?: number;
  ruteamientoId?: number;
  fetchRuteamientos?: () => void;
  onFinalizarVisita: () => void;
}

const RutaActualCard = ({
  clienteNombre = "Cliente sin nombre",
  clienteId,
  clienteTelefono,
  fecha = "19/10/1998",
  hora = "",
  dia = "",
  ruteamientoId = 0,
  fetchRuteamientos,
  onFinalizarVisita,
}: RutaActualCardProps) => {
  const [nota, setNota] = useState<string>("");
  const [notasRuteamiento, setNotasRuteamiento] = useState<Nota[]>([]);
  const toast = useToast();
  const [llegadaMarcada, setLlegadaMarcada] = useState<boolean>(false);
  const {
    isOpen: isOpenPedido,
    onOpen: onOpenPedido,
    onClose: onClosePedido,
  } = useDisclosure();

  const {
    isOpen: isOpenVenta,
    onOpen: onOpenVenta,
    onClose: onCloseVenta,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fechaProxima, setFechaProxima] = useState<string>("");
  const [horaProxima, setHoraProxima] = useState<string>("");
  const [pedidos, setPedidos] = useState<Pedidos[]>([]);
  const [detallesPedidos, setDetallesPedidos] = useState<{ [key: number]: DetallePedidos[] }>({});
  const [editarPedido, ] = useState<boolean>(false);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesVentas, setDetallesVentas] = useState<{ [key: number]: DetalleVenta[] }>({});


  const agregarNota = async () => {
    try {
      if (nota.length > 0) {
      const response = await axios.post(`${api_url}agendas/nueva-nota`, {
        an_agenda_id: ruteamientoId,
        an_nota: nota,
        an_fecha: new Date().toISOString().split("T")[0],
        an_hora: new Date().toISOString().split("T")[1].split(".")[0],
        an_sistema: 0,
      });

      if (response.data.status === 201) {
        toast({
          title: "Nota agregada",
          description: "La nota fue agregada correctamente",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setNota("");
        Auditar(
          125,
          1,
          ruteamientoId,
          Number(localStorage.getItem("user_id")),
          `Se agregó una nota al ruteamiento #${ruteamientoId}`
        );
        }
      }else{
        toast({
          title: "Error",
          description: "La nota no puede estar vacia",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error al agregar la nota",
        description:
          "Ocurrió un error al agregar la nota, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchNotasRuteamiento = async (id: number) => {
    try {
      const response = await axios.get(`${api_url}agendas/notas/${id}`);
      setNotasRuteamiento(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar las notas",
        description:
          "Ocurrió un error al cargar las notas, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const marcarLLegada = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await axios.post(`${api_url}agendas/registrar-llegada`, {
              l_agenda: ruteamientoId,
              l_fecha: new Date().toISOString().split("T")[0],
              l_hora_inicio: new Date()
                .toISOString()
                .split("T")[1]
                .split(".")[0],
              l_obs: "Llegada del vendedor",
              l_cliente: clienteId,
              l_operador: localStorage.getItem("user_id"),
              l_longitud: position.coords.longitude.toString(),
              l_latitud: position.coords.latitude.toString(),
              l_acuracia: 1,
              l_estado: 1,
              l_codigo: 0,
            });
            toast({
              title: "Llegada marcada",
              description: "La llegada ha sido marcada exitosamente",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            setLlegadaMarcada(true);
            Auditar(
              125,
              1,
              ruteamientoId,
              Number(localStorage.getItem("user_id")),
              `El operador #${localStorage.getItem(
                "user_id"
              )} llego a su destino en la visita #${ruteamientoId}`
            );

            localStorage.setItem(`llegadaMarcada_${ruteamientoId}`, "true");
          } catch (error) {
            toast({
              title: "Error al marcar la llegada",
              description:
                "Ocurrió un error al marcar la llegada, por favor intente nuevamente",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        (error) => {
          toast({
            title: "Error obteniendo ubicación",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta geolocalización.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const marcarSalida = async () => {
    try {
      await axios.post(`${api_url}agendas/registrar-salida`, {
        l_agenda: ruteamientoId,
        l_hora_fin: new Date().toISOString().split("T")[1].split(".")[0],
      });
      Auditar(
        125,
        1,
        ruteamientoId,
        Number(localStorage.getItem("user_id")),
        `El operador #${localStorage.getItem(
          "user_id"
        )} salio de su destino en la visita #${ruteamientoId}`
      );
    } catch (error) {
      toast({
        title: "Error al marcar la salida",
        description:
          "Ocurrió un error al marcar la salida, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const reagendarVisita = async () => {
    try {
      await axios.post(`${api_url}agendas/reagendar-visita`, {
        a_codigo: ruteamientoId,
        a_prox_llamada: fechaProxima,
        a_hora_prox: horaProxima,
      });
      Auditar(
        125,
        2,
        ruteamientoId,
        Number(localStorage.getItem("user_id")),
        `Se reagendo una visita del ruteamiento #${ruteamientoId}`
      );
    } catch (error) {
      toast({
        title: "Error al reagendar la visita",
        description:
          "Ocurrió un error al reagendar la visita, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const finalizarVisita = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await axios.post(`${api_url}agendas/finalizar-visita`, {
              a_codigo: ruteamientoId,
              a_latitud: position.coords.latitude.toString(),
              a_longitud: position.coords.longitude.toString(),
            });
            toast({
              title: "Visita finalizada",
              description: "La visita ha sido finalizada exitosamente",
              status: "success",
              duration: 5000,
              isClosable: true,
            });

            onFinalizarVisita();
            fetchRuteamientos && fetchRuteamientos();
            Auditar(
              125,
              1,
              ruteamientoId,
              Number(localStorage.getItem("user_id")),
              `Se finalizó la visita #${ruteamientoId}`
            );
          } catch (error) {
            toast({
              title: "Error al finalizar la visita",
              description:
                "Ocurrió un error al finalizar la visita, por favor intente nuevamente",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
        (error) => {
          toast({
            title: "Error obteniendo ubicación",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta geolocalización.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchNotasRuteamiento(ruteamientoId);

    const llegadaMarcadaStatus = localStorage.getItem(
      `llegadaMarcada_${ruteamientoId}`
    );
    if (llegadaMarcadaStatus === "false") {
      setLlegadaMarcada(true);
    } else {
      setLlegadaMarcada(false);
    }
  }, [ruteamientoId]);

  useEffect(() => {
    const cargarPedidosYDetalles = async () => {
      try {
        // Primero cargamos los pedidos
        const responsePedidos = await axios.post(`${api_url}pedidos/consultas`, {
          cliente: clienteId,
          limit: 3,
        });
        
        setPedidos(responsePedidos.data.body);
        
        // Luego cargamos los detalles de cada pedido
        for (const pedido of responsePedidos.data.body) {
          const responseDetalles = await axios.get(
            `${api_url}pedidos/detalles?cod=${pedido.codigo}`
          );
          setDetallesPedidos(prev => ({
            ...prev,
            [pedido.codigo]: responseDetalles.data.body
          }));
        }
      } catch (error) {
        toast({
          title: "Error al cargar los pedidos y detalles",
          description: "Por favor, intenta de nuevo más tarde",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    cargarPedidosYDetalles();
  }, [clienteId]);

  useEffect(() => {
    const cargarVentasYDetalles = async () => {
      try {
        // Primero cargamos las ventas
        const responseVentas = await axios.post(`${api_url}venta/consultas`, {
          cliente: clienteId,
          vendedor: Number(localStorage.getItem("user_id")),
          limit: 5,
        });
        
        setVentas(responseVentas.data.body);
        
        // Luego cargamos los detalles de cada venta
        for (const venta of responseVentas.data.body) {
          const responseDetalles = await axios.get(
            `${api_url}venta/detalles?cod=${venta.codigo}`
          );
          setDetallesVentas(prev => ({
            ...prev,
            [venta.codigo]: responseDetalles.data.body
          }));
        }
      } catch (error) {
        toast({
          title: "Error al cargar las ventas y detalles",
          description: "Por favor, intenta de nuevo más tarde",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    cargarVentasYDetalles();
  }, [clienteId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

 
  
  return (
    <>
      <Card variant={"outline"}>
        <CardBody>
          <Flex flexDir={"column"} gap={4}>
            <Box
              bg={"blue.500"}
              height={"auto"}
              borderRadius={"md"}
              p={2}
              display={"flex"}
              flexDir={"column"}
              gap={2}
            >
              <Flex gap={2}>
                <CircleUserRound color="white" />
                <Text color={"white"} fontWeight={"bold"}>
                  {clienteNombre}
                </Text>
              </Flex>
              <Flex gap={2}>
                <CalendarFold color="white" />
                <Text color={"white"} fontWeight={"bold"}>
                  {dia} {fecha} {hora}
                </Text>
              </Flex>
              <Flex gap={2}>
                <Phone color="white" />
                <Text color={"white"} fontWeight={"bold"}>
                  {clienteTelefono}
                </Text>
              </Flex>
            </Box>
            <Button
              colorScheme={llegadaMarcada ? "red" : "green"}
              w={"100%"}
              h={16}
              onClick={
                llegadaMarcada
                  ? () => {
                      onOpen();
                      marcarSalida();
                    }
                  : marcarLLegada
              }
            >
              <Text>{llegadaMarcada ? "Marcar Salida" : "Marcar LLegada"}</Text>{" "}
              {llegadaMarcada ? <MapPinCheckInside /> : <MapPinPlus />}
            </Button>
            <Tabs align="end" variant="soft-rounded" colorScheme="green">
              <TabList mb="1em">
                <Tab>
                  <SquarePen />
                </Tab>
                <Tab onClick={() => fetchNotasRuteamiento(ruteamientoId)}>
                  <BookOpenCheck />
                </Tab>
                <Tab>
                  <LayoutList />
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box>
                    <Textarea
                      variant={"filled"}
                      placeholder="Escribe tus notas aqui..."
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                    ></Textarea>
                    <Flex mt={4} w={"100%"} justify={"flex-end"}>
                      <Button colorScheme={"green"} onClick={agregarNota}>
                        Agregar Nota
                      </Button>
                    </Flex>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Flex
                    flexDir={"column"}
                    gap={2}
                    overflowY={"auto"}
                    maxH={"300px"}
                  >
                    {notasRuteamiento.map((nota) => (
                      <Box
                        key={nota.an_codigo}
                        bg={"gray.100"}
                        borderRadius={"md"}
                        p={2}
                        maxH={"10rem"}
                        overflowY={"auto"}
                      >
                        <Text fontWeight={"bold"}>Nota #{nota.an_codigo}</Text>
                        <Text>{nota.an_nota}</Text>
                        <Divider></Divider>
                      </Box>
                    ))}
                  </Flex>
                </TabPanel>
                <TabPanel>
                  <Flex
                    gap={4}
                    width={"100%"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Button
                      colorScheme="blue"
                      height={"50px"}
                      variant={"outline"}
                      onClick={() => {
                        onOpenPedido();
                      }}
                    >
                      Consultar Pedidos <Search />
                    </Button>
                    <Button
                      colorScheme="blue"
                      height={"50px"}
                      variant={"outline"}
                      onClick={() => {
                        onOpenVenta();
                      }}
                    >
                      Consultar Ventas <Search />
                    </Button>
                  </Flex>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </CardBody>
      </Card>
      <Modal isOpen={isOpenVenta} onClose={onCloseVenta} size={"lg"} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">Últimas ventas de {clienteNombre}</Text>
              <Divider />
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} w="100%">
              {ventas.map((venta) => (
                <Box
                  key={venta.codigo}
                  w="100%"
                  borderRadius="lg"
                  bg="gray.50"
                  p={4}
                  border={"1px solid"}
                  borderColor={"green.600"}
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md">Venta #{venta.codigo}</Heading>
                    <Badge colorScheme="green" fontSize="sm" p={2} variant="solid">
                      {venta.fecha}
                    </Badge>
                  </Flex>

                  <Box maxH="300px" overflowY="auto">
                    {detallesVentas[venta.codigo]?.map((detalle, idx) => (
                      <Flex
                        key={idx}
                        justify="space-between"
                        bg="white"
                        p={4}
                        mb={2}
                        borderRadius="md"
                        boxShadow="sm"
                        _hover={{ boxShadow: "md" }}
                        transition="all 0.2s"
                      >
                        <VStack align="start" spacing={1}>
                          <Heading size="sm">{detalle.descripcion}</Heading>
                          <Text color="gray.600" fontSize="sm">
                            Cantidad: {detalle.cantidad}
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Heading size="sm" color="green.600">
                            {formatCurrency(detalle.precio * detalle.cantidad)}
                          </Heading>
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(detalle.precio)} c/u
                          </Text>
                        </VStack>
                      </Flex>
                    ))}
                  </Box>

                  <Flex justify="flex-end" bg="white" p={2} mt={2} borderRadius="md">
                    <Heading size="sm">Total: {formatCurrency(venta.total)}</Heading>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenPedido}
        onClose={onClosePedido}
        size={"md"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">Últimos pedidos de {clienteNombre}</Text>
              <Divider />
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editarPedido ? (
              <Flex>
                <Heading>{/* contenido de edición */}</Heading>
              </Flex>
            ) : (
              <VStack spacing={4} w="100%">
                {pedidos.map((pedido) => (
                  <Box
                    key={pedido.codigo}
                    w="100%"
                    borderRadius="lg"
                    bg="gray.50"
                    p={4}
                    border={"1px solid"}
                    borderColor={"blue.600"}
                  >
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Pedido #{pedido.codigo}</Heading>
                      <Badge colorScheme="blue" fontSize="sm" p={2} variant="solid">
                        {pedido.fecha}
                      </Badge>
                    </Flex>

                    <Box
                      maxH="300px"
                      overflowY="auto"
                      css={{
                        "&::-webkit-scrollbar": {
                          width: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "gray.200",
                          borderRadius: "24px",
                        },
                      }}
                    >
                      {detallesPedidos[pedido.codigo]?.map((detalle, idx) => (
                        <Flex
                          key={idx}
                          justify="space-between"
                          bg="white"
                          p={4}
                          mb={2}
                          borderRadius="md"
                          boxShadow="sm"
                          _hover={{ boxShadow: "md" }}
                          transition="all 0.2s"
                        >
                          <VStack align="start" spacing={1}>
                            <Heading size="sm">{detalle.descripcion}</Heading>
                            <Text color="gray.600" fontSize="sm">
                              Cantidad: {detalle.cantidad}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Heading size="sm" color="blue.600">
                              {formatCurrency(
                                detalle.precio * detalle.cantidad
                              )}
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              {formatCurrency(detalle.precio)} c/u
                            </Text>
                          </VStack>
                        </Flex>
                      ))}
                    </Box>

                    <Flex
                      justify="flex-end"
                      align="center"
                      bg="white"
                      p={2}
                      mt={2}
                      borderRadius="md"
                    >
                      <Heading size="sm">
                        Total: {formatCurrency(pedido.total)}
                      </Heading>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen} onClose={onClose} size={"sm"} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reagendar Visita?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify={"space-between"} gap={4}>
              <Box flexGrow={1}>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={fechaProxima}
                  onChange={(e) => setFechaProxima(e.target.value)}
                />
              </Box>
              <Box flexGrow={1}>
                <FormLabel>Hora</FormLabel>
                <Input
                  type="time"
                  value={horaProxima}
                  onChange={(e) => setHoraProxima(e.target.value)}
                />
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onClose();
                finalizarVisita();
              }}
              variant={"outline"}
            >
              No reagendar
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                reagendarVisita();
                finalizarVisita();
                onClose();
              }}
            >
              Ok
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RutaActualCard;
