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
import {
  AlertTriangle,
  ArchiveRestore,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReporteAnomalias from "./reporte-anomalias";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCard from "@/modules/FloatingCard";

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

interface ArticulosSeccion {
  id: number;
  nombre: string;
  cantidad_articulos: number;
  selected?: boolean;
}

interface ArticulosDirecta {
  al_codigo: number;
  ar_codigo: number;
  ar_cod_interno: number;
  ar_descripcion: string;
  al_codbarra: string;
}

interface Inventario {
  id: number;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_cierre: string;
  hora_cierre: string;
  operador_id: number;
  operador_nombre: string;
  sucursal_id: number;
  sucursal_nombre: string;
  deposito_id: number;
  deposito_nombre: string;
  estado: number;
  nro_inventario: number;
  autorizado: number;
  categorias: Categoria[];
  marcas: Marca[];
  secciones: Seccion[];
  articulos: Articulo[];
  ubicaciones: UbicacionInventario[];
}

interface Categoria {
  id: number;
  descripcion: string;
  cantidad_items: number;
}

interface Marca {
  id: number;
  descripcion: string;
  cantidad_items: number;
}

interface Seccion {
  id: number;
  descripcion: string;
  cantidad_items: number;
}

interface Articulo {
  id: number;
  descripcion: string;
}

interface UbicacionInventario {
  id: number;
  descripcion: string;
  cantidad_items: number;
}

interface ItemsEnInventario {
  articulo_id: number;
  cod_interno: string;
  cod_barra: string;
  cod_barra_articulo: string;
  lote_id: number;
  descripcion: string;
  vencimiento: string;
  ubicacion: string;
  sub_ubicacion: string;
  lote: string;
  cantidad_inicial: number;
  cantidad_escaneada: number;
  cantidad_actual: number;
  stock: number;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

type TipoInventario = "1" | "2" | "3" | "4" | "5";

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
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

const ListadoInventarios = ({
  inventarios,
  onSelect,
  selectedInventario,
  onSearch,
  isLoading,
  isOpen,
  onClose,
  onAnular,
  onCerrar,
  onCreate,
}: {
  inventarios: Inventario[];
  onSelect: (inventario: Inventario) => void;
  selectedInventario: Inventario | null;
  onSearch: (busqueda: number) => void;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAnular: (inventario: Inventario) => void;
  onCerrar: (inventario: Inventario) => void;
  onCreate: () => void;
}) => {
  const [busqueda, setBusqueda] = useState<string>("");

  const handleSearch = () => {
    const numeroInventario = parseInt(busqueda);
    if (!isNaN(numeroInventario)) {
      onSearch(numeroInventario);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 w-[500px]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <div className="p-3 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Listado de Inventarios
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Buscar por número..."
              className="flex-1 p-2 border rounded-lg outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleSearch}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Spinner size="md" color="blue.500" />
            </div>
          ) : inventarios.length > 0 ? (
            <div className="p-2">
              {inventarios.map((inventario) => (
                <div
                  key={inventario.id}
                  className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                    selectedInventario?.id === inventario.id
                      ? "bg-blue-50 border-blue-500"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => onSelect(inventario)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        #{inventario.nro_inventario}
                      </span>
                      <p className="text-sm text-gray-600">
                        {inventario.sucursal_nombre}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        inventario.autorizado === 1
                          ? "bg-blue-100 text-blue-800"
                          : inventario.estado === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : inventario.estado === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {inventario.autorizado === 1
                        ? "Autorizado"
                        : inventario.estado === 0
                        ? "Abierto"
                        : inventario.estado === 1
                        ? "Cerrado"
                        : "Anulado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No se encontraron inventarios
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
          <button
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            onClick={() => onCreate()}
          >
            Crear Nuevo
          </button>
          <button
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            onClick={() => selectedInventario && onCerrar(selectedInventario)}
            disabled={!selectedInventario || selectedInventario.estado !== 0}
          >
            Cerrar
          </button>
          <button
            className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
            onClick={() => selectedInventario && onAnular(selectedInventario)}
            disabled={!selectedInventario || selectedInventario.estado === 2}
          >
            Anular
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TomaDeInventario = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [depositos, setDepositos] = useState<Deposito[] | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);

  const [tipoInventario, setTipoInventario] = useState<string>("1");

  const [articulosSecciones, setArticulosSecciones] = useState<
    ArticulosSeccion[] | null
  >(null);
  const [articulosSeccionesFiltrados] = useState<ArticulosSeccion[] | null>(
    null
  );

  const [articulosCategoria, setArticulosCategoria] = useState<
    ArticulosCategoria[] | null
  >(null);
  const [articulosCategoriaFiltrados] = useState<ArticulosCategoria[] | null>(
    null
  );

  const [articulosDirecta, setArticulosDirecta] = useState<
    ArticulosDirecta[] | null
  >(null);

  const [articuloBuscado, setArticuloBuscado] = useState<string | null>(null);
  const [busquedaItemsEnInventario, setBusquedaItemsEnInventario] =
    useState("");

  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticulosDirecta | null>(null);

  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[]
  >([]);

  const [articulosMarca, setArticulosMarca] = useState<ArticulosMarca[] | null>(
    null
  );
  const [articulosMarcaFiltrados] = useState<ArticulosMarca[] | null>(null);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<number[]>([]);

  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    number[]
  >([]);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] =
    useState<Ubicacion | null>(null);
  const [subUbicaciones, setSubUbicaciones] = useState<SubUbicacion[]>([]);
  const [subUbicacionSeleccionada, setSubUbicacionSeleccionada] =
    useState<SubUbicacion | null>(null);

  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [inventarioSeleccionado, setInventarioSeleccionado] =
    useState<Inventario | null>(null);
  const [itemsEnInventario, setItemsEnInventario] = useState<
    ItemsEnInventario[]
  >([]);

  const [botonesLoading, setBotonesLoading] = useState<boolean>(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [editingItem, setEditingItem] = useState<{
    id: number;
    value: number;
  } | null>(null);
  const [editandoCantidadInicial, setEditandoCantidadInicial] = useState<{
    id: number;
    value: number;
  } | null>(null);

  const toast = useToast();

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const [categoriasInventariadas] = useState<number[]>([]);
  const [marcasInventariadas] = useState<number[]>([]);
  const [seccionesInventariadas] = useState<number[]>([]);

  const [numeroInventarioBusqueda, setNumeroInventarioBusqueda] =
    useState<number>(0);

  const [isListadoOpen, setIsListadoOpen] = useState(false);

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

  const handleSeccionSelect = (seccionId: number) => {
    setSeccionesSeleccionadas((prevSelected) => {
      if (prevSelected.includes(seccionId)) {
        return prevSelected.filter((id) => id !== seccionId);
      } else {
        return [...prevSelected, seccionId];
      }
    });
  };

  const handleSelectAllSecciones = (checked: boolean) => {
    if (checked) {
      const todasLasSecciones =
        articulosSecciones?.map((seccion) => seccion.id) || [];
      setSeccionesSeleccionadas(todasLasSecciones);
    } else {
    }
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

  const fetchArticulosCategoria = async () => {
    const response = await axios.get(
      `${api_url}articulos/categorias-articulos`
    );
    setArticulosCategoria(response.data.body);
  };

  const fetchArticulosSecciones = async () => {
    const response = await axios.get(`${api_url}articulos/secciones-articulos`);
    setArticulosSecciones(response.data.body);
  };

  const fetchArticulosDirecta = async (busqueda: string) => {
    try {
      setArticulosDirecta([]);
      const response = await axios.get(`${api_url}articulos/`, {
        params: {
          buscar: busqueda,
          id_deposito: depositoSeleccionado?.dep_codigo,
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

  useEffect(() => {
    fetchDepositos();
    fetchSucursales();
  }, []);

  useEffect(() => {
    if (tipoInventario === "1") {
      fetchArticulosCategoria();
    } else if (tipoInventario === "4") {
      fetchMarcasArticulos();
    } else if (tipoInventario === "5") {
      fetchArticulosSecciones();
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
    setArticuloBuscado(articulo.ar_descripcion);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFloatingCardVisible(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const TablaArticulos = () => {
    if (tipoInventario === "1") {
      return (
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
                    isDisabled={tipoInventario !== "1"}
                  />
                </div>
              </th>
              <th className="text-center">Código</th>
              <th className="text-left">Descripción</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Cargado</th>
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
                        onChange={() => handleCategoriaSelect(articulo.id)}
                      />
                    </div>
                  </td>
                  <td className="text-center">{articulo.id}</td>
                  <td>{articulo.nombre}</td>
                  <td className="text-center">{articulo.cantidad_articulos}</td>
                  <td className="text-center">
                    {categoriasInventariadas?.includes(articulo.id)
                      ? "SI"
                      : "NO"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      );
    } else if (tipoInventario === "4") {
      return (
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th>
                <div className="flex flex-col  items-center justify-center bg-white">
                  <Checkbox
                    isChecked={
                      articulosMarca?.length === marcasSeleccionadas.length
                    }
                    isIndeterminate={
                      marcasSeleccionadas.length > 0 &&
                      marcasSeleccionadas.length < (articulosMarca?.length || 0)
                    }
                    onChange={(e) => handleSelectAllMarcas(e.target.checked)}
                  />
                </div>
              </th>
              <th className="text-center">Código</th>
              <th className="text-left">Descripción</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Cargado</th>
            </tr>
          </thead>
          <tbody>
            {(articulosMarcaFiltrados || articulosMarca)?.map((articulo) => (
              <tr key={articulo.id}>
                <td className="text-center">
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <Checkbox
                      isChecked={marcasSeleccionadas.includes(articulo.id)}
                      onChange={() => handleMarcaSelect(articulo.id)}
                    />
                  </div>
                </td>
                <td className="text-center">{articulo.id}</td>
                <td>{articulo.nombre}</td>
                <td className="text-center">{articulo.cantidad_articulos}</td>
                <td className="text-center">
                  {marcasInventariadas?.includes(articulo.id) ? "SI" : "NO"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (tipoInventario === "5") {
      return (
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th>
                <div className="flex flex-col  items-center justify-center bg-white">
                  <Checkbox
                    isChecked={
                      articulosSecciones?.length ===
                      seccionesSeleccionadas.length
                    }
                    isIndeterminate={
                      seccionesSeleccionadas.length > 0 &&
                      seccionesSeleccionadas.length <
                        (articulosSecciones?.length || 0)
                    }
                    onChange={(e) => handleSelectAllSecciones(e.target.checked)}
                  />
                </div>
              </th>
              <th className="text-center">Código</th>
              <th className="text-left">Descripción</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Cargado</th>
            </tr>
          </thead>
          <tbody>
            {(articulosSeccionesFiltrados || articulosSecciones)?.map(
              (articulo) => (
                <tr key={articulo.id}>
                  <td className="text-center">
                    <div className="flex flex-row gap-2 items-center justify-center">
                      <Checkbox
                        isChecked={seccionesSeleccionadas.includes(articulo.id)}
                        onChange={() => handleSeccionSelect(articulo.id)}
                      />
                    </div>
                  </td>
                  <td className="text-center">{articulo.id}</td>
                  <td>{articulo.nombre}</td>
                  <td className="text-center">{articulo.cantidad_articulos}</td>
                  <td className="text-center">
                    {seccionesInventariadas?.includes(articulo.id)
                      ? "SI"
                      : "NO"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      );
    }
  };

  interface GetInventarioParams {
    inventario_id?: number;
    nro_inventario?: number;
    sucursal?: number;
    deposito?: number;
  }

  const getInventarios = async ({
    nro_inventario,
    sucursal,
    deposito,
  }: GetInventarioParams) => {
    try {
      setBotonesLoading(true);

      const response = await axios.get(`${api_url}inventarios/all`, {
        params: {
          nro_inventario,
          sucursal,
          deposito,
        },
      });

      setInventarios(response.data.body);
      console.log(response.data.body);
      return response.data.body;

      if (response.data.body.length === 0) {
        toast({
          title: "Sin resultados",
          description:
            "No se encontraron inventarios con los criterios especificados",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.message || "Error al obtener inventarios"
          : "Error inesperado al obtener inventarios";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      console.error("[getInventario]:", error);
    } finally {
      setBotonesLoading(false);
    }
  };

  const getItemsEnInventario = async (
    id_inventario: number,
    buscar?: string
  ) => {
    if (!id_inventario) {
      toast({
        title: "Error",
        description:
          "No se puede obtener items en inventario sin un inventario seleccionado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setBotonesLoading(true);
      const response = await axios.get(`${api_url}inventarios/items/`, {
        params: {
          id_inventario,
          buscar,
        },
      });

      setItemsEnInventario(response.data.body);
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Error al obtener items en inventario"
          : "Error inesperado al obtener items en inventario";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBotonesLoading(false);
    }
  };

  const handleBuscarItemsEnInventario = (
    id_inventario: number,
    buscar?: string
  ) => {
    getItemsEnInventario(id_inventario, buscar);
  };

  const handleBuscarInventario = (busquedaInventarioNumero: number) => {
    getInventarios({
      nro_inventario: busquedaInventarioNumero,
      sucursal: sucursalSeleccionada?.id,
      deposito: depositoSeleccionado?.dep_codigo,
    });
  };

  const handleSelectInventario = (inventario: Inventario) => {
    setInventarioSeleccionado(inventario);
    setNumeroInventarioBusqueda(inventario.nro_inventario);
  };

  useEffect(() => {
    getInventarios({
      sucursal: sucursalSeleccionada?.id,
      deposito: depositoSeleccionado?.dep_codigo,
    });
  }, [depositoSeleccionado, sucursalSeleccionada]);

  useEffect(() => {
    if (inventarios.length > 0) {
      setInventarioSeleccionado(inventarios[0]);
    }
  }, [inventarios]);

  useEffect(() => {
    if (inventarioSeleccionado) {
      setNumeroInventarioBusqueda(inventarioSeleccionado.nro_inventario);
    }
  }, [inventarioSeleccionado]);

  useEffect(() => {
    if (inventarioSeleccionado) {
      handleBuscarItemsEnInventario(inventarioSeleccionado.id);
    }
  }, [inventarioSeleccionado]);

  const handleBusquedaArticulo = (busqueda: string) => {
    setBusquedaItemsEnInventario(busqueda);
    handleBuscarItemsEnInventario(inventarioSeleccionado?.id || 0, busqueda);
  };

  async function anularInventario() {
    try {
      await axios.post(`${api_url}inventarios/anular/`, {
        id: inventarioSeleccionado?.id,
      });
      toast({
        title: "Inventario anulado",
        description: "El inventario ha sido anulado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowConfirmModal(false);
      getInventarios({
        sucursal: sucursalSeleccionada?.id,
        deposito: depositoSeleccionado?.dep_codigo,
      });
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje || "Error al anular inventario"
          : "Error inesperado al anular inventario";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("[anularInventario]:", error);
    }
  }

  async function cerrarInventario(id_inventario: number) {
    if (id_inventario === undefined) {
      toast({
        title: "Error",
        description:
          "No se puede cerrar un inventario sin un inventario seleccionado",
        status: "error",
      });
    }
    try {
      await axios.post(`${api_url}inventarios/cerrar/`, {
        id: id_inventario,
      });
      toast({
        title: "Inventario cerrado",
        description: "El inventario ha sido cerrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowConfirmModal(false);
      getInventarios({
        sucursal: sucursalSeleccionada?.id,
        deposito: depositoSeleccionado?.dep_codigo,
      });
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje || "Error al cerrar inventario"
          : "Error inesperado al cerrar inventario";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("[cerrarInventario]:", error);
    }
  }

  async function crearInventario() {
    try {
      const inventariosActuales = await getInventarios({
        sucursal: sucursalSeleccionada?.id,
        deposito: depositoSeleccionado?.dep_codigo,
      });

      const nroInventario =
        inventariosActuales.length > 0
          ? parseInt(inventariosActuales[0].nro_inventario) + 1
          : 1;

      await axios.post(`${api_url}inventarios/`, {
        inventario: {
          operador: parseInt(sessionStorage.getItem("user_id") || "0"),
          sucursal: sucursalSeleccionada?.id,
          deposito: depositoSeleccionado?.dep_codigo,
          obs: "",
          nro_inventario: nroInventario,
        },
      });
      toast({
        title: "Inventario creado",
        description: "El inventario ha sido creado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getInventarios({
        sucursal: sucursalSeleccionada?.id,
        deposito: depositoSeleccionado?.dep_codigo,
      });
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje || "Error al crear inventario"
          : "Error inesperado al crear inventario";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("[crearInventario]:", error);
    }
  }

  async function insertarItemsEnInventario() {
    try {
      if (inventarioSeleccionado?.id === undefined) {
        toast({
          title: "Error",
          description:
            "No se puede insertar items en inventario sin un inventario seleccionado",
          status: "error",
        });
        return;
      }
      if (tipoInventario === "1" && categoriasSeleccionadas.length === 0) {
        toast({
          title: "Error",
          description:
            "No se puede insertar items en inventario sin un articulo seleccionado",
          status: "error",
        });
        return;
      }
      if (tipoInventario === "2" && !articuloSeleccionado) {
        toast({
          title: "Error",
          description:
            "No se puede insertar items en inventario sin un articulo seleccionado",
          status: "error",
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

      const response = await axios.post(`${api_url}inventarios/items`, {
        inventario_id: inventarioSeleccionado?.id,
        deposito: depositoSeleccionado?.dep_codigo,
        filtros: {
          categorias: categoriasSeleccionadas,
          marcas: marcasSeleccionadas,
          secciones: seccionesSeleccionadas,
          articulos: articuloSeleccionado?.al_codigo,
          ubicacion: ubicacionSeleccionada,
          sub_ubicacion: subUbicacionSeleccionada,
        },
      });

      console.log(response);

      toast({
        title: "Items insertados",
        description: "Los items han sido insertados correctamente",
        status: "success",
      });
      getItemsEnInventario(inventarioSeleccionado?.id);
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje ||
            "Error al insertar items en inventario"
          : "Error inesperado al insertar items en inventario";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("[insertarItemsEnInventario]:", error);
    }
  }

  const editarCantidadInicial = async (
    id_inventario: number,
    id_articulo: number,
    id_lote: number,
    cantidad: number
  ) => {
    if (inventarioSeleccionado?.id === undefined) {
      toast({
        title: "Error",
        description:
          "No se puede editar cantidad inicial sin un inventario seleccionado",
        status: "error",
      });
      return;
    }
    try {
      await axios.post(`${api_url}inventarios/actualizar-cantidad-inicial`, {
        id_inventario,
        id_articulo,
        id_lote,
        cantidad,
      });

      toast({
        title: "Cantidad inicial editada",
        description: "La cantidad inicial ha sido editada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getItemsEnInventario(inventarioSeleccionado?.id);
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje || "Error al editar cantidad inicial"
          : "Error inesperado al editar cantidad inicial";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("[editarCantidadInicial]:", error);
    }
  };

  const escanearItem = async (
    id_articulo: number,
    id_lote: number,
    cantidad: number,
    lote: string,
    codigo_barras: string,
    id_inventario: number
  ) => {
    if (inventarioSeleccionado?.id === undefined) {
      toast({
        title: "Error",
        description:
          "No se puede escanear un item sin un inventario seleccionado",
        status: "error",
      });
      return;
    }

    if (id_articulo === undefined) {
      toast({
        title: "Error",
        description:
          "No se puede escanear un item sin un articulo seleccionado",
        status: "error",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${api_url}inventarios/items/escanear`,
        {
          id_articulo,
          id_lote,
          cantidad,
          lote,
          codigo_barras,
          id_inventario,
        }
      );

      console.log(response);

      toast({
        title: "Item escaneado",
        description: "El item ha sido escaneado correctamente",
        status: "success",
      });

      getItemsEnInventario(inventarioSeleccionado?.id);
    } catch (error) {
      const errorMsg =
        error instanceof AxiosError
          ? error.response?.data?.mensaje || "Error al escanear item"
          : "Error inesperado al escanear item";

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
      });
      console.error("[escanearItem]:", error);
    }
  };

  async function handleCambiarCantidadScaneada(
    id_articulo: number,
    id_lote: number,
    cantidad: number,
    lote: string,
    codigo_barras: string,
    id_inventario: number
  ) {
    await escanearItem(
      id_articulo,
      id_lote,
      cantidad,
      lote,
      codigo_barras,
      id_inventario
    );
  }

  async function handleEditarCantidadInicial(
    id_articulo: number,
    id_lote: number,
    cantidad: number
  ) {
    await editarCantidadInicial(
      inventarioSeleccionado?.id || 0,
      id_articulo,
      id_lote,
      cantidad
    );
  }
  const totalInventariado = () => {
    const total = itemsEnInventario.filter(
      (item) =>
        item.cantidad_escaneada != null &&
        item.cantidad_escaneada != undefined &&
        item.cantidad_escaneada != 0
    ).length;
    return total;
  };

  const ResumenInventario = () => {
    if (!inventarioSeleccionado || inventarioSeleccionado?.id === undefined) {
      return null;
    }

    if (tipoInventario === "1") {
      return (
        <div className="flex flex-col  rounded-md p-2 gap-2 overflow-y-auto h-[100%]">
          <p className="text-xl font-bold">Categorias en inventario</p>
          {inventarioSeleccionado?.categorias?.map((categoria) => (
            <div
              key={categoria.id}
              className="flex flex-col gap-2 border  border-gray-300 rounded-md p-2"
            >
              <p className="text-lg font-bold">
                Descripcion: {categoria.descripcion}
              </p>
              <p className="text-lg font-bold">
                Total Items: {categoria.cantidad_items}
              </p>
            </div>
          )) || <p>No hay categorías disponibles</p>}
        </div>
      );
    }

    if (tipoInventario === "2") {
      return (
        <div className="flex flex-col border border-gray-300 rounded-md p-2">
          <p className="text-xl font-bold">Articulos en inventario</p>
          {inventarioSeleccionado?.articulos?.map((articulo) => (
            <div key={articulo.id} className="flex flex-row gap-2">
              <p>{articulo.descripcion}</p>
            </div>
          )) || <p>No hay artículos disponibles</p>}
        </div>
      );
    }

    if (tipoInventario === "3") {
      return (
        <div className="flex flex-col border border-gray-300 rounded-md p-2">
          <p className="text-xl font-bold">Ubicaciones en inventario</p>
          {inventarioSeleccionado?.ubicaciones?.map((ubicacion) => (
            <div key={ubicacion.id} className="flex flex-row gap-2">
              <p>{ubicacion.descripcion}</p>
              <p> Total Items:{ubicacion.cantidad_items}</p>
            </div>
          )) || <p>No hay ubicaciones disponibles</p>}
        </div>
      );
    }

    if (tipoInventario === "4") {
      return (
        <div className="flex flex-col border border-gray-300 rounded-md p-2">
          <p className="text-xl font-bold">Marcas en inventario</p>
          {inventarioSeleccionado?.marcas?.map((marca) => (
            <div key={marca.id} className="flex flex-row gap-2">
              <p>{marca.descripcion}</p>
              <p> Total Items:{marca.cantidad_items}</p>
            </div>
          )) || <p>No hay marcas disponibles</p>}
        </div>
      );
    }

    if (tipoInventario === "5") {
      return (
        <div className="flex flex-col border border-gray-300 rounded-md p-2">
          <p className="text-xl font-bold">Secciones en inventario</p>
          {inventarioSeleccionado?.secciones?.map((seccion) => (
            <div key={seccion.id} className="flex flex-row gap-2">
              <p>{seccion.descripcion}</p>
              <p> Total Items: {seccion.cantidad_items}</p>
            </div>
          )) || <p>No hay secciones disponibles</p>}
        </div>
      );
    }

    return null;
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
          <div className="flex flex-row gap-2 items-center relative">
            <FormLabel className="w-24">Nro. Inventario:</FormLabel>
            <div className="flex flex-row gap-2 items-center justify-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 font-medium rounded-full border border-gray-300">
                #{numeroInventarioBusqueda}
              </span>
              <Button colorScheme="blue" onClick={() => setIsListadoOpen(true)}>
                Ver Inventarios
              </Button>
            </div>
            <ListadoInventarios
              inventarios={inventarios}
              onSelect={handleSelectInventario}
              selectedInventario={inventarioSeleccionado}
              onSearch={handleBuscarInventario}
              isLoading={botonesLoading}
              isOpen={isListadoOpen}
              onClose={() => setIsListadoOpen(false)}
              onAnular={(inventario) => {
                setShowConfirmModal(true);
                setInventarioSeleccionado(inventario);
              }}
              onCerrar={(inventario) => {
                setInventarioSeleccionado(inventario);
                cerrarInventario(inventario.id);
              }}
              onCreate={() => {
                crearInventario();
              }}
            />
          </div>
        </div>
        <div className="flex flex-col  border border-gray-300 rounded-md p-2 bg-white">
          <FormLabel>Tipo de inventario</FormLabel>
          <RadioGroup
            className="flex flex-col gap-2 justify-start"
            onChange={(value: TipoInventario) => setTipoInventario(value)}
            value={tipoInventario}
          >
            <Radio value="1">Inventario por categoria</Radio>
            <Radio value="2">Inventario por articulo</Radio>
            <Radio value="3">Inventario por ubicación</Radio>
            <Radio value="4">Inventario por marca</Radio>
            <Radio value="5">Inventario por seccion</Radio>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="relative">
            <FormLabel>Articulo</FormLabel>
            <div className="flex flex-row gap-2">
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
              <button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={() => {}}
              >
                <Plus />
              </button>
            </div>
            <FloatingCard
              isVisible={isFloatingCardVisible}
              items={articulosDirecta || []}
              onClose={() => setIsFloatingCardVisible(false)}
              onSelect={handleArticuloSelect}
              renderItem={(item: ArticulosDirecta) => (
                <div className="flex flex-row gap-2">
                  <p className="font-bold text-blue-500">
                    {item.ar_cod_interno} -
                  </p>
                  <p>{item.ar_descripcion}</p>
                  <p className="font-bold text-blue-400">{item.al_codbarra}</p>
                </div>
              )}
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
          className={`flex flex-col  w-1/3 ${
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
                : tipoInventario === "5"
                ? "Secciones"
                : "Categorias"}
            </FormLabel>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full my-2 bg-gray-200 p-1 rounded-md outline-none"
              onChange={() => {}}
            />
          </div>
          <div className="flex flex-col gap-2 w-full overflow-y-auto h-[150px]">
            {TablaArticulos()}
          </div>
        </div>
        <div className="flex flex-col gap-2  justify-center">
          <Button colorScheme="orange" onClick={onOpenModal}>
            Generar reporte
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              insertarItemsEnInventario();
            }}
            isDisabled={
              inventarioSeleccionado?.estado != 0 ||
              inventarioSeleccionado?.estado === undefined ||
              inventarioSeleccionado?.estado === null
            }
          >
            {botonesLoading ? <Spinner size="sm" /> : "Agregar items"}
          </Button>
        </div>
      </div>
      <div className="flex flex-row w-full border border-gray-300 rounded-md bg-white h-[70%] p-1 gap-1">
        <div className="flex flex-col w-1/4 border border-gray-300 rounded-md bg-white h-full p-2 gap-2">
          <div className="flex flex-row gap-2 items-center">
            <div className="flex flex-col border border-gray-300 rounded-md p-2">
              <p className="text-xl font-bold">Total a inventariar</p>
              <h1 className="text-2xl font-bold text-blue-500 text-center">
                {itemsEnInventario.length}
              </h1>
            </div>
            <div className="flex flex-col border border-gray-300 rounded-md p-2">
              <p className="text-xl font-bold">Total inventariado</p>
              <h1 className="text-2xl font-bold text-blue-500 text-center">
                {totalInventariado()}
              </h1>
            </div>
            <div className="flex flex-col border border-gray-300 rounded-md p-2">
              <p className="text-xl font-bold">Diferencia</p>
              <h1 className="text-2xl font-bold text-blue-500 text-center">
                {itemsEnInventario.length - totalInventariado()}
              </h1>
            </div>
          </div>
          <div className="flex flex-col border border-gray-300 rounded-md p-2">
            <p className="text-xl font-bold">Porcentaje de inventario</p>
            <h1 className="text-2xl font-bold text-blue-500 text-center">
              {((totalInventariado() / itemsEnInventario.length) * 100).toFixed(
                1
              )}
              %
            </h1>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${
                    (totalInventariado() / itemsEnInventario.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col border border-gray-300 rounded-md p-2">
            <ResumenInventario />
          </div>
        </div>
        <div className="flex flex-col w-3/4 border border-gray-300 rounded-md bg-white h-[100%]">
          <div className="flex flex-row justify-between items-center px-4 py-2 ">
            <div className="flex items-center gap-2 p-2 bg-white  w-full">
              <input
                type="text"
                placeholder="Buscar items en el inventario..."
                value={busquedaItemsEnInventario}
                onChange={(e) => handleBusquedaArticulo(e.target.value)}
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              {busquedaItemsEnInventario && (
                <button
                  onClick={() => {
                    handleBusquedaArticulo("");
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <Button
              variant={"outline"}
              colorScheme="blue"
              onClick={() => {
                getItemsEnInventario(inventarioSeleccionado?.id || 0);
              }}
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
                      C. Inicial
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      C. Escaneada
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      C. Actual
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {itemsEnInventario.map((item) => (
                    <tr key={item.lote_id} className="border border-gray-300">
                      <td className="border border-gray-300 px-2 truncate">
                        {item.ubicacion} / {item.sub_ubicacion}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.cod_interno}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.cod_barra_articulo}
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
                      <td className="border border-gray-300 px-2 truncate">
                        {editandoCantidadInicial?.id === item.lote_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editandoCantidadInicial.value}
                              onChange={(e) =>
                                setEditandoCantidadInicial({
                                  ...editandoCantidadInicial,
                                  value: parseInt(e.target.value) || 0,
                                })
                              }
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditarCantidadInicial(
                                    item.articulo_id,
                                    item.lote_id,
                                    editandoCantidadInicial.value
                                  );
                                  setEditandoCantidadInicial(null);
                                } else if (e.key === "Escape") {
                                  setEditandoCantidadInicial(null);
                                }
                              }}
                            />
                            <button
                              className="text-gray-500 hover:text-gray-700 p-1"
                              onClick={() => setEditandoCantidadInicial(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                            onClick={() =>
                              setEditandoCantidadInicial({
                                id: item.lote_id,
                                value: item.cantidad_inicial || 0,
                              })
                            }
                          >
                            {item.cantidad_inicial || 0}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {editingItem?.id === item.lote_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingItem.value}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  value: parseInt(e.target.value) || 0,
                                })
                              }
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCambiarCantidadScaneada(
                                    item.articulo_id,
                                    item.lote_id,
                                    editingItem.value,
                                    item.lote,
                                    item.cod_barra,
                                    inventarioSeleccionado?.id || 0
                                  );
                                  setEditingItem(null);
                                } else if (e.key === "Escape") {
                                  setEditingItem(null);
                                }
                              }}
                            />
                            <button
                              className="text-gray-500 hover:text-gray-700 p-1"
                              onClick={() => setEditingItem(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                            onClick={() =>
                              setEditingItem({
                                id: item.lote_id,
                                value: item.cantidad_escaneada || 0,
                              })
                            }
                          >
                            {item.cantidad_escaneada || 0}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 truncate">
                        {item.cantidad_actual === null
                          ? "0"
                          : item.cantidad_actual}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          anularInventario();
        }}
        title="Confirmar accion"
        message="¿Estás seguro de querer anular el inventario?"
      />
      <Modal isOpen={isModalOpen} onClose={onCloseModal} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <p>Reporte de anomalias</p>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReporteAnomalias
              numeroInventario={inventarioSeleccionado?.nro_inventario || 0}
              sucursal={inventarioSeleccionado?.sucursal_id || 0}
              deposito={inventarioSeleccionado?.deposito_id || 0}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default TomaDeInventario;
