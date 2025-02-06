import HeaderComponent from "@/modules/Header";
import { api_url } from "@/utils";
import axios from "axios";
import {
  Divider,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spinner,
  useDisclosure,
  useMediaQuery,
  Input,
  Button,
  ModalFooter,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { Truck, Box as BoxIcon, X } from "lucide-react";
import { useEffect, useState } from "react";


interface Entrega {
  id: string;
  estado: string;
  chofer: string;
  chofer_id: number;
  camion: string;
  camion_chapa: string;
  paradas: number;
  hora_salida: string;
  hora_llegada: string;
  km_actual: number;
  km_ultimo: number;
  cliente_actual: string;
}

interface EntregaDetalle {
  id: number;
  monto_detalle: number;
  observacion_detalle: string;
  fecha_ruteamiento: string;
  operador: string;
  camion_nombre: string;
  camion_chapa: string;
  sucursal: string;
  moneda: string;
  pedido_codigo: number;
  venta_codigo: number;
  factura_venta: string;
  observacion_venta: string;
  cliente_pedido_nombre: string;
  cliente_venta_nombre: string;
  cliente_cobro: string;
  proveedor_cobro: string;
  tipo_reparto: string;
  hora_entrada: string;
  hora_salida: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const Entregas = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const usuarioId = sessionStorage.getItem("user_id");
  const [isLoading, setIsLoading] = useState(false);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const fechaHoy = new Date().toISOString().split("T")[0];
  const [kilometrajeActual, setKilometrajeActual] = useState<number | null>(
    null
  );
  const [kilometrajeFinal, setKilometrajeFinal] = useState<number | null>(null);

  
  const toast = useToast();
  const [entregaSeleccionada, setEntregaSeleccionada] = useState<
    Entrega[] | null
  >([]);
  const [rutaIniciada, setRutaIniciada] = useState<boolean>(false);
  const [entregaDetalle, setEntregaDetalle] = useState<EntregaDetalle[] | null>(
    []
  );

  const [entregaDetalleSeleccionado, setEntregaDetalleSeleccionado] =
    useState<EntregaDetalle | null>(null);


  const [mostrarBotones, setMostrarBotones] = useState<boolean>(false);

const [, setCoordenadas] = useState<{
  latitude: number | null;
  longitude: number | null;
}>({
  latitude: null,
  longitude: null,
});

  const permisosMenu = JSON.parse(
    sessionStorage.getItem("permisos_menu") || "[]"
  );


  const tienePermiso = (
    menuGrupo: number | undefined,
    menuOrden: number | undefined
  ) => {
    console.log(permisosMenu);
    if (!menuGrupo || !menuOrden) return false;
    console.log(
      permisosMenu.some(
        (permiso: any) =>
          permiso.menu_grupo === menuGrupo &&
          permiso.menu_orden === menuOrden &&
          permiso.acceso === 1
      )
    );
    return permisosMenu.some(
      (permiso: any) =>
        permiso.menu_grupo === menuGrupo &&
        permiso.menu_orden === menuOrden &&
        permiso.acceso === 1
    );
  };

  const listarEntregas = async () => {

    try {
      setIsLoading(true);
      
      const response = await axios.get(`${api_url}reparto/listar-rutas`, {
        params: {
          fecha: fechaHoy,
          vendedor: tienePermiso(2 , 31) ? undefined : usuarioId,
        },
      });
      console.log(response.data);

      if (tienePermiso(1 , 15)) {
        console.log("Tiene permiso");
        console.log(response.config.params);
      }
      setEntregas(response.data.body);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const listarDetalles = async (parametro: number) => {
    try {
      console.log("Parametro", parametro);
      console.log("Entrega seleccionada", entregaSeleccionada);
      setIsLoading(true);
      const response = await axios.get(`${api_url}reparto/listar`, {
        params: {
          id: parametro,
        },
      });
      console.log(response.data.body);
      setEntregaDetalle(response.data.body);
      console.log("Entrega detalle", entregaDetalle);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

const obtenerUbicacion = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoordenadas(coords);
          resolve(coords);
        },
        (error: GeolocationPositionError) => {
          console.error("Error obteniendo ubicación:", error);
          toast({
            title: "Error",
            description: "No se pudo obtener la ubicación",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      const error = new Error("Geolocalización no disponible");
      toast({
        title: "Error",
        description: "Geolocalización no disponible en este dispositivo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      reject(error);
    }
  });
};


  const marcarSalidaRuta = async () => {
    try {
      await obtenerUbicacion();
      const response = await axios.get(`${api_url}reparto/marcar-salida-ruta`, {
        params: {
          id: entregaSeleccionada?.[0]?.id,
          km: kilometrajeActual,
        },
      });
      console.log(response.data);
      listarEntregas();
      onCloseConfirmarModal();
      toast({
        title: "Ruta marcada como en curso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const marcarLlegadaRuta = async () => {
    try {
      const response = await axios.get(
        `${api_url}reparto/marcar-llegada-ruta`,

        {
          params: {
            id: entregaSeleccionada?.[0]?.id,
            km: kilometrajeFinal,
          },
        }
      );
      console.log(response.data);
      listarEntregas();
      onCloseConfirmarModal();

      toast({
        title: "Ruta marcada como en completada",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarcarLlegada = async () => {
    if (entregaSeleccionada?.[0]?.id && kilometrajeFinal) {
      await marcarLlegadaRuta();
      onCloseConfirmarModalLlegada();
      listarEntregas();
      setRutaIniciada(false);
      setKilometrajeFinal(null);
    } else {
      toast({
        title: "Error",
        description: "Por favor ingresa el kilometraje final",
        status: "error",
      });
    }
  };
const marcarLLegadaEntrega = async () => {
  try {
    setIsLoading(true);
    const coords = await obtenerUbicacion();

    if (!coords.latitude || !coords.longitude) {
      throw new Error("No se pudo obtener la ubicación");
    }

    await axios.get(`${api_url}reparto/marcar-llegada-entrega`, {
      params: {
        id: entregaDetalleSeleccionado?.id,
        chat_id: [7916186377, 8172917124, 7554800275, 5691578531],
        latitud: coords.latitude || -25.29932588164876,
        longitud: coords.longitude || -57.59385564614278,
      },
    });
  } catch (error) {
    console.log(error);
    toast({
      title: "Error",
      description: "Hubo un error al marcar la llegada",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
    if (entregaSeleccionada?.[0]?.id) {
      listarDetalles(Number(entregaSeleccionada[0].id));
    }
  }
};

const marcarSalidaEntrega = async () => {
  try {
    setIsLoading(true);
    const coords = await obtenerUbicacion();

    if (!coords.latitude || !coords.longitude) {
      throw new Error("No se pudo obtener la ubicación");
    }

    await axios.get(`${api_url}reparto/marcar-salida-entrega`, {
      params: {
        id: entregaDetalleSeleccionado?.id,
        chat_id: [7916186377, 8172917124, 7554800275, 5691578531],
        latitud: coords.latitude || -25.29932588164876,
        longitud: coords.longitude || -57.59385564614278,
      },
    });
  } catch (error) {
    console.log(error);
    toast({
      title: "Error",
      description: "Hubo un error al marcar la salida",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
    if (entregaSeleccionada?.[0]?.id) {
      listarDetalles(Number(entregaSeleccionada[0].id));
    }
  }
};

  const isMine = (id: number) => {
    if (id === Number(usuarioId)) {
      return true;
    }
    return false;
  };

  const {
    isOpen: isOpenConfirmarModal,
    onOpen: onOpenConfirmarModal,
    onClose: onCloseConfirmarModal,
  } = useDisclosure();

  const {
    isOpen: isOpenConfirmarModalLlegada,
    onOpen: onOpenConfirmarModalLlegada,
    onClose: onCloseConfirmarModalLlegada,
  } = useDisclosure();

  useEffect(() => {
    listarEntregas();
  }, []);

  function handleEntregaSeleccionada(entrega: Entrega) {
    setEntregaSeleccionada([entrega]);
    console.log("Entrega seleccionada", entregaSeleccionada);
    if (entrega.estado === "Pendiente") {
      console.log("Entrega pendiente");
      onOpenConfirmarModal();
    } else {
      console.log("Entrega en curso");
      setRutaIniciada(true);
    }
    console.log("Volviendo a listar detalles");
    listarDetalles(Number(entrega.id));
  }

  const ListaDeRutas = () => {
    return (
      <Flex
        display={isMobile ? "column" : "grid"}
        gridTemplateColumns={"repeat(2, 1fr)"}
        gap={4}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" color="blue.500" />
          </div>
        ) : (
          entregas
            .sort((a, b) => {
              if (a.estado === "Pendiente") return -1;
              if (b.estado === "Pendiente") return 1;
              if (a.estado === "En camino") return -1;
              return 0;
            })
            .map((entrega) => (
              <div
                key={entrega.id}
                onClick={() => {
                  if (entrega.estado === "Completado") {
                    toast({
                      title: "La entrega ya ha sido completada",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  } else {
                    if (isMine(entrega.chofer_id)) {
                      handleEntregaSeleccionada(entrega);
                    } else {
                      toast({
                        title: "No autorizado",
                        description: "No puedes seleccionar esta entrega",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }
                }}
                className={`w-full my-2 border border-l-gray-200 p-2 rounded-md bg-white ${
                  isMine(entrega.chofer_id)
                    ? entrega.estado === "En camino"
                      ? "border-t-yellow-500"
                      : entrega.estado === "Completado"
                      ? "border-t-green-500"
                      : "border-t-red-500"
                    : "border-t-gray-500"
                } ${
                  isMine(entrega.chofer_id)
                    ? entrega.estado === "En camino"
                      ? "border-b-yellow-500"
                      : entrega.estado === "Completado"
                      ? "border-b-green-500"
                      : "border-b-red-500"
                    : "border-b-gray-500"
                } `}
              >
                <div className="flex flex-row w-full mb-2 justify-between">
                  <div className="flex flex-row">
                    <div className="bg-white rounded-full p-2">
                      <BoxIcon size={32} />
                    </div>
                    <div className="flex flex-col ml-2">
                      <p className="text-gray-500 font-thin text-sm">Ruta #</p>
                      <p className="text-gray-500 font-semibold text-lg">
                        {entrega.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <p className="text-gray-500 font-semibold text-sm mr-2">
                      {entrega.cliente_actual}
                    </p>

                    <div
                      className={`px-2 py-1 rounded-md text-md ${
                        isMine(entrega.chofer_id)
                          ? entrega.estado === "En camino"
                            ? "bg-yellow-400 text-black"
                            : entrega.estado === "Completado"
                            ? "bg-green-600 text-black"
                            : "bg-red-600 text-black"
                          : "bg-gray-400 text-black"
                      }`}
                    >
                      {entrega.estado}
                    </div>
                  </div>
                </div>
                <Divider borderColor={"gray.200"} />
                <div className="flex flex-row justify-between">
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-semibold text-lg">
                      {entrega.chofer}
                    </p>
                    <p className="text-gray-500 font-semibold text-lg">
                      {entrega.camion} - {entrega.camion_chapa}
                    </p>
                  </div>
                </div>
                <Divider borderColor={"gray.200"} />
                <div className="flex flex-row justify-between">
                  <p className="text-gray-500 font-semibold text-lg">
                    Salida: {entrega.hora_salida}
                  </p>
                  <p className="text-gray-500 font-semibold text-lg">
                    Llegada: {entrega.hora_llegada}
                  </p>
                </div>
              </div>
            ))
        )}
      </Flex>
    );
  };

  function formatearMoneda(monto: number) {
    return new Intl.NumberFormat("es-PE", {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(monto);
  }

  const abreviarMoneda = (moneda: string) => {
    switch (moneda) {
      case "GUARANI":
        return "Gs.";
      case "REAL":
        return "R$";
      case "DOLAR":
        return "U$S";
    }
  };

  const DetalleRutas = () => {
    return (
      <Flex h={"100vh"} w={"100%"} flexDir={"column"} gap={2}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" color="blue.500" />
          </div>
        ) : entregaDetalle?.length === 0 ? (
          <div className="flex flex-col">
            <div className="border w-full border-gray-400 rounded-md p-2 bg-white">
              <p className="text-gray-500 font-semibold text-md">
                Regresar a la central
              </p>
              <Divider />
              <div className="mt-2">
                <p className="text-gray-500 font-semibold text-md">
                  H. Salida: {entregaSeleccionada?.[0]?.hora_salida}
                </p>
                <p className="text-gray-500 font-semibold text-md">
                  Km actual: {entregaSeleccionada?.[0]?.km_actual}
                </p>
              </div>
            </div>
            <div className="flex w-full ">
              <button
                className="bg-blue-500 text-white p-2 rounded-md w-full mt-2"
                onClick={() => {
                  onOpenConfirmarModalLlegada();
                }}
              >
                Marcar llegada
              </button>
            </div>
          </div>
        ) : (
          entregaDetalle?.map((entrega) => (
            <div
              className="relative overflow-hidden rounded-md group"
              key={entrega.id}
            >
              <div
                className={`border border-gray-200 bg-white rounded-md p-2 transition-all ease-in-out duration-600 transform hover:shadow-md ${
                  mostrarBotones &&
                  entregaDetalleSeleccionado?.id === entrega.id
                    ? "-translate-x-32"
                    : "translate-x-0"
                }`}
                onClick={() => {
                  if (entregaDetalleSeleccionado?.id === entrega.id) {
                    setMostrarBotones(!mostrarBotones);
                  } else {
                    setMostrarBotones(true);
                    setEntregaDetalleSeleccionado(entrega);
                  }
                }}
              >
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 font-semibold text-lg">
                    {(() => {
                      switch (entrega.tipo_reparto) {
                        case "Venta":
                          return entrega.cliente_venta_nombre;
                        case "Pedido":
                          return entrega.cliente_pedido_nombre;
                        case "Pago a Proveedor":
                          return `Pago a ${entrega.proveedor_cobro}`;
                        case "Cobro a Cliente":
                          return `Cobro a ${entrega.cliente_cobro}`;
                      }
                    })()}
                  </p>

                  <p className="text-gray-500 font-semibold text-md">
                    {entrega.sucursal}
                  </p>
                </div>
                <Divider borderColor={"gray.200"} />
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 font-semibold text-md">
                    Nro. Factura: {entrega.factura_venta}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 font-semibold text-md">
                    Obs.: {entrega.observacion_venta}
                  </p>

                  <p className="text-gray-500 font-semibold text-md">
                    {formatearMoneda(entrega.monto_detalle)}{" "}
                    {abreviarMoneda(entrega.moneda)}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 font-semibold text-md">
                    Hora entrada: {entrega.hora_entrada || "-"}
                  </p>
                  <p className="text-gray-500 font-semibold text-md">
                    Hora salida: {entrega.hora_salida || "-"}
                  </p>
                </div>
              </div>
              <div
                className={`absolute top-0 right-0 h-full flex items-center gap-2 pr-2 transition-all ease-in-out duration-300 ${
                  mostrarBotones &&
                  entregaDetalleSeleccionado?.id === entrega.id
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <Button
                  colorScheme={entrega.hora_entrada ? "orange" : "green"}
                  h="90%"
                  w="28"
                  className="rounded-md shadow-lg"
                  _hover={{
                    transform: "scale(1.05)",
                    shadow: "xl",
                    bg: entrega.hora_entrada ? "orange.500" : "green.500",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                    bg: entrega.hora_entrada ? "orange.600" : "green.600",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (entrega.hora_entrada) {
                      marcarSalidaEntrega();
                      setMostrarBotones(false);
                    } else {
                      marcarLLegadaEntrega();
                      setMostrarBotones(false);
                    }
                  }}
                >
                  {entrega.hora_entrada ? "M. Salida" : "M. Entrada"}
                </Button>
              </div>
            </div>
          ))
        )}
      </Flex>
    );
  };
  return (
    <Flex
      direction={"column"}
      w={"100%"}
      h={"100vh"}
      bg={"gray.100"}
      p={2}
      gap={2}
    >
      <HeaderComponent titulo="Entregas" Icono={Truck} />
      {rutaIniciada ? <DetalleRutas /> : <ListaDeRutas />}
      <IconButton
        aria-label="Cerrar"
        icon={<X />}
        position={"absolute"}
        top={5}
        right={5}
        onClick={() => {
          setRutaIniciada(false);
          listarEntregas();
          setEntregaSeleccionada(null);
          setEntregaDetalle(null);
          setEntregaDetalleSeleccionado(null);
          setMostrarBotones(false);
        }}
      />
      <Modal
        isOpen={isOpenConfirmarModal}
        onClose={onCloseConfirmarModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comenzar ruta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p className="text-black mb-2 text-md">
              Por favor ingresa el Kilometraje actual del vehiculo
            </p>
            <Input
              type="number"
              placeholder="Kilometraje actual"
              value={kilometrajeActual ?? ""}
              onChange={(e) => setKilometrajeActual(Number(e.target.value))}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={marcarSalidaRuta}>
              Comenzar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenConfirmarModalLlegada}
        onClose={onCloseConfirmarModalLlegada}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comenzar ruta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p className="text-black mb-2 text-md">
              Por favor ingresa el Kilometraje final del vehiculo
            </p>
            <Input
              type="number"
              placeholder="Kilometraje final"
              value={kilometrajeFinal ?? ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0 || value !== null) {
                  setKilometrajeFinal(value);
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={handleMarcarLlegada}>
              Marcar llegada
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Entregas;
