import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { api_url } from "../../utils";
import { useToast } from "@chakra-ui/react";
import { Menu, Grid, List, ChartColumn, ListStart } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import BusquedaPreparador from "./ui/BusquedaPreparador";
import CortePedido from "./ui/CortePedido";
import { useCambiarLote } from "@/shared/hooks/mutations/pedidos";
import { useGetLotesArticulo } from "@/shared/hooks/querys/articulos/articulos";
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
  id_detalle: number;
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
  pedidos: Array<{
    id_pedido: number;
    fecha?: string;
    deposito?: string;
    cliente?: string;
  }>;
  onSelect: (id: number) => void;
  onClose: () => void;
  onBuscarItems: (inventarioId: string, busqueda: string | null) => void;
}

// interface DetalleFaltante {
//   d_detalle_pedido: number;
//   d_cantidad: number;
// }

const FloatingCard = ({
  pedidos,
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
          <h3 className="font-semibold text-gray-700">Pedidos Disponibles</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {pedidos.length > 0 ? (
            <div className="space-y-2">
              {pedidos.map((pedido: any) => (
                <button
                  key={pedido.id_pedido}
                  onClick={() => {
                    onSelect(pedido.id_pedido);
                    onBuscarItems(String(pedido.id_pedido), null);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      Pedido #{pedido.id_pedido}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.fecha}
                      <p className="text-xs font-thin">{pedido.cliente}</p>
                    </div>
                  </div>
                  <ChartColumn size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No hay pedidos disponibles
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface Preparador {
  op_codigo: number;
  op_nombre: string;
}

const VerificacionPedidos = () => {
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicaciones[]>([]);
  const [sububicaciones, setSububicaciones] = useState<Sububicaciones[]>([]);
  const toast = useToast();
  const [showPedidosCard, setShowPedidosCard] = useState(false);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<
    Array<{
      id_pedido: number;
      fecha?: string;
      deposito?: string;
      cliente?: string;
      preparado_por?: number;
    }>
  >([]);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState<string | null>(null);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<
    (typeof pedidosDisponibles)[number] | null
  >(null);

  const [showCajasModal, setShowCajasModal] = useState(false);
  const [numeroCajas, setNumeroCajas] = useState<number>(1);
  const [, setTodosItemsVerificados] = useState(false);

  const [preparadores, setPreparadores] = useState<Preparador[]>([]);
  const [preparadorSeleccionado, setPreparadorSeleccionado] =
    useState<Preparador | null>(null);
  const [isBusquedaPreparadorOpen, setIsBusquedaPreparadorOpen] =
    useState(false);
  const [isLoadingPreparadores, setIsLoadingPreparadores] = useState(false);

  const [mostrarCortePedido, setMostrarCortePedido] = useState(false);

  const buscarPreparadores = async (busqueda: string) => {
    try {
      setIsLoadingPreparadores(true);
      const response = await axios.get(`${api_url}usuarios/`, {
        params: {
          buscar: busqueda,
        },
      });
      setPreparadores(response.data.body || []);
    } catch (error) {
      console.error("Error al buscar preparadores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los preparadores",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPreparadores(false);
    }
  };

  const establecerPreparadorPedido = async (preparador: Preparador) => {
    try {
      if (!pedidoSeleccionado) {
        toast({
          title: "Error",
          description: "No se seleccionó ningún pedido",
          status: "error",
          duration: 3000,
        });
        return;
      }

      await axios.post(`${api_url}pedidos/iniciar-preparacion-pedido`, {
        pedido_ids: [pedidoSeleccionado?.id_pedido],
        preparado_por: preparador.op_codigo,
      });

      toast({
        title: "Preparador establecido",
        description: "El preparador ha sido establecido correctamente",
        status: "success",
        duration: 3000,
      });

      setIsBusquedaPreparadorOpen(false);
    } catch (error) {
      console.error("Error al establecer el preparador:", error);
      toast({
        title: "Error al establecer el preparador",
        description: "Por favor, inténtelo de nuevo",
        status: "error",
        duration: 3000,
      });
      setIsBusquedaPreparadorOpen(true);
    }
  };

  useEffect(() => {
    if (pedidoSeleccionado && preparadorSeleccionado) {
      establecerPreparadorPedido(preparadorSeleccionado);
    }
  }, [pedidoSeleccionado, preparadorSeleccionado]);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const fetchSucursalesYDepositos = async () => {
      try {
        const [sucursalesRes, depositosRes] = await Promise.all([
          axios.get(`${api_url}sucursales/listar`),
          axios.get(`${api_url}depositos/`),
        ]);

        const sucursalesData = sucursalesRes.data;
        const depositosData = depositosRes.data;

        setSucursales(sucursalesData.body || []);
        setDepositos(depositosData.body || []);

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
    setArticuloBusqueda(texto);
    if (!texto || texto.trim() === "") {
      setArticulos([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      if (pedidoSeleccionado) {
        buscarItemsPorPedido(String(pedidoSeleccionado), texto);
      } else {
        buscarArticuloPorCodigo(texto);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const buscarItemsPorPedido = async (
    pedido: string,
    texto: string | null = null
  ) => {
    try {
      const response = await axios.get(
        `${api_url}pedidos/traer-items-por-pedido`,
        {
          params: {
            id: pedido,
            buscar: texto,
            deposito: depositoId,
          },
        }
      );
      const data = response.data;
      console.log("Datos del pedido:", data.body);
      setArticulos(data.body);

      if (data.body.length === 0) {
        verificarTodosLosItems();
      }
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

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    setLoteSeleccionado(articulo.al_lote);
    setModalVisible(true);
  };

  const formatearVencimiento = (vencimiento: string) => {
    const date = new Date(vencimiento);
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
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

  const getPedidosDisponibles = async () => {
    try {
      const response = await axios.get(
        `${api_url}pedidos/traer-pedidos-disponibles`,
        {
          params: {
            deposito_id: depositoId,
          },
        }
      );
      const data = response.data;
      setPedidosDisponibles(data.body || []);
    } catch (error) {
      console.error("Error al obtener pedidos disponibles:", error);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
    fetchSububicaciones();
    getPedidosDisponibles();
  }, []);

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

  const cargarArticulos = async () => {
    try {
      console.log("iniciando funcion cargarArticulos");
      await axios.post(`${api_url}pedidos/cargar-pedido-preparado`, {
        pedidoId: articuloSeleccionado?.id_detalle,
        cantidad: cantidad,
      });

      // Cerramos el modal de verificación
      setModalVisible(false);

      // Actualizamos los artículos y verificamos si era el último
      setArticulos((prevArticulos) => {
        // Filtramos el artículo actual
        const nuevosArticulos = prevArticulos.filter(
          (art) => art.id_detalle !== articuloSeleccionado?.id_detalle
        );

        // Si no quedan más artículos, mostramos el modal de cajas
        if (nuevosArticulos.length === 0) {
          setTodosItemsVerificados(true);
          setShowCajasModal(true);
          toast({
            title: "Pedido Completo",
            description: "Todos los items han sido verificados correctamente",
            status: "success",
            duration: 3000,
          });
        }

        return nuevosArticulos;
      });
      // Limpiamos los estados
      setArticuloSeleccionado(null);
      setCantidad(null);
    } catch (error) {
      console.error("Error al cargar articulos:", error);
      toast({
        title: "Error al cargar articulos",
        description: "Por favor, inténtelo de nuevo",
        status: "error",
        duration: 3000,
      });
    }
  };

  const verificarTodosLosItems = () => {
    const todosVerificados = articulos.length === 0;
    console.log("todosVerificados", todosVerificados);
    console.log("articulos", articulos.length);
    if (todosVerificados) {
      console.log("todos los items fueron verificados");
      setTodosItemsVerificados(true);
      setShowCajasModal(true);
      toast({
        title: "Pedido Completo",
        description: "Todos los items han sido verificados correctamente",
        status: "success",
        duration: 3000,
      });
    }
  };

  const enviarInformacionCajas = async () => {
    try {
      await axios.post(`${api_url}pedidos/registrar-cajas`, {
        pedidoId: pedidoSeleccionado?.id_pedido,
        numeroCajas: numeroCajas,
        verificadoPor: sessionStorage.getItem("user_id"),
      });
      toast({
        title: "Éxito",
        description: "La información de cajas se ha registrado correctamente",
        status: "success",
        duration: 3000,
      });
      getPedidosDisponibles();
      setShowCajasModal(false);
      setPedidoSeleccionado(null);
      setArticulos([]);
      setTodosItemsVerificados(false);
      setNumeroCajas(1);
    } catch (error) {
      console.error("Error al registrar cajas:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la información de cajas",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAceptar = () => {
    const cantidadIngresada = Number(cantidad);
    const cantidadArticulo = Number(articuloSeleccionado?.al_cantidad);

    if (cantidadIngresada === cantidadArticulo) {
      toast({
        title: "Cantidad correcta",
        description: "La cantidad ingresada coincide con la cantidad del artículo",
        status: "success",
        duration: 3000,
      });
      cargarArticulos();
    } else if (cantidadIngresada < cantidadArticulo) {
      // Mostrar el modal de corte de pedido
      setMostrarCortePedido(true);
    } else {
      toast({
        title: "Cantidad incorrecta",
        description: "La cantidad ingresada es mayor a la cantidad del artículo",
        status: "error",
        duration: 3000,
      });
    }
  };

  const { mutate: cambiarLote } = useCambiarLote();
  
  const { data: lotesArticulo, isLoading: isLoadingLotes } = useGetLotesArticulo(articuloSeleccionado?.ar_codigo || 0);

  const lotesFiltrados = lotesArticulo?.filter((lote: any) => lote.alDeposito === deposito?.dep_codigo && lote.alCantidad > 0)

  const handleCambiarLote = (idDetallePedido: number, lote: string, idLote: number) => {
    if(!pedidoSeleccionado?.id_pedido) return;
    cambiarLote({
      idDetallePedido,
      lote,
      idLote
    });
    Auditar(1, 1, pedidoSeleccionado?.id_pedido, Number(sessionStorage.getItem("user_id")), "Cambio de lote desde el verificador de pedidos");
    toast({
      title: "Success",
      description: "Lote cambiado correctamente",
      status: "success",
    });
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header Fijo */}
      <div className="bg-[#0455c1] rounded-b-3xl pb-4 z-2">
        <div className="flex  justify-between items-center px-4 pt-2 pb-4">
          <div className="flex items-start gap-4 flex-col">
            <h1 className="text-white text-xl font-bold">
              Verificacion de Pedidos
            </h1>
            <h2 className="text-white text-xs font-medium">
              {deposito?.dep_descripcion} - Pedido Nro:{" "}
              {pedidoSeleccionado?.id_pedido || "N/A"}
            </h2>
          </div>
          <div className="flex gap-2">
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
          </div>
          <div className="relative">
            <button
              className="bg-blue-500 p-2 rounded-lg text-white"
              onClick={() => setShowPedidosCard(!showPedidosCard)}
            >
              <ListStart size={20} color="white" />
            </button>
            <AnimatePresence>
              {showPedidosCard && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPedidosCard(false)}
                  />
                  <FloatingCard
                    pedidos={pedidosDisponibles}
                    onSelect={(id) => {
                      setPedidoSeleccionado({
                        id_pedido: id,
                        fecha: "",
                        deposito: "",
                        cliente: "",
                        preparado_por: 0,
                      });
                      buscarItemsPorPedido(String(id));
                      setShowPedidosCard(false);
                      // ####IMPORTANTE: DESCOMENTAR EN PRODUCCION ####
                      // if (pedidoSeleccionado?.preparado_por) {
                      //   setIsBusquedaPreparadorOpen(true);
                      // }
                      setIsBusquedaPreparadorOpen(true);
                    }}
                    onClose={() => setShowPedidosCard(false)}
                    onBuscarItems={buscarItemsPorPedido}
                  />
                </>
              )}
            </AnimatePresence>
          </div>
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
                  onClick={() => handleSeleccionarArticulo(item)}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer"
                >
                  <p className="text-xs text-gray-500">
                    Cod. Barras: {item.ar_codbarra}
                  </p>
                  <p className="text-xs text-gray-500">Lote: {item.al_lote}</p>
                  <p className="text-xs text-gray-500">
                    Vto.: {formatearVencimiento(item.al_vencimiento)}
                  </p>
                  <p className="font-bold my-1">{item.ar_descripcion}</p>
                  <p className="text-sm text-blue-500">
                    {
                      ubicaciones.find(
                        (ubicacion) =>
                          ubicacion.ub_codigo === item.ar_ubicacicion
                      )?.ub_descripcion
                    }{" "}
                    -{" "}
                    {
                      sububicaciones.find(
                        (sub) => sub.s_codigo === item.ar_sububicacion
                      )?.s_descripcion
                    }
                  </p>
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
                <p className="text-sm text-gray-500">
                  Pedido nro: {pedidoSeleccionado?.id_pedido}
                </p>
                <div className="flex space-x-14">
                  <p className="font-bold">{articuloSeleccionado?.ar_codigo}</p>
                  <p className="text-lg">
                    {articuloSeleccionado?.ar_descripcion}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-row gap-2 items-center justify-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full p-2 border rounded"
                    value={cantidad === null ? "" : cantidad}
                    onChange={(e) => setCantidad(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Vencimiento
                </label>
                <input
                  type={
                    articuloSeleccionado?.ar_vencimiento === 1 ? "date" : "text"
                  }
                  className="w-full p-2 border rounded"
                  value={formatearVencimiento(
                    articuloSeleccionado?.al_vencimiento || ""
                  )}
                  disabled={true}
                />
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lote
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={loteSeleccionado || ''}
                    disabled={isLoadingLotes}
                    onChange={(e) => {
                      const loteSeleccionado = e.target.value;
                      setLoteSeleccionado(loteSeleccionado);
                      
                      // Encontrar el lote seleccionado para obtener su código
                      const loteEncontrado = lotesFiltrados?.find((lote: any) => lote.alLote === loteSeleccionado);
                      const codigoLote = loteEncontrado?.alCodigo || 0;
                      
                      handleCambiarLote(articuloSeleccionado?.id_detalle || 0, loteSeleccionado, codigoLote);
                    }}
                  >
                    {isLoadingLotes ? (
                      <option value="">Cargando lotes...</option>
                    ) : lotesFiltrados && lotesFiltrados.length > 0 ? (
                      lotesFiltrados.map((lote: any) => (
                        <option key={lote.alCodigo} value={lote.alLote}>{lote.alLote} <span className="text-xs text-gray-300">({lote.alCantidad})</span></option>
                      ))
                    ) : (
                      <option value="">No hay lotes disponibles</option>
                    )}
                  </select>
                </div>
              </div>
              <button
                onClick={() => handleAceptar()}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-600"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {showCajasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-96 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Información de Empaque</h2>
              <button
                onClick={() => setShowCajasModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cajas
              </label>
              <input
                type="number"
                min="1"
                value={numeroCajas}
                onChange={(e) =>
                  setNumeroCajas(Math.max(1, parseInt(e.target.value)))
                }
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCajasModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={enviarInformacionCajas}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <BusquedaPreparador
        isOpen={isBusquedaPreparadorOpen}
        onClose={() => setIsBusquedaPreparadorOpen(false)}
        onSelect={(preparador) => {
          setPreparadorSeleccionado(preparador);
        }}
        items={preparadores}
        onSearch={buscarPreparadores}
        isLoading={isLoadingPreparadores}
        searchPlaceholder="Buscar preparador por nombre..."
      />
      {mostrarCortePedido && articuloSeleccionado && (
        <CortePedido
          id_detalle={articuloSeleccionado.id_detalle}
          cantidad={Number(articuloSeleccionado.al_cantidad) - Number(cantidad)}
          onClose={() => {
            setMostrarCortePedido(false);
            setModalVisible(false);
          }}
          onSuccess={() => {
            cargarArticulos();
          }}
        />
      )}
    </div>
  );
};

export default VerificacionPedidos;
