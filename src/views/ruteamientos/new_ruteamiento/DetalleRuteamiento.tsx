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
  Heading,
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
  CalendarFold,
  CircleUserRound,
  MapPinned,
  PenBox,
  Phone,
  Send,
  Trash,
} from "lucide-react";
import { useCallback, useState, useEffect, useMemo } from "react";
import { Nota } from "@/types/shared_interfaces";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Auditar from "@/services/AuditoriaHook";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";

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
  clienteId: number;
  deudas_cliente: number;
  hora_llegada: string;
  hora_salida: string;
  clienteRuc: string;
  clienteDireccion: string;
}

interface SubvisitaDTO {
  id_cliente?: number;
  id_agenda: number;
  nombre_cliente?: string;
  motivo_visita: string;
  resultado_visita?: string;
}

interface Subvisita {
  id: number;
  nombre_cliente: string;
  motivo_visita: string;
  resultado_visita: string;
}

interface ResultadosProps {
  notasRuteamiento: Nota[];
  notaNueva: string;
  setNotaNueva: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleAgregarNota: () => void;
}

interface SubvisitasProps {
  subvisitas: Subvisita[];
  agregarSubvisita: boolean;
  handleToggleSubvisita: () => void;
  subvisitaForm: SubvisitaDTO;
  setSubvisitaForm: (value: SubvisitaDTO) => void;
  crearSubvisita: (subvisitaForm: SubvisitaDTO) => void;
  actualizarSubvisita: (id: number, datos: Partial<SubvisitaDTO>) => void;
  eliminarSubvisita: (id: number) => void;
}

interface Venta {
  id: number;
  fecha: string;
  articulos: {
    codigo: number;
    cod_barras: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    total: number;
  }[];
}

interface Pedido {
  id: number;
  fecha: string;
  articulos: {
    codigo: number;
    cod_barras: string;
    descripcion: string;
    precio: number;
    cantidad: number;
    total: number;
  }[];
}

