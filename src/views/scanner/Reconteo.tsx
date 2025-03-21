import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { api_url } from "../../utils";
import { useToast } from "@chakra-ui/react";
import {
  Menu,
  Grid,
  List,
  ScanIcon,
  ClipboardCheck,
  ChartColumn,
  ListStart,
  Camera,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import Auditar from "@/services/AuditoriaHook";

interface Articulo {
  ar_codigo: number;
  ar_codbarra: string;
  ar_descripcion: string;
  ar_pvg: number;
  ar_pcg: number;
  al_cantidad: number;
  al_codigo: number;
  al_vencimiento: string;
  ar_ubicacicion: number;
  ar_sububicacion: number;
  al_lote: string;
  ar_vencimiento: number;
  al_talle: string;
  al_color: string;
  cod_interno: string;
}

interface Deposito {
  dep_codigo: number;
  dep_descripcion: string;
  dep_principal: number;
  dep_inventario: number;
}

interface Sucursal {
  id: number;
  descripcion: string;
}

interface Ubicaciones {
  ub_codigo: number;
  ub_descripcion: string;
}

interface Sububicaciones {
  s_codigo: number;
  s_descripcion: string;
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

interface FloatingCardProps {
  inventarios: Array<{
    id: number;
    fecha: string;
    deposito: string;
    sucursal: string;
  }>;
  onSelect: (id_inventario: number, id: number) => void;
  onClose: () => void;
  onBuscarItems: (inventarioId: string, busqueda: string | null) => void;
}

const FloatingCard = ({
  inventarios,
  onSelect,
  onClose,
  onBuscarItems,
}: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className=" border border-gray-500 absolute right-16 top-full mt-2 bg-white rounded-lg shadow-lg w-72 z-50"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">
            Inventarios Disponibles
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {inventarios.length > 0 ? (
            <div className="space-y-2">
              {inventarios.map((inv: any) => (
                <button
                  key={inv.id_inventario}
                  onClick={() => {
                    onSelect(inv.id_inventario, inv.id);
                    // Realizar búsqueda inmediata al seleccionar inventario
                    onBuscarItems(String(inv.id), null);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">Inventario #{inv.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(inv.fecha).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Suc: {inv.sucursal}
                    </div>
                    <div className="text-sm text-gray-500">
                      Dep: {inv.deposito}
                    </div>
                  </div>
                  <ChartColumn size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No hay inventarios disponibles
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const InventarioScanner = () => {
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(true);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [depositoId, setDepositoId] = useState("");
  const [articuloBusqueda, setArticuloBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<Articulo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [deposito, setDeposito] = useState<Deposito | null>(null);
  const [existenciaActual, setExistenciaActual] = useState<string>("");
  const [existenciaFisica, setExistenciaFisica] = useState<string>("");
  const [vencimiento, setVencimiento] = useState("");
  const [lote, setLote] = useState("");
  const [codigoBarra, setCodigoBarra] = useState("");

  const [observaciones] = useState("");
  const [fecha] = useState(new Date().toISOString().split("T")[0]);
  const [ultimoNroInventario, setUltimoNroInventario] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicaciones[]>([]);
  const [sububicaciones, setSububicaciones] = useState<Sububicaciones[]>([]);
  const [ubicacion, setUbicacion] = useState<number | null>(null);
  const [sububicacion, setSububicacion] = useState<number | null>(null);
  const [prevVencimiento, setPrevVencimiento] = useState("");
  const [prevLote, setPrevLote] = useState("");
  const token = sessionStorage.getItem("token");
  const toast = useToast();
  const [showInventarioCard, setShowInventarioCard] = useState(false);
  const [, setStopStream] = useState(false);
  const [, setIsScanning] = useState(false);
  const [, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [inventariosDisponibles, setInventariosDisponibles] = useState<
    Array<{ id: number; fecha: string; deposito: string; sucursal: string, id_inventario: number }>
  >([]);
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState<
    { id_inventario: number, nro_inventario: number } | null
  >(null);

  const handleEditarArticulo = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);

    // Si estamos buscando por inventario, la estructura de datos es diferente
    if (buscarPorInventario) {
      setExistenciaActual("0"); // Iniciamos en 0 ya que no viene cantidad
      setExistenciaFisica("0");
      setVencimiento(formatearVencimiento(articulo.al_vencimiento));
      setPrevVencimiento(formatearVencimiento(articulo.al_vencimiento));
      setLote(articulo.al_lote || "");
      setPrevLote(articulo.al_lote || "");
      setCodigoBarra(articulo.ar_codbarra || "");
      setUbicacion(articulo.ar_ubicacicion || null);
      setSububicacion(articulo.ar_sububicacion || null);
    } else {
      const articuloVencimiento =
        formatearVencimiento(articulo.al_vencimiento) || "";
      const articuloLote = articulo.al_lote || "";
      setExistenciaActual(articulo.al_cantidad.toString());
      setExistenciaFisica(articulo.al_cantidad.toString());
      setVencimiento(articuloVencimiento);
      setPrevVencimiento(articuloVencimiento);
      setLote(articuloLote);
      setPrevLote(articuloLote);
      setCodigoBarra(articulo.ar_codbarra);
      setUbicacion(articulo.ar_ubicacicion);
      setSububicacion(articulo.ar_sububicacion);
    }
    setModalVisible(true);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  };

  const [buscarPorInventario, setBuscarPorInventario] = useState(false);

  useEffect(() => {
    const fetchSucursalesYDepositos = async () => {
      try {
        const [sucursalesRes, depositosRes, ubicacionesRes, sububicacionesRes] =
          await Promise.all([
            axios.get(`${api_url}sucursales/listar`),
            axios.get(`${api_url}depositos/`),
            axios.get(`${api_url}ubicaciones/`),
            axios.get(`${api_url}sububicaciones/`),
          ]);

        const sucursalesData = sucursalesRes.data;
        const depositosData = depositosRes.data;
        const ubicacionesData = ubicacionesRes.data;
        const sububicacionesData = sububicacionesRes.data;

        setSucursales(sucursalesData.body || []);
        setDepositos(depositosData.body || []);
        setUbicaciones(ubicacionesData.body || []);
        setSububicaciones(sububicacionesData.body || []);
        const defaultDeposito = depositosData.body[0];
        if (defaultDeposito) {
          setDeposito(defaultDeposito);
          setDepositoId(String(defaultDeposito.dep_codigo));
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchSucursalesYDepositos();
  }, []);

  // Nuevo useEffect separado que depende del depositoId
  useEffect(() => {
    const fetchInventariosDisponibles = async () => {
      if (!depositoId) return; // No ejecutar si no hay depositoId

      try {
        const response = await axios.get(
          `${api_url}articulos/inventarios-disponibles`
        );
        const data = response.data;
        console.log(data.body);
        setInventariosDisponibles(data.body || []);
      } catch (error) {
        console.error("Error al cargar inventarios:", error);
      }
    };

    fetchInventariosDisponibles();
  }, [depositoId]);

  useEffect(() => {
    const traerIdUltimoInventario = async () => {
      try {
        const response = await axios.get(
          `${api_url}articulos/ultimo-nro-inventario`,
          {
            params: {
              deposito: depositoId,
            },
          }
        );
        const data = response.data;

        if (data.body && data.body.length > 0) {
          setUltimoNroInventario(data.body[0].nro_inventario);
          console.log(data.body[0].nro_inventario);
        }
      } catch (error) {
        console.error("Error al obtener último número de inventario:", error);
      }
    };

    traerIdUltimoInventario();
  }, [token]);

  const buscarArticuloPorCodigo = async (codigo: string) => {
    if (codigo.length === 0) {
      setArticulos([]);
      return;
    }

    try {
      const codigoLimpio = codigo.startsWith("0")
        ? codigo.substring(1)
        : codigo;

      const queryParams = new URLSearchParams({
        buscar: codigoLimpio,
        id_deposito: depositoId,
      });

      const response = await axios.get(`${api_url}articulos?${queryParams}`);
      const data = response.data;

      if (!data || !Array.isArray(data.body)) {
        if (codigo !== codigoLimpio) {
          const queryParamsOriginal = new URLSearchParams({
            buscar: codigo,
            id_deposito: depositoId,
          });

          const responseOriginal = await axios.get(
            `${api_url}articulos?${queryParamsOriginal}`
          );

          const dataOriginal = responseOriginal.data;
          if (dataOriginal && Array.isArray(dataOriginal.body)) {
            setArticulos(dataOriginal.body);
            return;
          }
        }
        throw new Error("Respuesta del servidor en formato incorrecto");
      }

      setArticulos(data.body);
      console.log(data.body);
    } catch (error) {
      console.error("Error al buscar artículos:", error);
      toast({
        title: "Error al buscar artículos",
        description: "Por favor, inténtelo de nuevo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setArticulos([]);
    }
  };

  const handleBusqueda = (texto: string) => {
    // Eliminar el 0 inicial si existe
    const textoLimpio = texto.startsWith("0") ? texto.substring(1) : texto;

    setArticuloBusqueda(textoLimpio);
    if (!textoLimpio || textoLimpio.trim() === "") {
      setArticulos([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (buscarPorInventario && inventarioSeleccionado) {
        // Asegurarse de que se pase el inventarioSeleccionado
        buscarItemsPorInventario(String(inventarioSeleccionado.nro_inventario), textoLimpio);
      } else {
        buscarArticuloPorCodigo(textoLimpio);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const formatearVencimiento = (vencimiento: string) => {
    const date = new Date(vencimiento);
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0"); // Meses van de 0 a 11
    const dia = String(date.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}ubicaciones/`);
      const data = response.data;
      setUbicaciones(data.body || []);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
    }
  };

  const fetchSububicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}sububicaciones`);
      const data = response.data;
      setSububicaciones(data.body || []);
    } catch (error) {
      console.error("Error al obtener sububicaciones:", error);
    }
  };

  useEffect(() => {
    console.log(inventarioSeleccionado);
  }, [inventarioSeleccionado]);

  useEffect(() => {
    fetchUbicaciones();
    fetchSububicaciones();
  }, [token]);

  const getUbicacionCodigo = (ubicacion: any): number => {
    // Si es un objeto con ub_codigo
    if (typeof ubicacion === "object" && ubicacion.ub_codigo) {
      return Number(ubicacion.ub_codigo);
    }

    // Si es un string o número
    const codigo = Number(ubicacion);
    return isNaN(codigo) ? 0 : codigo;
  };

  const cargarItemInventario = async () => {
    try {
      if (!articuloSeleccionado) {
        toast({
          title: "No hay artículos para cargar",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (articuloSeleccionado?.ar_vencimiento === 1 && !vencimiento) {
        toast({
          title: "Debe seleccionar una fecha de vencimiento",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!ubicacion) {
        toast({
          title: "Debe seleccionar una ubicación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!sububicacion) {
        toast({
          title: "Debe seleccionar una sububicación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (articuloSeleccionado?.ar_vencimiento === 1 && !lote) {
        toast({
          title: "Debe determinar un lote",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (prevVencimiento !== vencimiento && prevLote === lote) {
        toast({
          title:
            "Debe cambiar el número de lote si cambia la fecha de vencimiento",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const inventarioData = {
        inventario: {
          fecha,
          hora: new Date().toLocaleTimeString().slice(0, 5),
          operador: localStorage.getItem("user_id") || 1,
          sucursal: sucursal?.id || 1,
          deposito: depositoId,
          tipo: 1,
          estado: 1,
          in_obs: observaciones || "",
          nro_inventario: ultimoNroInventario,
        },
        inventario_items: [
          {
            idArticulo: articuloSeleccionado.ar_codigo,
            idLote: articuloSeleccionado.al_codigo,
            cantidad: Number(existenciaFisica),
            costo: articuloSeleccionado.ar_pcg,
            stock_actual: Number(existenciaActual),
            stock_dif: Number(existenciaFisica) - Number(existenciaActual),
            codbarra: codigoBarra || "",
            ubicacion: getUbicacionCodigo(ubicacion),
            sububicacion: sububicacion,
            control_vencimiento: articuloSeleccionado?.ar_vencimiento,
            vencimientos: [
              {
                lote: lote || "SIN LOTE",
                fecha_vence: formatearVencimiento(vencimiento),
                loteid: String(lote) || 0,
              },
            ],
          },
        ],
      };

      console.log(inventarioData);

      if (articuloSeleccionado?.ar_vencimiento === 1) {
        await axios.post(
          `${api_url}articulos/agregar-item-inventario`,
          inventarioData
        );
      } else {
        await axios.post(
          `${api_url}articulos/agregar-item-inventario-con-vencimiento`,
          inventarioData
        );
      }
      setModalVisible(false);
      toast({
        title: "El inventario se cargó satisfactoriamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (articulos.length < 2) {
        setArticuloBusqueda("");
        setArticulos([]);
        searchInputRef.current?.focus();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al cargar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const buscarItemsPorInventario = async (
    inventario: string,
    busqueda: string | null = null
  ) => {
    try {
      const response = await axios.get(
        `${api_url}articulos/mostrar-items-inventario-auxiliar`,
        {
          params: {
            id: inventario,
            id_inventario: inventarioSeleccionado?.id_inventario,
            buscar: busqueda,
            deposito: depositoId,
          },
        }
      );
      const data = response.data;
      console.log("Datos del inventario:", data.body);
      setArticulos(data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const scannearItemInventarioAuxiliar = async () => {
    try {
      await axios.post(
        `${api_url}articulos/scannear-item-inventario-auxiliar`,
        {
          id_articulo: articuloSeleccionado?.ar_codigo,
          id_lote: articuloSeleccionado?.al_codigo,
          cantidad: Number(existenciaFisica),
          lote: lote,
          codigo_barras: codigoBarra,
          id_inventario: inventarioSeleccionado?.id_inventario,
        }
      );
      toast({
        title: "Item cargado correctamente",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
      Auditar(
        1,
        1,
        articuloSeleccionado?.al_codigo ||
          articuloSeleccionado?.ar_codigo ||
          null,
        Number(localStorage.getItem("user_id") || 1),
        "Scanneo un item del inventario con la app"
      );
      setModalVisible(false);
      if (articuloBusqueda) {
        handleBusqueda(articuloBusqueda);
        setArticuloBusqueda("");
        setArticulos([]);
        searchInputRef.current?.focus();
      } else if (inventarioSeleccionado) {

        buscarItemsPorInventario(String(inventarioSeleccionado));
        setArticuloBusqueda("");
        setArticulos([]);
        searchInputRef.current?.focus();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al scannear el item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const cargarInventario = async () => {
    try {
      const inventarioData = {
        inventario: {
          fecha,
          hora: new Date().toLocaleTimeString().slice(0, 5),
          operador: localStorage.getItem("user_id") || 1,
          sucursal: sucursal?.id || 1,
          deposito: depositoId,
          tipo: 1,
          estado: 1,
          in_obs: observaciones || "",
          nro_inventario: ultimoNroInventario,
          inicio_fecha_reconteo: "0001-01-01",
        },
      };
      console.log(inventarioData);
      await axios.post(
        `${api_url}articulos/agregar-inventario`,
        inventarioData
      );
      Auditar(
        1,
        1,
        articuloSeleccionado?.al_codigo ||
          articuloSeleccionado?.ar_codigo ||
          null,
        Number(localStorage.getItem("user_id") || 1),
        "Scanneo un item del inventario con la app"
      );
      setModalVisible(false);
      toast({
        title: "El inventario se cargó satisfactoriamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setArticuloBusqueda("");
      setArticulos([]);
      searchInputRef.current?.focus();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al cargar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };



  const Tooltip = ({ text, children, position = "top" }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
      top: {
        tooltip: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        arrow: "-bottom-1 left-1/2 -translate-x-1/2",
      },
      bottom: {
        tooltip: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        arrow: "-top-1 left-1/2 -translate-x-1/2 rotate-180",
      },
      left: {
        tooltip: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        arrow: "-right-1 top-1/2 -translate-y-1/2 rotate-90",
      },
      right: {
        tooltip: "left-full top-1/2 transform -translate-y-1/2 ml-2",
        arrow: "-left-1 top-1/2 -translate-y-1/2 -rotate-90",
      },
    };

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onTouchStart={() => setIsVisible(true)}
          onTouchEnd={() => setIsVisible(false)}
        >
          {children}
        </div>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap ${positionClasses[position].tooltip}`}
            >
              {text}
              <div
                className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${positionClasses[position].arrow}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(videoDevices);

      // Seleccionar la primera cámara por defecto
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting cameras:", error);
    }
  };

  const activateScanner = async () => {
    await getCameras();
    setIsScanning(true);
    setStopStream(false);
  };

  const handleEnterCantidad = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (buscarPorInventario) {
        scannearItemInventarioAuxiliar();
      } else {
        cargarItemInventario();
      }
    }
  };

  useEffect(() => {
    if (modalVisible && cantidadInputRef.current) {
      cantidadInputRef.current.focus();
    }
  }, [modalVisible]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header Fijo */}
      <div className="bg-[#0455c1] rounded-b-3xl pb-4 z-2">
        <div className="flex  justify-between items-center px-4 pt-2 pb-4">
          <div className="flex items-start gap-4 flex-col">
            <h1 className="text-white text-xl font-bold">Toma de Inventario</h1>
            <h2 className="text-white text-xs font-medium">
              {deposito?.dep_descripcion} - Inventario Nro:{" "}
              {inventarioSeleccionado?.nro_inventario}
            </h2>
          </div>
          <div className="flex gap-2">
            <Tooltip
              text={
                buscarPorInventario
                  ? "Buscar por articulo"
                  : "Buscar por inventario"
              }
              position="left"
            >
              <button
                onClick={() => setBuscarPorInventario(!buscarPorInventario)}
                className={` p-2 rounded ${
                  buscarPorInventario ? "bg-white" : "bg-white/20"
                }`}
              >
                <ClipboardCheck
                  size={20}
                  color={buscarPorInventario ? "#0455c1" : "white"}
                />
              </button>
            </Tooltip>
            <Tooltip text="Cambiar vista" position="left">
              <button
                onClick={() => setIsGridView(!isGridView)}
                className="bg-white/20 p-2 rounded"
              >
                {isGridView ? (
                  <Grid size={20} color="white" />
                ) : (
                  <List size={20} color="white" />
                )}
              </button>
            </Tooltip>
            <button
              className="bg-white/20 p-2 rounded"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 flex flex-row w-full justify-center items-center gap-4">
          <div className="flex items-center bg-white rounded-lg w-full">
            <input
              ref={searchInputRef}
              type="text"
              inputMode="text"
              placeholder="Buscar producto por nombre o codigo"
              className="flex-1 p-3 rounded-lg"
              value={articuloBusqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              onClick={handleInputClick}
            />
            <button
              onClick={activateScanner}
              className="p-3 text-gray-500 hover:text-gray-700 flex items-center justify-center"
              title="Escanear código de barras"
            >
              <Camera size={24} /> {/* O el ScanIcon que estés usando */}
            </button>
          </div>
          {buscarPorInventario && (
            <div className="relative">
              <button
                className="bg-blue-500 p-2 rounded-lg text-white"
                onClick={() => setShowInventarioCard(!showInventarioCard)}
              >
                <ListStart size={20} color="white" />
              </button>
              <AnimatePresence>
                {showInventarioCard && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowInventarioCard(false)}
                    />
                    <FloatingCard
                      inventarios={inventariosDisponibles}
                      onSelect={(id_inventario, id) => {
                        setInventarioSeleccionado({ id_inventario, nro_inventario: Number(id) });
                        buscarItemsPorInventario(String(id));
                        setShowInventarioCard(false);
                      }}
                      onClose={() => setShowInventarioCard(false)}
                      onBuscarItems={buscarItemsPorInventario}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      {/* Lista de artículos con scroll - Ajustamos las clases */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {articulos.length > 0 ? (
            <motion.div
              className={`grid ${
                isGridView ? "grid-cols-2" : "grid-cols-1"
              } gap-4`}
              layout
            >
              {articulos.map((item) => (
                <motion.div
                  key={item.al_codigo}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleEditarArticulo(item)}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer"
                >
                  <p className="text-md text-gray-500 font-semibold">
                    Lote: {item.al_lote || "N/A"}
                  </p>
                  <p className="text-md text-gray-500 font-semibold">
                    Cod. Barras: {item.ar_codbarra}
                  </p>
                  <p className="text-md text-gray-500">
                    Cod. Ref: {item.cod_interno}
                  </p>
                  <p className="font-bold my-1">{item.ar_descripcion}</p>
                  <p className="text-sm text-blue-500">
                    {
                      ubicaciones.find(
                        (ubicacion) =>
                          ubicacion.ub_codigo === Number(item.ar_ubicacicion)
                      )?.ub_descripcion
                    }{" "}
                    -{" "}
                    {
                      sububicaciones.find(
                        (sububicacion) =>
                          sububicacion.s_codigo === Number(item.ar_sububicacion)
                      )?.s_descripcion
                    }
                  </p>
                  <p className="text-sm text-gray-500"> {vencimiento} </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            articuloBusqueda && (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">
                  No se encontraron artículos
                </p>
                <p className="text-sm">Intente con otro código o descripción</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Drawer con animación */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-center mb-4 items-center w-full gap-4">
                  <button
                    className="bg-blue-500 p-2 rounded-md text-white font-semibold"
                    onClick={cargarInventario}
                  >
                    Iniciar Inventario Nuevo
                  </button>
                </div>
                <h2 className="text-xl font-bold mb-6">Módulos</h2>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate("/inventario-scanner");
                      }}
                      className="flex items-center gap-2 w-full text-gray-600 hover:text-gray-900"
                    >
                      <ScanIcon size={20} />
                      <span>Toma de inventario</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate("/reconteo-scanner");
                      }}
                      className="flex items-center gap-2 w-full text-gray-600 hover:text-gray-900"
                    >
                      <ClipboardCheck />
                      <span>Reconteo de inventario</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate("/reporte-scanner");
                      }}
                      className="flex items-center gap-2 w-full text-gray-600 hover:text-gray-900"
                    >
                      <ChartColumn />
                      <span>Reporte de inventario</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-6">Ajustes</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sucursal
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={sucursal?.id || ""}
                      onChange={(e) => {
                        const selected = sucursales.find(
                          (s) => s.id === Number(e.target.value)
                        );
                        setSucursal(selected || null);
                      }}
                    >
                      {sucursales.map((suc) => (
                        <option key={suc.id} value={suc.id}>
                          {suc.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Depósito
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={deposito?.dep_codigo || ""}
                      onChange={(e) => {
                        const selected = depositos.find(
                          (d) => d.dep_codigo === Number(e.target.value)
                        );
                        setDeposito(selected || null);
                        if (selected)
                          setDepositoId(String(selected.dep_codigo));
                      }}
                    >
                      {depositos.map((dep) => (
                        <option key={dep.dep_codigo} value={dep.dep_codigo}>
                          {dep.dep_descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Edición */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Lote: {articuloSeleccionado?.al_lote}
                </h2>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Cod. Ref:</p>
                <div className="flex space-x-14">
                  <p className="font-bold">
                    {articuloSeleccionado?.cod_interno}
                  </p>
                  <p className="text-lg">
                    {articuloSeleccionado?.ar_descripcion}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exist. Actual
                  </label>
                  <input
                    type="number"
                    disabled
                    className="w-full p-2 border rounded"
                    value={existenciaActual}
                    onChange={(e) => setExistenciaActual(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exist. Física
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={existenciaFisica}
                    onChange={(e) => setExistenciaFisica(e.target.value)}
                    onKeyDown={handleEnterCantidad}
                    ref={cantidadInputRef}
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Vencimiento
                  </label>
                  <input
                    type={
                      articuloSeleccionado?.ar_vencimiento === 1
                        ? "date"
                        : "text"
                    }
                    className="w-full p-2 border rounded"
                    value={
                      articuloSeleccionado?.ar_vencimiento === 1
                        ? vencimiento
                        : formatearVencimiento(
                            articuloSeleccionado?.al_vencimiento || "0001-01-01"
                          )
                    }
                    disabled={articuloSeleccionado?.ar_vencimiento === 0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicacion
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={ubicacion || ""}
                    onChange={(e) => setUbicacion(Number(e.target.value))}
                  >
                    {ubicaciones.map((ub: Ubicaciones) => (
                      <option key={ub.ub_codigo} value={ub.ub_codigo}>
                        {ub.ub_descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sububicacion
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={sububicacion || ""}
                    onChange={(e) => setSububicacion(Number(e.target.value))}
                  >
                    {sububicaciones.map((sub) => (
                      <option key={sub.s_codigo} value={sub.s_codigo}>
                        {sub.s_descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-row gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lote
                  </label>
                  <input
                    placeholder={
                      articuloSeleccionado?.ar_vencimiento === 1
                        ? "Solo p/ lote nuevo"
                        : ""
                    }
                    type="text"
                    className="w-full p-2 border rounded"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    disabled={articuloSeleccionado?.ar_vencimiento === 0}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de barras
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={codigoBarra}
                    onChange={(e) => setCodigoBarra(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={
                  buscarPorInventario === true
                    ? scannearItemInventarioAuxiliar
                    : cargarItemInventario
                }
                className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default InventarioScanner;
