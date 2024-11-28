import { Localizacion } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import {
  Ban,
  Calendar,
  CalendarFold,
  CircleCheckBig,
  CircleUserRound,
  EllipsisVertical,
  MapPinned,
  MessageCircleMore,
  Phone,
  SquareMenu,
} from "lucide-react";
import { useState } from "react";
import { Nota } from "@/types/shared_interfaces";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Auditar from "@/services/AuditoriaHook";

interface RuteamientoCardProps {
  clienteNombre: string;
  clienteTelefono?: string;
  observacion: string;
  fecha: string;
  hora: string;
  dia: string;
  vendedor: string;
  prioridad: number;
  visitado?: number;
  planificacion?: number;
  latitud?: string;
  longitud?: string;
  estado?: number;
  ruteamientoId: number;
  misVisitas?: number;
  misVisitasCliente?: number;
  l_latitud?: string;
  l_longitud?: string;
  fetchRuteamientos: () => void;
}

const RuteamientoCard = ({
  clienteNombre,
  clienteTelefono,
  observacion,
  fecha,
  hora,
  vendedor,
  prioridad,
  visitado,
  estado,
  planificacion,
  ruteamientoId,
  misVisitas,
  misVisitasCliente,
  l_longitud,
  l_latitud,
  fetchRuteamientos,
}: RuteamientoCardProps) => {
  const [tapCount, setTapCount] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isCompleted = visitado === 1;
  const [notasRuteamiento, setNotasRuteamiento] = useState<Nota[]>([]);
  const toast = useToast();
  const [localizaciones, setLocalizaciones] = useState<Localizacion[]>([]);
  const [notaNueva, setNotaNueva] = useState<string>("");
  const [fechaProxima, setFechaProxima] = useState<string>("");
  const [horaProxima, setHoraProxima] = useState<string>("");

  const {
    isOpen: isLeerNotasModalOpen,
    onOpen: onLeerNotasModalOpen,
    onClose: onLeerNotasModalClose,
  } = useDisclosure();

  const {
    isOpen: isAgregarNotaModalOpen,
    onOpen: onAgregarNotaModalOpen,
    onClose: onAgregarNotaModalClose,
  } = useDisclosure();

  const {
    isOpen: isVerDetallesModalOpen,
    onOpen: onVerDetallesModalOpen,
    onClose: onVerDetallesModalClose,
  } = useDisclosure();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const agregarNota = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/nueva-nota`, {
        an_agenda_id: ruteamientoId,
        an_nota: notaNueva,
        an_fecha: new Date().toISOString().split("T")[0],
        an_hora: new Date().toISOString().split("T")[1].split(".")[0],
        an_sistema: 0,
      });
      if (response.data.status === 201) {
        toast({
          title: "Nota agregada",
          description: "La nota fue agregada correctamente",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        Auditar(
          125,
          1,
          ruteamientoId,
          Number(localStorage.getItem("user_id")),
          `Se agregó una nota al ruteamiento #${ruteamientoId}`
        );
        setNotaNueva("");
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

  const fetchLocalizaciones = async (id: number) => {
    try {
      const response = await axios.get(
        `${api_url}agendas/localizaciones/${id}`
      );
      setLocalizaciones(response.data.body);
      console.log(response.data.body[0]);
    } catch (error) {
      toast({
        title: "Error al cargar las localizaciones",
        description:
          "Ocurrió un error al cargar las localizaciones, por favor intente nuevamente",
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
      fetchRuteamientos();
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

  const anularVisita = async () => {
    try {
      await axios.post(`${api_url}agendas/anular-visita`, {
        a_codigo: ruteamientoId,
      });
      toast({
        title: "Visita anulada",
        description: "La visita fue anulada correctamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      Auditar(
        125,
        3,
        ruteamientoId,
        Number(localStorage.getItem("user_id")),
        `Se anuló el ruteamiento #${ruteamientoId}`
      );
      fetchRuteamientos();
    } catch (error) {
      toast({
        title: "Error al anular la visita",
        description:
          "Ocurrió un error al anular la visita, por favor intente nuevamente",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getColorByPriority = (priority: number) => {
    switch (priority) {
      case 1:
        return "red.500";
      case 2:
        return "yellow.500";
      case 3:
        return "green.500";
      default:
        return "green.500";
    }
  };

  const borderColor = getColorByPriority(prioridad);

  const handleTouchStart = () => {
    setTapCount((prevCount) => prevCount + 1);

    setTimeout(() => {
      setTapCount(0);
    }, 300);

    if (tapCount === 1) {
      handleDoubleTap();
    }
  };

  const handleDoubleTap = () => {
    onLeerNotasModalOpen();
  };

  const operadorLlegadaUbicacion = `https://www.google.com/maps/search/?api=1&query=${l_latitud},${l_longitud}`;

  const getDiaDeLaSemana = (fecha: string) => {
    try {
      if (!fecha) return "";

      const date = parseISO(fecha);
      return (
        format(date, "EEEE", { locale: es }).charAt(0).toUpperCase() +
        format(date, "EEEE", { locale: es }).slice(1)
      );
    } catch (error) {
      console.error("Error al obtener día de la semana:", error);
      return "";
    }
  };

  const diaDeLaSemana = getDiaDeLaSemana(fecha);

  return (
    <Box>
      <Card
        borderBottom="4px solid"
        borderTop="4px solid"
        borderTopColor={
          estado === 1 ? (isCompleted ? "gray.500" : borderColor) : "black.500"
        }
        borderBottomColor={
          estado === 1 ? (isCompleted ? "gray.500" : borderColor) : "black.500"
        }
        direction={{ base: "column", sm: "row" }}
        variant="outline"
        w={isMobile ? "100%" : "80%"}
        onTouchStart={handleTouchStart}
      >
        <Stack w={"100%"}>
          <CardBody>
            <Flex
              alignItems={"center"}
              gap={2}
              justifyContent={"space-between"}
              alignContent={"space-between"}
            >
              <Box>
                <Heading size="md">{clienteNombre}</Heading>
                <Text py="2">{observacion}</Text>
                <Flex w={"100%"} justifyContent={"flex-start"}>
                  <Text py="2" color={"gray.500"}>
                    {vendedor}
                  </Text>
                </Flex>
              </Box>
              <Flex
                mt={6}
                flexDir={"column"}
                align={"flex-end"}
                justify={"center"}
              >
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<EllipsisVertical />}
                    variant="outline"
                  />
                  <MenuList>
                    {visitado === 0 ? (
                      <>
                        <MenuItem
                          icon={estado === 1 ? <Ban /> : <CircleCheckBig />}
                          onClick={anularVisita}
                        >
                          {estado === 1 ? "Anular visita" : "Activar Visita"}
                        </MenuItem>
                        {estado === 1 ? (
                          <MenuItem icon={<Calendar />} onClick={onOpen}>
                            Reagendar visita
                          </MenuItem>
                        ) : null}
                      </>
                    ) : null}
                    <MenuItem
                      icon={<SquareMenu />}
                      onClick={() => {
                        onVerDetallesModalOpen();
                        fetchLocalizaciones(ruteamientoId);
                        fetchNotasRuteamiento(ruteamientoId);
                      }}
                    >
                      Ver Detalles
                    </MenuItem>
                    <MenuItem
                      icon={<MessageCircleMore />}
                      onClick={onAgregarNotaModalOpen}
                    >
                      Agregar Nota
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Text py="2" color={"gray.500"}>
                  {estado === 1 ? (
                    isCompleted ? (
                      "Visitado"
                    ) : (
                      `${diaDeLaSemana} ${fecha} ${hora}`
                    )
                  ) : (
                    <Text color={"red"} fontWeight={"bold"}>
                      Anulado
                    </Text>
                  )}
                </Text>
              </Flex>
            </Flex>
          </CardBody>
        </Stack>
      </Card>
      <Modal
        onClose={onLeerNotasModalClose}
        isOpen={isLeerNotasModalOpen}
        isCentered
        size={"sm"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={4}>
              <Heading size={"md"}>Ruteamiento ID: {ruteamientoId}</Heading>
              <Flex flexDir={"column"} gap={2}>
                <Divider></Divider>
                <Flex
                  flexDir={"column"}
                  gap={2}
                  overflowY={"scroll"}
                  maxH={"300px"}
                >
                  {notasRuteamiento.map((nota) => (
                    <Box key={nota.an_codigo}>
                      <Text>Nota #{nota.an_codigo}</Text>
                      <Text>{nota.an_nota}</Text>
                      <Divider></Divider>
                    </Box>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onLeerNotasModalClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        onClose={onAgregarNotaModalClose}
        isOpen={isAgregarNotaModalOpen}
        isCentered
        size={"sm"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Nota:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={4}>
              <Heading size={"md"}>Ruteamiento ID: #{ruteamientoId}</Heading>
              <Flex flexDir={"column"} gap={2}>
                <Divider></Divider>
                <Input
                  placeholder="Contenido de la nota"
                  variant={"filled"}
                  value={notaNueva}
                  onChange={(e) => setNotaNueva(e.target.value)}
                ></Input>
                <Divider></Divider>
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter gap={4}>
            <Button onClick={onAgregarNotaModalClose}>Cerrar</Button>
            <Button
              onClick={() => {
                agregarNota();
                onAgregarNotaModalClose();
              }}
              colorScheme="green"
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        onClose={onVerDetallesModalClose}
        isOpen={isVerDetallesModalOpen}
        isCentered
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vendedor: {vendedor}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2}>
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
                    {fecha} {hora}
                  </Text>
                </Flex>
                <Flex gap={2}>
                  <Phone color="white" />
                  <Text color={"white"} fontWeight={"bold"}>
                    {clienteTelefono}
                  </Text>
                </Flex>
              </Box>
              <Divider></Divider>
              <Flex flexDir={"row"} gap={4} justify={"center"} align={"center"}>
                <Badge colorScheme={visitado === 1 ? "green" : "gray"}>
                  {visitado === 1 ? "Visitado" : "Pendiente"}
                </Badge>
                <Badge colorScheme={planificacion === 1 ? "green" : "gray"}>
                  {visitado === 1 ? "Planificado" : "Visita común"}
                </Badge>
                <Badge
                  colorScheme={
                    prioridad === 3
                      ? "blue"
                      : prioridad === 2
                      ? "yellow"
                      : "red"
                  }
                >
                  {prioridad === 3
                    ? "Prioridad Baja"
                    : prioridad === 2
                    ? "Prioridad Media"
                    : "Alta Prioridad"}
                </Badge>
                <Badge colorScheme={estado === 1 ? "green" : "gray"}>
                  {estado === 1 ? "Activo" : "Anulado"}
                </Badge>
              </Flex>
              <Divider></Divider>
              <Flex gap={4} h={"auto"} justify={"center"}>
                <Box
                  display={"flex"}
                  flexDir={"row"}
                  gap={2}
                  p={2}
                  borderRadius={"md"}
                  bg={"green.500"}
                  h={20}
                  w={40}
                  justifyContent={"center"}
                  alignItems={"center"}
                  onClick={() =>
                    window.open(operadorLlegadaUbicacion, "_blank")
                  }
                >
                  <MapPinned color={"white"} />
                  <Box>
                    <Text color={"white"}>Llegada:</Text>
                    <Text
                      color={"white"}
                      fontWeight={"semibold"}
                      fontSize={"xs"}
                    >
                      {localizaciones.length > 0 &&
                      localizaciones[0]?.l_hora_fin?.trim() !== ""
                        ? localizaciones[0].l_hora_inicio
                        : "No registrado"}
                    </Text>
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  flexDir={"row"}
                  gap={2}
                  p={2}
                  borderRadius={"md"}
                  bg={"red.500"}
                  h={20}
                  w={40}
                  justifyContent={"center"}
                  alignItems={"center"}
                  onClick={() =>
                    window.open(operadorLlegadaUbicacion, "_blank")
                  }
                >
                  <MapPinned color={"white"} />
                  <Box>
                    <Text color={"white"}>Salida:</Text>
                    <Text
                      color={"white"}
                      fontSize={"xs"}
                      fontWeight={"semibold"}
                    >
                      {localizaciones.length > 0 &&
                      localizaciones[0]?.l_hora_fin?.trim() !== ""
                        ? localizaciones[0].l_hora_fin
                        : "No registrado"}
                    </Text>
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  flexDir={"row"}
                  gap={2}
                  p={2}
                  borderRadius={"md"}
                  bg={"blue.500"}
                  h={20}
                  w={40}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Box>
                    <Text color={"white"} fontSize={"sm"}>
                      Mis visitas: {misVisitasCliente}
                    </Text>
                    <Text color={"white"} fontSize={"xs"}>
                      Visitas Totales: {misVisitas}
                    </Text>
                  </Box>
                </Box>
              </Flex>
              <Divider></Divider>
              <Box>
                <Text fontWeight={"bold"}>Observaciones:</Text>
                <Text>{observacion}</Text>
              </Box>
              <Divider></Divider>
              <Box>
                <Text fontWeight={"bold"} mb={2}>
                  Notas:
                </Text>
                <Box bg={"gray.100"} height={"auto"} borderRadius={"md"} p={2}>
                  <Flex flexDir={"column"} gap={2} p={2}>
                    {notasRuteamiento.map((nota) => (
                      <Box key={nota.an_codigo}>
                        <Text fontWeight={"semibold"}>
                          Nota #{nota.an_codigo}
                        </Text>
                        <Text>{nota.an_nota}</Text>
                        <Divider></Divider>
                      </Box>
                    ))}
                  </Flex>
                </Box>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter gap={4}>
            <Button onClick={onVerDetallesModalClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen} onClose={onClose} size={"sm"} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>¿Reagendar Visita?</ModalHeader>
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
              }}
              variant={"outline"}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                reagendarVisita();
                onClose();
              }}
            >
              Reagendar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RuteamientoCard;