interface VentasProps {
  ventas: Venta[];
  handleBusquedaVentas: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const defaultMapOptions = {
  zoom: 15,
  zoomControl: true,
  scrollwheel: true,
  fullscreenControl: true,
  gestureHandling: "cooperative",
  mapTypeId: "roadmap",
  disableDefaultUI: false,
};

const ResultadosComponent = ({
  notasRuteamiento,
  notaNueva,
  setNotaNueva,
  handleKeyPress,
  handleAgregarNota,
}: ResultadosProps) => {
  return (
    <>
      <Box className="notas-container bg-white rounded-md p-2 max-h-80 overflow-y-auto transition-colors duration-500">
        <Flex flexDir={"column"} gap={2} p={2}>
          {notasRuteamiento.map((nota) => (
            <Box
              key={nota.an_codigo}
              className="transform transition-all duration-300 hover:bg-gray-50 p-2 rounded"
            >
              <div className="flex flex-row gap-2 justify-between ">
                <Text fontWeight={"semibold"}>Registro: {nota.an_codigo}</Text>
                <Text className="text-gray-500 text-md">{nota.an_hora}</Text>
              </div>
              <Text>{nota.an_nota}</Text>
              <Divider></Divider>
            </Box>
          ))}
        </Flex>
      </Box>
      <div className="relative w-full group flex flex-row gap-2 justify-between items-center">
        <input
          type="text"
          value={notaNueva}
          onChange={(e) => setNotaNueva(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
          placeholder="Escribe una nota y presiona Enter..."
        />
        <div className="error-message absolute -bottom-6 left-0 text-red-500 text-sm opacity-0 transition-opacity duration-300"></div>

        <Button
          onClick={handleAgregarNota}
          colorScheme="green"
          isDisabled={!notaNueva.trim()}
          className="transition-all duration-300 hover:scale-105"
        >
          <Send />
        </Button>
      </div>
    </>
  );
};

const SubvisitasComponent = ({
  subvisitas,
  agregarSubvisita,
  handleToggleSubvisita,
  subvisitaForm,
  setSubvisitaForm,
  crearSubvisita,
  actualizarSubvisita,
  eliminarSubvisita,
}: SubvisitasProps) => {
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [selectedSubvisita, setSelectedSubvisita] = useState<Subvisita | null>(
    null
  );
  const [resultadoValue, setResultadoValue] = useState<string>("");

  const handleEditClick = (subvisita: Subvisita) => {
    setSelectedSubvisita(subvisita);
    setResultadoValue(subvisita.resultado_visita || "");
    setIsEditModal(true);
  };

  const handleDeleteClick = (subvisita: Subvisita) => {
    setSelectedSubvisita(subvisita);
    setIsDeleteModal(true);
  };

  const handleSaveResultado = () => {
    if (selectedSubvisita && resultadoValue.trim()) {
      actualizarSubvisita(selectedSubvisita.id, {
        resultado_visita: resultadoValue,
      });
      setIsEditModal(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedSubvisita) {
      eliminarSubvisita(selectedSubvisita.id);
      setIsDeleteModal(false);
    }
  };

  return (
    <div className="bg-white rounded-md p-2 max-h-80 overflow-y-auto flex flex-col gap-2">
      {subvisitas.length > 0 ? (
        subvisitas.map((subvisita) => (
          <div
            key={subvisita.id}
            className="flex flex-row gap-2 justify-between bg-blue-100 p-2 rounded-md"
          >
            <div className="flex flex-col gap-2 justify-between">
              <p className="font-bold text-lg text-gray-800">
                Sub-visita a:{" "}
                <span className="text-gray-500 text-sm">
                  {subvisita.nombre_cliente}
                </span>
              </p>
              <p className="text-gray-500 text-md">
                Motivo: {subvisita.motivo_visita}
              </p>
              <p className="text-gray-500 text-md">
                Resultado/s: {subvisita.resultado_visita}
              </p>
            </div>
            <div className="flex flex-row gap-2 justify-between">
              <button
                onClick={() => handleEditClick(subvisita)}
                className="hover:bg-gray-200 p-1 rounded-full transition-all"
                title="Editar resultado"
              >
                <PenBox className="w-6 h-6 text-gray-500" />
              </button>
              <button
                onClick={() => handleDeleteClick(subvisita)}
                className="hover:bg-gray-200 p-1 rounded-full transition-all"
                title="Eliminar subvisita"
              >
                <Trash className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <Text className="text-gray-500 text-center">
          No hay subvisitas en esta agenda
        </Text>
      )}
      <div className="flex flex-col gap-2 justify-center my-4 items-center w-full">
        {agregarSubvisita ? (
          <button
            onClick={handleToggleSubvisita}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-56 text-center items-center"
          >
            Agregar sub-visita
          </button>
        ) : (
          <div className="flex flex-col gap-2 justify-center my-4 items-center w-full">
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={subvisitaForm.nombre_cliente}
              onChange={(e) =>
                setSubvisitaForm({
                  ...subvisitaForm,
                  nombre_cliente: e.target.value,
                })
              }
              className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            />
            <textarea
              className="w-full h-24 p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              placeholder="Motivo de la visita"
              value={subvisitaForm.motivo_visita}
              onChange={(e) =>
                setSubvisitaForm({
                  ...subvisitaForm,
                  motivo_visita: e.target.value,
                })
              }
            />
            <div className="flex flex-row gap-2 justify-end my-4 items-center w-full">
              <button
                type="submit"
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-56 text-center items-center"
                onClick={handleToggleSubvisita}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-56 text-center items-center"
                onClick={() => crearSubvisita(subvisitaForm)}
              >
                Agregar sub-visita
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de edición de resultados */}
      {isEditModal && selectedSubvisita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">
              Editar resultado de visita
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliente: {selectedSubvisita.nombre_cliente}
            </p>
            <textarea
              className="w-full h-32 p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 mb-4"
              placeholder="Ingrese el resultado de la visita"
              value={resultadoValue}
              onChange={(e) => setResultadoValue(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveResultado}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={!resultadoValue.trim()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModal && selectedSubvisita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Está seguro que desea eliminar la subvisita a{" "}
              {selectedSubvisita.nombre_cliente}? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VentasComponent = ({ ventas, handleBusquedaVentas }: VentasProps) => {
  return (
    <div className="bg-white rounded-md p-2 max-h-80 overflow-y-auto">
      <p className="font-bold text-lg text-gray-800">Ultimas Ventas</p>
      <input
        type="text"
        placeholder="Buscar articulo vendido"
        className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
        onChange={handleBusquedaVentas}
      />
      {ventas.length > 0 ? (
        ventas.map((venta) => (
          <div
            key={venta.id}
            className="flex flex-col gap-2 justify-between bg-blue-100 p-2 rounded-md mt-2"
          >
            <div className="flex flex-row gap-2 justify-between border-b border-gray-300 pb-2">
              <p className="font-bold text-lg text-gray-800">
                Venta # {venta.id}
              </p>
              <p>{venta.fecha}</p>
            </div>
            <div>
              <p>
                {venta.articulos.map((articulo) => (
                  <div className="flex flex-row gap-2 justify-between border-b border-gray-300 pb-2">
                    <p key={articulo.codigo}>
                      {articulo.cod_barras} - {articulo.descripcion}
                    </p>
                    <p className="text-gray-500 text-lg font-bold">
                     {articulo.cantidad} x {articulo.precio}
                    </p>
                  </div>
                ))}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center my-4">
          No se encontraron ventas para este cliente
        </p>
      )}
    </div>
  );
};

interface PedidosProps {
  pedidos: Pedido[];
  handleBusquedaPedidos: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PedidosComponent = ({ pedidos, handleBusquedaPedidos }: PedidosProps) => {
  return (
    <div className="bg-white rounded-md p-2 max-h-80 overflow-y-auto">
      <p className="font-bold text-lg text-gray-800">Ultimos Pedidos</p>
      <input
        type="text"
        placeholder="Buscar articulo vendido"
        className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
        onChange={handleBusquedaPedidos}
      />
      {pedidos.length > 0 ? (
        pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="flex flex-col gap-2 justify-between bg-blue-100 p-2 rounded-md mt-2"
          >
            <div className="flex flex-row gap-2 justify-between border-b border-gray-300 pb-2">
              <p className="font-bold text-lg text-gray-800">
                Pedido # {pedido.id}
              </p>
              <p>{pedido.fecha}</p>
            </div>
            <div>
              <p>
                {pedido.articulos.map((articulo) => (
                  <div className="flex flex-row gap-2 justify-between border-b border-gray-300 pb-2">
                    <p key={articulo.codigo}>
                      {articulo.cod_barras} - {articulo.descripcion}
                    </p>
                    <p className="text-gray-500 text-lg font-bold">
                      {articulo.cantidad} x {articulo.precio}
                    </p>
                  </div>
                ))}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center my-4">
          No se encontraron pedidos para este cliente
        </p>
      )}
    </div>
  );
};

const DetalleRuteamiento = ({
  clienteNombre,
  clienteRuc,
  clienteDireccion,
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
  l_longitud,
  l_latitud,
  clienteId,
  hora_llegada: propHoraLlegada,
  hora_salida: propHoraSalida,
}: RuteamientoCardProps) => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const isCompleted = visitado === 1;
  const [notasRuteamiento, setNotasRuteamiento] = useState<Nota[]>([]);
  const toast = useToast();
  const [localizaciones, setLocalizaciones] = useState<Localizacion[]>([]);
  const [notaNueva, setNotaNueva] = useState<string>("");
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDFEDNDUr9HTbwoJNxadXASevoLkJs_qo4",
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [agregarSubvisita, setAgregarSubvisita] = useState<boolean>(false);
  const [subvisitas, setSubvisitas] = useState<Subvisita[]>([]);
  
  // Estados locales para hora de llegada y salida
  const [horaLlegada, setHoraLlegada] = useState<string>(propHoraLlegada);
  const [horaSalida, setHoraSalida] = useState<string>(propHoraSalida);

  const [subvisitaForm, setSubvisitaForm] = useState<SubvisitaDTO>({
    id_cliente: 0,
    nombre_cliente: "",
    id_agenda: ruteamientoId,
    motivo_visita: "",
    resultado_visita: "",
  });

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "400px",
      borderRadius: "8px",
      position: "relative" as const,
      overflow: "hidden",
    }),
    []
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const {
    isOpen: isVerDetallesModalOpen,
    onOpen: onVerDetallesModalOpen,
    onClose: onVerDetallesModalClose,
  } = useDisclosure();

  const [, setLlegadaMarcada] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("resultados");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && notaNueva.trim()) {
      e.preventDefault();
      handleAgregarNota();
    }
  };

  const handleAgregarNota = async () => {
    if (!notaNueva.trim()) return;

    const tempNota = notaNueva;
    setNotaNueva("");

    try {
      await agregarResultado(tempNota);
      fetchNotasRuteamiento(ruteamientoId);

      // Feedback visual con Tailwind
      const notaElement = document.querySelector(".notas-container");
      if (notaElement) {
        notaElement.classList.add("bg-green-100");
        setTimeout(() => {
          notaElement.classList.remove("bg-green-100");
        }, 500);
      }
    } catch (error) {
      setNotaNueva(tempNota);

      // Error con Tailwind
      const errorContainer = document.querySelector(".error-message");
      if (errorContainer) {
        errorContainer.textContent = "❌ Error al guardar";
        errorContainer.classList.remove("opacity-0");
        errorContainer.classList.add("opacity-100");

        setTimeout(() => {
          errorContainer.classList.remove("opacity-100");
          errorContainer.classList.add("opacity-0");
        }, 3000);
      }
    }
  };

  const agregarResultado = async (nota: string) => {
    const horaLocal = new Date().toLocaleTimeString("es-PY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Asuncion",
    });

    const fechaLocal = new Date()
      .toLocaleDateString("es-PY", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "America/Asuncion",
      })
      .split("/")
      .reverse()
      .join("-");

    const response = await axios.post(`${api_url}agendas/nueva-nota`, {
      an_agenda_id: ruteamientoId,
      an_nota: nota,
      an_fecha: fechaLocal,
      an_hora: horaLocal,
      an_sistema: 0,
    });

    if (response.data.status === 201) {
      Auditar(
        125,
        1,
        ruteamientoId,
        Number(sessionStorage.getItem("user_id")),
        `Se agregó una nota al ruteamiento #${ruteamientoId}`
      );
      return response;
    }
    throw new Error("Error al agregar nota");
  };

  const fetchNotasRuteamiento = async (id: number) => {
    try {
      const response = await axios.get(`${api_url}agendas/notas/${id}`);
      setNotasRuteamiento(response.data.body);
      console.log("notasRuteamiento", response.data.body);
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

  const crearSubvisita = async (datos: SubvisitaDTO) => {
    if (!datos.id_agenda || !datos.motivo_visita || !datos.nombre_cliente) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        status: "error",
      });
      return;
    }
    try {
      const response = await axios.post(`${api_url}agendas/subvisitas`, datos);
      console.log(response.data);
      getSubvisitas(ruteamientoId);
      setSubvisitaForm({
        id_cliente: 0,
        nombre_cliente: "",
        id_agenda: ruteamientoId,
        motivo_visita: "",
        resultado_visita: "",
      });
      toast({
        title: "Subvisita creada",
        description: "La subvisita fue creada correctamente",
        status: "success",
      });
      handleToggleSubvisita();
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al crear la subvisita, por favor intente nuevamente",
        status: "error",
      });
    }
  };

  const getPedidos = async (
    vendedor: number,
    cliente: number,
    busqueda?: string
  ) => {
    try {
      const response = await axios.get(`${api_url}pedidos/pedidos-agenda`, {  
        params: {
          vendedor,
          cliente,
          busqueda,
        },
      });
      setPedidos(response.data.body);
      console.log(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al obtener los pedidos, por favor intente nuevamente",
        status: "error",
      });
    }
  };

  const getVentas = async (
    vendedor: number,
    cliente: number,
    busqueda?: string
  ) => {
    try {
      const response = await axios.get(`${api_url}venta/ventas-agenda`, {
        params: {
          vendedor,
          cliente,
          busqueda,
        },
      });
      setVentas(response.data.body);
      console.log(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al obtener las ventas, por favor intente nuevamente",
        status: "error",
      });
    }
  };

  const handleBusquedaVentas = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const busqueda = e.target.value;
    getVentas(Number(sessionStorage.getItem("user_id")), clienteId, busqueda);
    if (busqueda.length === 0 || busqueda === "") {
      getVentas(Number(sessionStorage.getItem("user_id")), clienteId);
    }
  };

  const handleBusquedaPedidos = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const busqueda = e.target.value;
    getPedidos(Number(sessionStorage.getItem("user_id")), clienteId, busqueda);
    if (busqueda.length === 0 || busqueda === "") {
      getPedidos(Number(sessionStorage.getItem("user_id")), clienteId);
    }
  };

  const getSubvisitas = async (id: number) => {
    try {
      const response = await axios.get(`${api_url}agendas/subvisitas/todos`, {
        params: {
          id_agenda: id,
        },
      });
      setSubvisitas(response.data.body);
      console.log(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al obtener las subvisitas, por favor intente nuevamente",
        status: "error",
      });
    }
  };

