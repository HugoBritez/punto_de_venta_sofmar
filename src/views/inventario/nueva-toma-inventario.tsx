import HeaderComponent from "@/modules/Header";
import {
  Deposito,
  SubUbicacion,
  Sucursal,
  Ubicacion,
} from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Flex,
  FormLabel,
  Input,
  Select,
  Button,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  useDisclosure,
  ModalBody,
  ModalCloseButton,
  Spinner,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { AlertTriangle, ArchiveRestore,  RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReporteAnomalias from "./reporte-anomalias";
import { motion, AnimatePresence } from "framer-motion";
import Auditar from "@/services/AuditoriaHook";


interface ArticulosCategoria {
  id: number;
  nombre: string;
  cantidad_articulos: number;
  selected?: boolean;
}

interface ArticulosMarca {
  id: number;
  nombre: string;
  cantidad_articulos: number;
  selected?: boolean;
}

interface ArticulosDirecta {
  id: number;
  descripcion: string;
}

interface ItemsParaTomaInventario {
  descripcion: string;
  stock: number;
  ubicacion: number;
  sub_ubicacion: number;
  vencimiento: string;
  lote: string;
  lote_id: number;
  codigo_barra: string;
  articulo_id: number;
  cod_interno: string;
}

interface FloatingCardProps {
  isVisible: boolean;
  items: any[];
  onClose: () => void;
  onSelect: (item: any) => void;
}

interface InventarioAuxiliar {
  id: number;
  nro_inventario: number;
  estado: number;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

interface ServerError {
  message?: string;
  error?: string;
  statusCode?: number;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </motion.div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title}
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-2"
                      >
                        <p className="text-sm text-gray-500">{message}</p>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Confirmar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};


const FloatingCard = ({
  isVisible,
  items,
  onClose,
  onSelect,
}: FloatingCardProps) => {
  return (
    <div
      className={`absolute z-50 bg-white shadow-lg rounded-md border border-gray-200 p-4 w-full min-h-[100px] max-h-[200px] overflow-y-auto mt-4
        transition-all duration-400 ease-out origin-top
        ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
    >
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="py-2 px-1">
            <p className="text-center text-gray-500 font-semibold">
              No se encontraron artículos.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="py-2 px-1 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
              onClick={() => onSelect(item)}
            >
              <p>{item.nombre || item.descripcion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NuevaTomaInventario = () => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const [depositos, setDepositos] = useState<Deposito[] | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);

  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);

  const [tipoInventario, setTipoInventario] = useState<string>("1");

  const [articulosCategoria, setArticulosCategoria] = useState<
    ArticulosCategoria[] | null
  >(null);
  const [articulosCategoriaFiltrados, setArticulosCategoriaFiltrados] =
    useState<ArticulosCategoria[] | null>(null);

  const [articulosDirecta, setArticulosDirecta] = useState<
    ArticulosDirecta[] | null
  >(null);

  const [articuloBuscado, setArticuloBuscado] = useState<string | null>(null);
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticulosDirecta | null>(null);

  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[]
  >([]);

  const [articulosMarca, setArticulosMarca] = useState<ArticulosMarca[] | null>(
    null
  );
  const [articulosMarcaFiltrados, setArticulosMarcaFiltrados] = useState<
    ArticulosMarca[] | null
  >(null);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<number[]>([]);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] =
    useState<Ubicacion | null>(null);
  const [subUbicaciones, setSubUbicaciones] = useState<SubUbicacion[]>([]);
  const [subUbicacionSeleccionada, setSubUbicacionSeleccionada] =
    useState<SubUbicacion | null>(null);
  const [itemsParaTomaInventario, setItemsParaTomaInventario] = useState<
    ItemsParaTomaInventario[]
  >([]);
  const [
    itemsParaTomaInventarioConScanner,
    setItemsParaTomaInventarioConScanner,
  ] = useState<ItemsParaTomaInventario[]>([]);
  const [filtrarPorMarca, setFiltrarPorMarca] = useState<boolean>(false);

  const [inventarioAuxiliar, setInventarioAuxiliar] =
    useState<InventarioAuxiliar>();

  const [numeroInventario, setNumeroInventario] = useState<number | null>(null);
  const [botonesLoading, setBotonesLoading] = useState<boolean>(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [itemEnEdicion, setItemEnEdicion] = useState<{
    lote_id: number;
    cantidad: number;
  } | null>(null);

  const toast = useToast();

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();


const actualizarCantidadManual = async (
  lote_id: number,
  nuevaCantidad: number
) => {
  try {
    const articulo = itemsParaTomaInventarioConScanner.find(
      (item) => item.lote_id === lote_id
    );

    if (!articulo) {
      throw new Error("Artículo no encontrado");
    }

    await axios.post(`${api_url}articulos/scannear-item-inventario-auxiliar`, {
      id_articulo: articulo.articulo_id,
      id_lote: lote_id,
      cantidad: nuevaCantidad,
    });
    buscarItemsPorInventarioDerecha();

    setItemEnEdicion(null);

    toast({
      title: "Cantidad actualizada",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    toast({
      title: "Error al actualizar cantidad",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  const fetchUbicaciones = async () => {
    const response = await axios.get(`${api_url}ubicaciones/`);
    setUbicaciones(response.data.body);
    setUbicacionSeleccionada(response.data.body[0]);
  };

  const fetchSubUbicaciones = async () => {
    const response = await axios.get(`${api_url}sububicaciones/`);
    setSubUbicaciones(response.data.body);
    setSubUbicacionSeleccionada(response.data.body[0]);
  };

  useEffect(() => {
    fetchUbicaciones();
    fetchSubUbicaciones();
  }, []);

  const fetchItemsParaTomaInventario = async () => {
    console.log(
      "estos son los datos",
      depositoSeleccionado,
      articuloSeleccionado,
      ubicacionSeleccionada,
      subUbicacionSeleccionada,
      categoriasSeleccionadas
    );

    // Validación según el tipo de inventario
    if (tipoInventario === "1" && categoriasSeleccionadas.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una categoría",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (tipoInventario === "2" && !articuloSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un artículo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (
      tipoInventario === "3" &&
      (!ubicacionSeleccionada || !subUbicacionSeleccionada)
    ) {
      toast({
        title: "Error",
        description: "Debe ingresar ubicación y sub-ubicación",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!depositoSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un depósito",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setBotonesLoading(true);
      const response = await axios.get(
        `${api_url}articulos/toma-inventario-items`,
        {
          params: {
            deposito_id: depositoSeleccionado?.dep_codigo,
            articulo_id:
              tipoInventario === "2" ? articuloSeleccionado?.id : null,
            ubicacion:
              tipoInventario === "3" ? ubicacionSeleccionada?.ub_codigo : null,
            sub_ubicacion:
              tipoInventario === "3"
                ? subUbicacionSeleccionada?.s_codigo
                : null,
            categorias: tipoInventario === "1" ? categoriasSeleccionadas : null,
            marcas: tipoInventario === "4" ? marcasSeleccionadas : null,
          },
        }
      );
      console.log("response", response.data.body);
      setItemsParaTomaInventario(response.data.body);
      if (response.data.body.length === 0) {
        toast({
          title: "Informacion",
          description: "No se encontraron items para toma inventario",
          status: "info",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al obtener items para toma inventario",
        status: "error",
        duration: 3000,
      });
    } finally {
      setBotonesLoading(false);
    }
  };
  const handleCategoriaSelect = (categoriaId: number) => {
    setCategoriasSeleccionadas((prevSelected) => {
      if (prevSelected.includes(categoriaId)) {
        return prevSelected.filter((id) => id !== categoriaId);
      } else {
        return [...prevSelected, categoriaId];
      }
    });
  };
  const handleMarcaSelect = (marcaId: number) => {
    setMarcasSeleccionadas((prevSelected) => {
      if (prevSelected.includes(marcaId)) {
        return prevSelected.filter((id) => id !== marcaId);
      } else {
        return [...prevSelected, marcaId];
      }
    });
  };

  const handleSelectAllCategorias = (checked: boolean) => {
    if (checked) {
      const todasLasCategorias = articulosCategoria?.map((cat) => cat.id) || [];
      setCategoriasSeleccionadas(todasLasCategorias);
    } else {
      setCategoriasSeleccionadas([]);
    }
  };

  const handleSelectAllMarcas = (checked: boolean) => {
    if (checked) {
      const todasLasMarcas = articulosMarca?.map((marca) => marca.id) || [];
      setMarcasSeleccionadas(todasLasMarcas);
    } else {
      setMarcasSeleccionadas([]);
    }
  };

  function handleBuscarItems(busqueda: string) {
    if (filtrarPorMarca) {
      const resultadosFiltrados = articulosMarca?.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setArticulosMarcaFiltrados(resultadosFiltrados || []);
    } else {
      const resultadosFiltrados = articulosCategoria?.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setArticulosCategoriaFiltrados(resultadosFiltrados || []);
    }
  }

  const fetchArticulosCategoria = async () => {
    const response = await axios.get(
      `${api_url}articulos/categorias-articulos`
    );
    setArticulosCategoria(response.data.body);
  };

  const fetchArticulosDirecta = async (busqueda: string) => {
    try {
      const response = await axios.get(`${api_url}articulos/directa`, {
        params: {
          busqueda,
          deposito: depositoSeleccionado?.dep_codigo,
        },
      });
      setArticulosDirecta(response.data.body);
    } catch (error) {}
  };

  const fetchMarcasArticulos = async () => {
    const response = await axios.get(`${api_url}articulos/marcas-articulos`);
    setArticulosMarca(response.data.body);
  };

  const fetchDepositos = async () => {
    const response = await axios.get(`${api_url}depositos/`);
    setDepositos(response.data.body);
    setDepositoSeleccionado(response.data.body[0]);
  };

  const fetchSucursales = async () => {
    const response = await axios.get(`${api_url}sucursales/listar`);
    setSucursales(response.data.body);
    setSucursalSeleccionada(response.data.body[0]);
  };

  const traerIdUltimoInventario = async () => {
    try {
      const response = await axios.get(
        `${api_url}articulos/ultimo-inventario-auxiliar`,{
          params : {
            deposito: depositoSeleccionado?.dep_codigo,
            sucursal: sucursalSeleccionada?.id
          }
        }
          
      );
      const data = response.data;
      console.log("data", response.data.body);
      setInventarioAuxiliar(data.body);
      setNumeroInventario(data.body.nro_inventario);
    } catch (error) {
      console.error("Error al obtener último número de inventario:", error);
    }
  };

const handleAnularInventario = async () => {
  try {
    await axios.get(`${api_url}articulos/anular-inventario-auxiliar`, {
      params: {
        id: inventarioAuxiliar?.id,
      },
    });

    toast({
      title: "Inventario anulado",
      description: "El inventario ha sido anulado exitosamente",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    traerIdUltimoInventario();
  } catch (error: any) {
    console.error("Error al anular inventario:", error);

    const axiosError = error as AxiosError<ServerError>;

    // Extraemos el mensaje de error del servidor
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Error desconocido al anular el inventario";

    toast({
      title: "No se pudo anular el inventario",
      description: `${errorMessage}`,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  useEffect(() => {
    fetchDepositos();
    fetchSucursales();
  }, []);

  useEffect(()=>{
    traerIdUltimoInventario()
    setItemsParaTomaInventario([])
  }, [depositoSeleccionado, sucursalSeleccionada])

  useEffect(() => {
    if (tipoInventario === "1") {
      fetchArticulosCategoria();
      setFiltrarPorMarca(false);
    } else if (tipoInventario === "4") {
      fetchMarcasArticulos();
      setFiltrarPorMarca(true);
    }

    setArticuloBuscado(null);
  }, [tipoInventario]);

  const handleArticuloInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor = e.target.value;
    setArticuloBuscado(valor);
    setArticuloSeleccionado(null);

    if (valor.length >= 3) {
      fetchArticulosDirecta(valor);
      setIsFloatingCardVisible(true);
    } else {
      setArticulosDirecta(null);
      setIsFloatingCardVisible(false);
    }
  };

  const handleArticuloSelect = (articulo: ArticulosDirecta) => {
    setArticuloSeleccionado(articulo);
    setArticuloBuscado(articulo.descripcion);
    setIsFloatingCardVisible(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (articuloBuscado && articuloBuscado.length >= 3) {
        fetchArticulosDirecta(articuloBuscado);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [articuloBuscado]);

  // Agregar manejo de teclas
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFloatingCardVisible(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const iniciarNuevoInventarioAuxiliar = async () => {
    const inventario = {
      operador: sessionStorage.getItem("user_id"),
      sucursal: sucursalSeleccionada?.id,
      deposito: depositoSeleccionado?.dep_codigo,
      obs: "",
      nro_inventario: inventarioAuxiliar?.nro_inventario
        ? Number(inventarioAuxiliar?.nro_inventario) + 1
        : 1,
    };
    try {
      await axios.post(
        `${api_url}articulos/insertar-inventario-auxiliar`,
        inventario
      );

      traerIdUltimoInventario();
      toast({
        title: "Inventario iniciado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      Auditar(
        1,
        1,
        inventarioAuxiliar?.id || null,
        Number(localStorage.getItem("user_id") || 1),
        "Inició un nuevo inventario con la app"
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al iniciar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const iniciarNuevoInventarioAuxiliarItems = async () => {
    const inventario = {
      inventario_items: itemsParaTomaInventario.map((item) => ({
        id_articulo: item.articulo_id,
        id_lote: item.lote_id,
        lote: item.lote,
        fecha_vencimiento: item.vencimiento,
        cantidad_inicial: item.stock,
      })),
    };

    // Validación según el tipo de inventario
    if (tipoInventario === "1" && categoriasSeleccionadas.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una categoría",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (tipoInventario === "2" && !articuloSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un artículo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (
      tipoInventario === "3" &&
      (!ubicacionSeleccionada || !subUbicacionSeleccionada)
    ) {
      toast({
        title: "Error",
        description: "Debe ingresar ubicación y sub-ubicación",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!depositoSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un depósito",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (tipoInventario === "4" && marcasSeleccionadas.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una marca",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (itemsParaTomaInventario.length === 0) {
      toast({
        title: "Error",
        description: "Debe procesar al menos un filtro para el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setBotonesLoading(true);
      await axios.post(
        `${api_url}articulos/insertar-inventario-auxiliar-items`,
        inventario
      );
      toast({
        title: "Inventario iniciado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al iniciar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBotonesLoading(false);
    }
  };

  const cerrarInventario = async () => {
    const inventario = {
      id: inventarioAuxiliar?.id,
      operador: sessionStorage.getItem("user_id"),
      sucursal: sucursalSeleccionada?.id,
      deposito: depositoSeleccionado?.dep_codigo,
      nro_inventario: numeroInventario,
    };
    try {
      setBotonesLoading(true);
      await axios.post(
        `${api_url}articulos/cerrar-inventario-auxiliar`,
        inventario
      );
      toast({
        title: "Inventario cerrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      traerIdUltimoInventario();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al cerrar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBotonesLoading(false);
    }
  };

  const buscarItemsPorInventarioDerecha = async () => {
    try {
      const response = await axios.get(
        `${api_url}articulos/mostrar-items-inventario-auxiliar-principal`,
        {
          params: {
            id: numeroInventario,
            scanneado: true,
            deposito: depositoSeleccionado?.dep_codigo,
            sucursal: sucursalSeleccionada?.id,
          },
        }
      );
      const data = response.data;
      console.log("Datos del inventario:", data.body);
      setItemsParaTomaInventarioConScanner(data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const buscarItemsPorInventarioIzquierda = async () => {
    try {
      setItemsParaTomaInventario([])
      const response = await axios.get(
        `${api_url}articulos/mostrar-items-inventario-auxiliar-principal`,
        {
          params: {
            id: numeroInventario,
            deposito: depositoSeleccionado?.dep_codigo,
            sucursal: sucursalSeleccionada?.id
          },
        }
      );
      const data = response.data;
      console.log("Datos del inventario:", data.body);
      setItemsParaTomaInventario(data.body);
    } catch (error) {
      console.error(error);
    }
  };



  return (
    <Flex
      bg={"gray.100"}
      h={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      p={2}
      gap={2}
    >
      <HeaderComponent
        Icono={ArchiveRestore}
        titulo="Inventario de articulos"
      />
      <div className="flex flex-row gap-4 border border-gray-300 rounded-md p-2 bg-white justify-between ">
        <div className="flex flex-col gap-2">
          {" "}
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Fecha:</FormLabel>
            <Input
              type="date"
              className="w-36"
              value={fechaActual.toISOString().split("T")[0]}
              onChange={(e) => setFechaActual(new Date(e.target.value))}
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Sucursal:</FormLabel>
            <Select
              name=""
              id=""
              className="w-36"
              value={sucursalSeleccionada?.id}
              onChange={(e) =>
                setSucursalSeleccionada(
                  sucursales?.find(
                    (sucursal) => sucursal.id === parseInt(e.target.value)
                  ) || null
                )
              }
            >
              {sucursales?.map((sucursal) => (
                <option value={sucursal.id}>{sucursal.descripcion}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Deposito:</FormLabel>
            <Select
              name=""
              id=""
              className="w-36"
              value={depositoSeleccionado?.dep_codigo}
              onChange={(e) =>
                setDepositoSeleccionado(
                  depositos?.find(
                    (deposito) =>
                      deposito.dep_codigo === parseInt(e.target.value)
                  ) || null
                )
              }
            >
              {depositos?.map((deposito) => (
                <option value={deposito.dep_codigo}>
                  {deposito.dep_descripcion}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Nro. Inventario:</FormLabel>
            <Input
              type="number"
              className="w-36"
              value={numeroInventario || ""}
              onChange={(e) => setNumeroInventario(parseInt(e.target.value))}
            />
            <Button onClick={() => setShowConfirmModal(true)} colorScheme="red">
              <X />
            </Button>
            <ConfirmModal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={handleAnularInventario}
              title="¿Está seguro de anular este inventario?"
              message="Esta acción anulará el inventario y no podrá ser revertida."
            />
            <Button
              onClick={buscarItemsPorInventarioIzquierda}
              colorScheme="green"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
        <div className="flex flex-col  border border-gray-300 rounded-md p-2 bg-white">
          <FormLabel>Tipo de inventario</FormLabel>
          <RadioGroup
            className="flex flex-col gap-2 justify-start"
            onChange={(value) => setTipoInventario(value)}
            value={tipoInventario}
          >
            <Radio value="1">Inventario por categoria</Radio>
            <Radio value="2">Inventario por articulo</Radio>
            <Radio value="3">Inventario por ubicación</Radio>
            <Radio value="4">Inventario por marca</Radio>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <FormLabel>Articulo</FormLabel>
            <Input
              type="text"
              placeholder="Buscar articulo por nombre o codigo de barras"
              isDisabled={
                tipoInventario === "1" ||
                tipoInventario === "3" ||
                tipoInventario === "4"
              }
              value={articuloBuscado || ""}
              onChange={handleArticuloInputChange}
              onClick={() => {
                if (articuloBuscado && articuloBuscado.length >= 3) {
                  setIsFloatingCardVisible(true);
                }
              }}
            />
            <FloatingCard
              isVisible={isFloatingCardVisible}
              items={articulosDirecta || []}
              onClose={() => setIsFloatingCardVisible(false)}
              onSelect={handleArticuloSelect}
            />
          </div>
          <div className="flex flex-row gap-1">
            <div className="flex flex-col ">
              <FormLabel>Ubicacion</FormLabel>
              <Select
                onChange={(e) =>
                  setUbicacionSeleccionada(
                    ubicaciones.find(
                      (ubicacion) =>
                        ubicacion.ub_codigo === parseInt(e.target.value)
                    ) || null
                  )
                }
                isDisabled={
                  tipoInventario === "2" ||
                  tipoInventario === "1" ||
                  tipoInventario === "4"
                }
                value={ubicacionSeleccionada?.ub_codigo}
              >
                {ubicaciones.map((ubicacion) => (
                  <option value={ubicacion.ub_codigo}>
                    {ubicacion.ub_descripcion}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col ">
              <FormLabel>Sub-ubicacion</FormLabel>
              <Select
                onChange={(e) =>
                  setSubUbicacionSeleccionada(
                    subUbicaciones.find(
                      (subUbicacion) =>
                        subUbicacion.s_codigo === parseInt(e.target.value)
                    ) || null
                  )
                }
                isDisabled={
                  tipoInventario === "2" ||
                  tipoInventario === "1" ||
                  tipoInventario === "4"
                }
                value={subUbicacionSeleccionada?.s_codigo}
              >
                {subUbicaciones.map((subUbicacion) => (
                  <option value={subUbicacion.s_codigo}>
                    {subUbicacion.s_descripcion}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col flex-1 w-full ${
            tipoInventario === "2" || tipoInventario === "3"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <div className="flex flex-row gap-2 items-center">
            <FormLabel>
              {tipoInventario === "1"
                ? "Categorias"
                : tipoInventario === "4"
                ? "Marcas"
                : "Categorias"}
            </FormLabel>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full my-2 bg-gray-200 p-1 rounded-md outline-none"
              onChange={(e) => handleBuscarItems(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 w-full overflow-y-auto h-[120px]">
            {filtrarPorMarca === false ? (
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th>
                      <div className="flex flex-col  items-center justify-center bg-white">
                        <Checkbox
                          isChecked={
                            articulosCategoria?.length ===
                            categoriasSeleccionadas.length
                          }
                          isIndeterminate={
                            categoriasSeleccionadas.length > 0 &&
                            categoriasSeleccionadas.length <
                              (articulosCategoria?.length || 0)
                          }
                          onChange={(e) =>
                            handleSelectAllCategorias(e.target.checked)
                          }
                          isDisabled={
                            tipoInventario === "2" || tipoInventario === "3"
                          }
                        />
                      </div>
                    </th>
                    <th className="text-center">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-center">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {(articulosCategoriaFiltrados || articulosCategoria)?.map(
                    (articulo) => (
                      <tr key={articulo.id}>
                        <td className="text-center">
                          <div className="flex flex-row gap-2 items-center justify-center">
                            <Checkbox
                              isChecked={categoriasSeleccionadas.includes(
                                articulo.id
                              )}
                              onChange={() =>
                                handleCategoriaSelect(articulo.id)
                              }
                              isDisabled={
                                tipoInventario === "2" || tipoInventario === "3"
                              }
                            />
                          </div>
                        </td>
                        <td className="text-center">{articulo.id}</td>
                        <td>{articulo.nombre}</td>
                        <td className="text-center">
                          {articulo.cantidad_articulos}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th>
                      <div className="flex flex-col  items-center justify-center bg-white">
                        <Checkbox
                          isChecked={
                            articulosMarca?.length ===
                            marcasSeleccionadas.length
                          }
                          isIndeterminate={
                            marcasSeleccionadas.length > 0 &&
                            marcasSeleccionadas.length <
                              (articulosMarca?.length || 0)
                          }
                          onChange={(e) =>
                            handleSelectAllMarcas(e.target.checked)
                          }
                          isDisabled={
                            tipoInventario === "2" || tipoInventario === "3"
                          }
                        />
                      </div>
                    </th>
                    <th className="text-center">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-center">Cantidad</th>
                  </tr>
                </thead>

                <tbody>
                  {(articulosMarcaFiltrados || articulosMarca)?.map(
                    (articulo) => (
                      <tr key={articulo.id}>
                        <td className="text-center">
                          <div className="flex flex-row gap-2 items-center justify-center">
                            <Checkbox
                              isChecked={marcasSeleccionadas.includes(
                                articulo.id
                              )}
                              onChange={() => handleMarcaSelect(articulo.id)}
                              isDisabled={
                                tipoInventario === "2" || tipoInventario === "3"
                              }
                            />
                          </div>
                        </td>
                        <td className="text-center">{articulo.id}</td>
                        <td>{articulo.nombre}</td>
                        <td className="text-center">
                          {articulo.cantidad_articulos}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2  justify-center">
          <Button colorScheme="orange" onClick={onOpenModal}>
            Generar reporte
          </Button>
          <Button
            variant={"outline"}
            colorScheme="red"
            onClick={
              inventarioAuxiliar?.estado === 1 ||
              inventarioAuxiliar?.estado === undefined ||
              inventarioAuxiliar?.estado === null
                ? iniciarNuevoInventarioAuxiliar
                : cerrarInventario
            }
          >
            {botonesLoading ? (
              <Spinner size="sm" />
            ) : inventarioAuxiliar?.estado === 1 ||
              inventarioAuxiliar?.estado === undefined ||
              inventarioAuxiliar?.estado === null ? (
              "Iniciar Inventario"
            ) : (
              "Cerrar Inventario"
            )}
          </Button>
          <Button
            colorScheme="blue"
            onClick={iniciarNuevoInventarioAuxiliarItems}
            isDisabled={
              inventarioAuxiliar?.estado === 1 ||
              inventarioAuxiliar?.estado === undefined ||
              inventarioAuxiliar?.estado === null
            }
          >
            {botonesLoading ? <Spinner size="sm" /> : "Guardar items"}
          </Button>
          <Button colorScheme="green" onClick={fetchItemsParaTomaInventario}>
            {botonesLoading ? <Spinner size="sm" /> : "Procesar"}
          </Button>
        </div>
      </div>
      <div className="flex flex-row w-full border border-gray-300 rounded-md bg-white h-[70%] p-1 gap-1">
        <div className="flex flex-col w-1/2 border border-gray-300 rounded-md bg-white h-full">
          <p className="text-center py-3 font-bold text-lg">A inventariar:</p>
          <Divider />
          <div className="flex-1 overflow-hidden ">
            <div className="flex w-full h-full overflow-y-auto">
              <table className="w-full ">
                <thead className="bg-gray-200 text-center sticky top-0">
                  <tr className="border border-gray-300">
                    <th className="text-left border border-gray-300 px-2 ">
                      Ubi./Sub-ubi.
                    </th>
                    <th>Cod. Interno</th>
                    <th className="text-left border border-gray-300 px-2 ">
                      Codigo Barras
                    </th>
                    <th className="text-left border border-gray-300 px-2 ">
                      Descripcion
                    </th>
                    <th className="text-left border border-gray-300 px-2 ">
                      Vencimiento
                    </th>
                    <th className="text-left border border-gray-300 px-2 ">
                      Lote
                    </th>
                    <th className="text-left border border-gray-300 px-2 ">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {itemsParaTomaInventario.map((item) => (
                    <tr key={item.lote_id} className="border border-gray-300">
                      <td className="border border-gray-300 px-2 truncate">
                        {item.ubicacion} / {item.sub_ubicacion}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.cod_interno}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.codigo_barra}

                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.descripcion}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.vencimiento}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.lote}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Divider />
          <div className="flex w-full h-1/10 p-1">
            <p className="text-center font-bold text-lg">
              Total a inventariar: {itemsParaTomaInventario.length}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-1/2 border border-gray-300 rounded-md bg-white h-[100%]">
          <div className="flex flex-row justify-between items-center px-4 py-2 ">
            <p className="text-center font-bold text-lg">Inventariado:</p>
            <Button
              variant={"outline"}
              colorScheme="blue"
              onClick={buscarItemsPorInventarioDerecha}
            >
              <RotateCcw />
            </Button>
          </div>
          <Divider />
          <div className="flex-1 overflow-hidden">
            <div className="flex w-full h-full overflow-y-auto">
              <table className="w-full ">
                <thead className="bg-gray-200 text-center sticky top-0">
                  <tr className="border border-gray-300">
                    <th className="text-left border border-gray-300 px-2">
                      Ubi./Sub-ubi.
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Cod. Interno
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Codigo Barras
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Descripcion
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Vencimiento
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Lote
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Cantidad Scanner
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {itemsParaTomaInventarioConScanner.map((item) => (
                    <tr key={item.lote_id} className="border border-gray-300">
                      <td className="border border-gray-300 px-2 truncate">
                        {item.ubicacion} / {item.sub_ubicacion}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.cod_interno}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.codigo_barra}

                      </td>
                      <td className="border border-gray-300 px-2 truncate ">
                        {item.descripcion}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.vencimiento}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.lote}
                      </td>
                      <td className="border border-gray-300 px-2 truncate items-center justify-center">
                        {itemEnEdicion?.lote_id === item.lote_id ? (
                          <div className="flex items-center gap-2 justify-center h-full">
                            <Input
                              type="number"
                              size="sm"
                              value={itemEnEdicion.cantidad}
                              onChange={(e) =>
                                setItemEnEdicion({
                                  ...itemEnEdicion,
                                  cantidad: parseInt(e.target.value),
                                })
                              }
                              className="w-20"
                            />
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() =>
                                actualizarCantidadManual(
                                  item.lote_id,
                                  itemEnEdicion.cantidad
                                )
                              }
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => setItemEnEdicion(null)}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={`px-2 py-1 rounded ${
                              inventarioAuxiliar?.estado === 0 
                                ? "cursor-pointer hover:bg-gray-100" 
                                : "cursor-not-allowed text-gray-500"
                            }`}
                            onClick={() => {
                              if (inventarioAuxiliar?.estado === 0) {
                                setItemEnEdicion({
                                  lote_id: item.lote_id,
                                  cantidad: item.stock,
                                });
                              } else {
                                toast({
                                  title: inventarioAuxiliar?.estado === 1 ? "Inventario cerrado" : "Inventario anulado",
                                  description: `No se puede editar un inventario que ya está ${inventarioAuxiliar?.estado === 1 ? "cerrado" : "anulado"}`,
                                  status: "warning",
                                  duration: 3000,
                                  isClosable: true,
                                });
                              }
                            }}
                          >
                            {item.stock}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Divider />
          <div className="flex w-full h-1/10 p-1">
            <p className="text-center font-bold text-lg">
              Total inventariado: {itemsParaTomaInventarioConScanner.length}
            </p>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={onCloseModal} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <p>Reporte de anomalias</p>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReporteAnomalias
              numeroInventario={inventarioAuxiliar?.nro_inventario || 0}
              sucursal={sucursalSeleccionada?.id || 0}
              deposito={depositoSeleccionado?.dep_codigo || 0}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default NuevaTomaInventario;