  const actualizarSubvisita = async (
    id: number,
    datos: Partial<SubvisitaDTO>
  ) => {
    try {
      const response = await axios.post(
        `${api_url}agendas/subvisitas/actualizar`,
        {
          id: id,
          resultado_visita: datos.resultado_visita,
        }
      );
      console.log(response.data);
      getSubvisitas(ruteamientoId);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al actualizar la subvisita, por favor intente nuevamente",
        status: "error",
      });
    }
  };

  // const anularVisita = async () => {
  //   try {
  //     await axios.post(`${api_url}agendas/anular-visita`, {
  //       a_codigo: ruteamientoId,
  //     });
  //     toast({
  //       title: "Visita anulada",
  //       description: "La visita fue anulada correctamente",
  //       status: "success",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //     Auditar(
  //       125,
  //       3,
  //       ruteamientoId,
  //       Number(sessionStorage.getItem("user_id")),
  //       `Se anuló el ruteamiento #${ruteamientoId}`
  //     );
  //     fetchRuteamientos();
  //   } catch (error) {
  //     toast({
  //       title: "Error al anular la visita",
  //       description:
  //         "Ocurrió un error al anular la visita, por favor intente nuevamente",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };

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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación actual",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getMapCenter = useMemo(() => {
    if (l_latitud && l_longitud) {
      return {
        lat: parseFloat(l_latitud),
        lng: parseFloat(l_longitud),
      };
    }
    if (currentPosition) {
      return currentPosition;
    }
    return {
      lat: -25.2867, // Coordenadas por defecto (Asunción)
      lng: -57.3333,
    };
  }, [l_latitud, l_longitud, currentPosition]);

  const mapOptions = useMemo(
    () => ({
      ...defaultMapOptions,
      center: getMapCenter,
    }),
    [getMapCenter]
  );

  const marcarLlegada = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const horaActual = new Date().toLocaleTimeString("es-PY", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
            
            const response = await axios.post(
              `${api_url}agendas/registrar-llegada`,
              {
                l_agenda: ruteamientoId,
                l_fecha: new Date().toISOString().split("T")[0],
                l_hora_inicio: horaActual,
                l_obs: "Llegada del vendedor",
                l_cliente: clienteId,
                l_operador: sessionStorage.getItem("user_id"),
                l_longitud: position.coords.longitude.toString(),
                l_latitud: position.coords.latitude.toString(),
                l_acuracia: 1,
                l_estado: 1,
                l_codigo: 0,
              }
            );

            if (response.data.status === 201) {
              // Actualizar estado local
              setLlegadaMarcada(true);
              setHoraLlegada(horaActual);
              fetchLocalizaciones(ruteamientoId);
              toast({
                title: "Llegada marcada",
                description: "La llegada ha sido marcada exitosamente",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
              Auditar(
                125,
                1,
                ruteamientoId,
                Number(sessionStorage.getItem("user_id")),
                `El operador #${sessionStorage.getItem(
                  "user_id"
                )} llegó a su destino en la visita #${ruteamientoId}`
              );

              localStorage.setItem(`llegadaMarcada_${ruteamientoId}`, "true");
            }
          } catch (error) {
            toast({
              title: "Error al marcar la llegada",
              description:
                "Ocurrió un error al marcar la llegada, por favor intente nuevamente",
              status: "error",
              duration: 2000,
              isClosable: true,
            });
          }
        },
        (error) => {
          toast({
            title: "Error obteniendo ubicación",
            description: error.message,
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta geolocalización.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const marcarSalida = async () => {
    // if (!llegadaMarcada) {
    //   toast({
    //     title: "Error",
    //     description: "Debe marcar primero la llegada",
    //     status: "error",
    //     duration: 2000,
    //     isClosable: true,
    //   });
    //   return;
    // }
    try {
      const horaActual = new Date().toLocaleTimeString("es-PY", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      
      // Registrar la salida
      const response = await axios.post(`${api_url}agendas/registrar-salida`, {
        l_agenda: ruteamientoId,
        l_hora_fin: horaActual,
      });

      if (response.data.status === 201) {
        // Finalizar la visita
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              await axios.post(`${api_url}agendas/finalizar-visita`, {
                a_codigo: ruteamientoId,
                a_latitud: position.coords.latitude.toString(),
                a_longitud: position.coords.longitude.toString(),
              });
              
              // Actualizar estado local
              setHoraSalida(horaActual);
              fetchLocalizaciones(ruteamientoId);

              toast({
                title: "Salida marcada",
                description: "Se registró correctamente la salida y se finalizó la visita",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
              
              Auditar(
                125,
                1,
                ruteamientoId,
                Number(sessionStorage.getItem("user_id")),
                `El operador #${sessionStorage.getItem("user_id")} salió de su destino en la visita #${ruteamientoId}`
              );
              
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
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la salida",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };


  useEffect(() => {
    const llegadaPreviamenteMarcada = localStorage.getItem(
      `llegadaMarcada_${ruteamientoId}`
    );
    if (llegadaPreviamenteMarcada === "true") {
      setLlegadaMarcada(true);
    }
    
    // Actualizar estados locales cuando cambian las props
    setHoraLlegada(propHoraLlegada);
    setHoraSalida(propHoraSalida);
  }, [ruteamientoId, propHoraLlegada, propHoraSalida]);

  const handleToggleSubvisita = () => {
    console.log("Estado actual:", agregarSubvisita);
    setAgregarSubvisita((prevState) => !prevState);
    console.log("Nuevo estado:", !agregarSubvisita);
  };

  const eliminarSubvisita = async (id: number) => {
    try {
      const response = await axios.delete(`${api_url}agendas/subvisitas/${id}`);
      console.log(response.data);
      if (response.data.status === 200) {
        toast({
          title: "Subvisita eliminada",
          description: "La subvisita fue eliminada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        getSubvisitas(ruteamientoId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la subvisita",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
        w={isMobile ? "100%" : "100%"}
        onClick={() => {
          onVerDetallesModalOpen();
          fetchLocalizaciones(ruteamientoId);
          fetchNotasRuteamiento(ruteamientoId);
          getSubvisitas(ruteamientoId);
          getVentas(Number(sessionStorage.getItem("user_id")), clienteId);
          getPedidos(Number(sessionStorage.getItem("user_id")), clienteId);
        }}
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
                <Heading size="md">Cliente: {clienteNombre}</Heading>
                <Text py="2" className="text-gray-500 text-md font-bold">
                  RUC: {clienteRuc}
                </Text>
                <Text py="2" className="text-gray-500 text-md font-bold">
                  Dirección: {clienteDireccion}
                </Text>
                <Text py="2" className="text-gray-500 text-md font-bold">
                  Planificación: {observacion || "No hay planificación"}
                </Text>
              </Box>
              <Flex
                mt={6}
                flexDir={"column"}
                align={"flex-end"}
                justify={"center"}
              >
                <Text py="2" color={"gray.500"}>
                  {estado === 1 ? (
                    isCompleted ? (
                      `Visitado, ${horaLlegada ? `Llegada ${horaLlegada}` : ""} ${
                        horaSalida ? `Salida ${horaSalida}` : ""
                      }`
                    ) : (
                      `${diaDeLaSemana} ${fecha} ${hora}`
                    )
                  ) : (
                    <Text color={"red"} fontWeight={"bold"}>
                      Anulado
                    </Text>
                  )}
                </Text>
                <Flex w={"100%"} justifyContent={"flex-end"}>
                  <Text py="2" color={"gray.500"} className="text-md">
                    Vendedor: {vendedor}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </CardBody>
        </Stack>
      </Card>
      <Modal
        onClose={onVerDetallesModalClose}
        isOpen={isVerDetallesModalOpen}
        isCentered
        size={isMobile ? "full" : "6xl"}
      >
        <ModalOverlay />
        <ModalContent bg={"gray.100"}>
          <ModalHeader>Detalle de la visita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              flexDir={"column"}
              gap={2}
              className="overflow-y-auto max-h-[90vh]"
            >
              <div className="flex flex-row gap-2">
                <div
                  className={
                    isMobile
                      ? "flex flex-col gap-2 w-full overflow-y-auto"
                      : "flex flex-col gap-2 w-1/2"
                  }
                >
                  <Box
                    bg={"blue.500"}
                    height={"auto"}
                    borderRadius={"md"}
                    p={2}
                    display={"flex"}
                    flexDir={"column"}
                    gap={2}
                  >
                    <Flex gap={2} flexDir={"column"}>
                      <div className="flex flex-row gap-2">
                        <CircleUserRound color="white" />
                        <Text color={"white"} fontWeight={"bold"}>
                          Cliente a visitar: {clienteNombre}
                        </Text>
                      </div>
                      <Text color={"white"} fontWeight={"bold"}>
                        RUC: {clienteRuc}
                      </Text>
                      <Text color={"white"} fontWeight={"bold"}>
                        Dirección: {clienteDireccion}
                      </Text>
                    </Flex>
                    <Flex gap={2}>
                      <CalendarFold color="white" />
                      <Text color={"white"} fontWeight={"bold"}>
                        Fecha y hora de visita: {fecha} {hora}
                      </Text>
                    </Flex>
                    <Flex gap={2}>
                      <Phone color="white" />
                      <Text color={"white"} fontWeight={"bold"}>
                        Teléfono del cliente: {clienteTelefono}
                      </Text>
                    </Flex>
                  </Box>
                  <Divider></Divider>
                  <Flex
                    flexDir={"row"}
                    gap={4}
                    justify={"center"}
                    align={"center"}
                  >
                    <Badge
                      colorScheme={horaSalida ? "green" : "gray"}
                      className="w-1/4 font-bold text-xl"
                    >
                      {horaSalida ? "Visitado" : "Pendiente"}
                    </Badge>
                    <Badge
                      colorScheme={planificacion === 1 ? "green" : "gray"}
                      className="w-1/4 font-bold text-xl"
                    >
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
                      className="w-1/4 font-bold text-xl"
                    >
                      {prioridad === 3
                        ? "Prioridad Baja"
                        : prioridad === 2
                        ? "Prioridad Media"
                        : "Alta Prioridad"}
                    </Badge>
                    <Badge
                      colorScheme={estado === 1 ? "green" : "gray"}
                      className="w-1/4 font-bold text-xl"
                    >
                      {estado === 1 ? "Activo" : "Anulado"}
                    </Badge>
                  </Flex>
                  <Divider></Divider>
                  <Flex
                    gap={4}
                    h={"auto"}
                    justify={"center"}
                    className="flex flex-row gap-2 w-full"
                  >
                    <Box
                      display={"flex"}
                      flexDir={"row"}
                      gap={2}
                      p={2}
                      borderRadius={"md"}
                      bg={horaLlegada ? "green.500" : "gray.500"}
                      h={16}
                      justifyContent={"center"}
                      alignItems={"center"}
                      className={`transition-all duration-300 ${
                        horaLlegada
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:opacity-90"
                      }`}
                      onClick={() => {
                        if (!horaLlegada) marcarLlegada();
                      }}
                    >
                      <MapPinned color={"white"} />
                      <Box>
                        <Text color={"white"}>
                          Llegada: {horaLlegada || "No registrado"}
                        </Text>
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDir={"row"}
                      gap={2}
                      p={2}
                      borderRadius={"md"}
                      bg={horaSalida ? "red.500" : "gray.500"}
                      h={16}
                      justifyContent={"center"}
                      alignItems={"center"}
                      className={`transition-all duration-300 ${
                        horaSalida || !horaLlegada
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:opacity-90"
                      }`}
                      onClick={() => {
                        if (horaLlegada && !horaSalida) marcarSalida();
                      }}
                    >
                      <MapPinned color={"white"} />
                      <Box>
                        <Text color={"white"}>
                          Salida: {horaSalida || "No registrado"}
                        </Text>
                      </Box>
                    </Box>
                  </Flex>
                  <Divider></Divider>
                  <Box className="bg-white rounded-md p-2 mb-4 max-h-80 overflow-y-auto transition-colors duration-500">
                    <Text fontWeight={"bold"}>Planificación:</Text>
                    <Text>{observacion}</Text>
                  </Box>
                  <div className="w-full">
                    <div className="flex flex-row gap-2 mb-2">
                      <button
                        onClick={() => setActiveTab("resultados")}
                        className={`flex-1 py-2 px-4 rounded-t-lg transition-all duration-300 ${
                          activeTab === "resultados"
                            ? "bg-blue-500 text-white shadow-md transform -translate-y-1"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Resultados
                      </button>
                      <button
                        onClick={() => setActiveTab("pedidos")}
                        className={`flex-1 py-2 px-4 rounded-t-lg transition-all duration-300 ${
                          activeTab === "pedidos"
                            ? "bg-blue-500 text-white shadow-md transform -translate-y-1"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Pedidos
                      </button>
                      <button
                        onClick={() => setActiveTab("ventas")}
                        className={`flex-1 py-2 px-4 rounded-t-lg transition-all duration-300 ${
                          activeTab === "ventas"
                            ? "bg-blue-500 text-white shadow-md transform -translate-y-1"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Ventas
                      </button>
                      <button
                        onClick={() => setActiveTab("subvisitas")}
                        className={`flex-1 py-2 px-4 rounded-t-lg transition-all duration-300 ${
                          activeTab === "subvisitas"
                            ? "bg-blue-500 text-white shadow-md transform -translate-y-1"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Subvisitas
                      </button>
                    </div>
                  </div>
                </div>
                <div className={isMobile ? "hidden" : "w-1/2"}>
                  {isLoaded ? (
                    <div
                      style={{ width: "500px" }}
                      className="bg-white rounded-md p-2 shadow-xs overflow-y-auto transition-colors duration-500"
                    >
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        options={mapOptions}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                      >
                        {localizaciones.length > 0 &&
                          localizaciones[0]?.l_latitud && (
                            <Marker
                              position={{
                                lat: parseFloat(localizaciones[0].l_latitud),
                                lng: parseFloat(localizaciones[0].l_longitud),
                              }}
                              icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40),
                              }}
                              title="Ubicación de llegada"
                            />
                          )}

                        {localizaciones.length > 0 &&
                          localizaciones[0]?.l_latitud && (
                            <Marker
                              position={{
                                lat: parseFloat(localizaciones[0].l_latitud),
                                lng: parseFloat(localizaciones[0].l_longitud),
                              }}
                              icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40),
                              }}
                              title="Ubicación de salida"
                            />
                          )}

                        {currentPosition && (
                          <>
                            <Marker
                              position={currentPosition}
                              icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40),
                              }}
                              title="Tu ubicación actual"
                            />
                            <Circle
                              center={currentPosition}
                              radius={100}
                              options={{
                                fillColor: "#4285F4",
                                fillOpacity: 0.2,
                                strokeColor: "#4285F4",
                                strokeOpacity: 0.8,
                                strokeWeight: 1,
                              }}
                            />
                          </>
                        )}
                      </GoogleMap>
                    </div>
                  ) : (
                    <div>Cargando mapa...</div>
                  )}
                </div>
              </div>
              <Divider></Divider>
              <div className="bg-white rounded-b-lg shadow-sm">
                {activeTab === "resultados" && (
                  <ResultadosComponent
                    notasRuteamiento={notasRuteamiento}
                    notaNueva={notaNueva}
                    setNotaNueva={setNotaNueva}
                    handleKeyPress={handleKeyPress}
                    handleAgregarNota={handleAgregarNota}
                  />
                )}
                {activeTab === "pedidos" && (
                  <PedidosComponent
                    pedidos={pedidos}
                    handleBusquedaPedidos={handleBusquedaPedidos}
                  />
                )}
                {activeTab === "ventas" && (
                  <VentasComponent
                    ventas={ventas}
                    handleBusquedaVentas={handleBusquedaVentas}
                  />
                )}
                {activeTab === "subvisitas" && (
                  <SubvisitasComponent
                    subvisitas={subvisitas}
                    agregarSubvisita={agregarSubvisita}
                    handleToggleSubvisita={handleToggleSubvisita}
                    subvisitaForm={subvisitaForm}
                    setSubvisitaForm={setSubvisitaForm}
                    crearSubvisita={crearSubvisita}
                    actualizarSubvisita={actualizarSubvisita}
                    eliminarSubvisita={eliminarSubvisita}
                  />
                )}
              </div>
              <div className={isMobile ? "w-full" : "hidden"}>
                {isLoaded ? (
                  <div
                    style={{ width: "100%" }}
                    className="bg-white rounded-md p-2 shadow-xs overflow-y-auto transition-colors duration-500"
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      options={mapOptions}
                      onLoad={onLoad}
                      onUnmount={onUnmount}
                    >
                      {localizaciones.length > 0 &&
                        localizaciones[0]?.l_latitud && (
                          <Marker
                            position={{
                              lat: parseFloat(localizaciones[0].l_latitud),
                              lng: parseFloat(localizaciones[0].l_longitud),
                            }}
                            icon={{
                              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                              scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            title="Ubicación de llegada"
                          />
                        )}

                      {localizaciones.length > 0 &&
                        localizaciones[0]?.l_latitud && (
                          <Marker
                            position={{
                              lat: parseFloat(localizaciones[0].l_latitud),
                              lng: parseFloat(localizaciones[0].l_longitud),
                            }}
                            icon={{
                              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                              scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            title="Ubicación de salida"
                          />
                        )}

                      {currentPosition && (
                        <>
                          <Marker
                            position={currentPosition}
                            icon={{
                              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                              scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            title="Tu ubicación actual"
                          />
                          <Circle
                            center={currentPosition}
                            radius={100}
                            options={{
                              fillColor: "#4285F4",
                              fillOpacity: 0.2,
                              strokeColor: "#4285F4",
                              strokeOpacity: 0.8,
                              strokeWeight: 1,
                            }}
                          />
                        </>
                      )}
                    </GoogleMap>
                  </div>
                ) : (
                  <div>Cargando mapa...</div>
                )}
              </div>
            </Flex>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DetalleRuteamiento;
