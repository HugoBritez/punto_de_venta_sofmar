import { useEffect, useRef, useState } from "react";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useDepositosStore } from "@/stores/depositosStore";
import { useMonedasStore } from "@/stores/monedasStore";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  useMediaQuery,
  useToast,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import {
  ArticuloBusqueda,
  Cliente,
  Deposito,
  ListaPrecios,
  Moneda,
  Sucursal,
} from "@/types/shared_interfaces";
import { Vendedor } from "@/types/shared_interfaces";
import {
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  Tally1,
  Trash,
  X,
  Eraser,
} from "lucide-react";
import { api_url } from "@/utils";
import axios from "axios";
import { useCotizacionesStore } from "@/stores/cotizacionesStore";
import Auditar from "@/services/AuditoriaHook";
import { DetallesVentasCliente } from "./ui/DetallesVentasCliente";
import FloatingCard from "@/modules/FloatingCard";
import ArticuloInfoCard from "@/modules/ArticuloInfoCard";
import { PresupuestosPendientes } from "./ui/PresupuestosPendientes";
import { NotaPresupuesto } from "./pdf/NotaPresupuesto";
import { createRoot } from "react-dom/client";
import { ArticulosComponent } from "@/ui/articulos/ArticulosComponent";
import BuscadorClientes from "@/ui/clientes/BuscadorClientes";
import BuscadorClientesMobile from "@/ui/clientes/BuscardorClientesMobile";

interface ItemParaPresupuesto {
  depre_articulo: number;
  depre_cantidad: number;
  depre_precio: number;
  depre_descuento: number;
  depre_exentas: number;
  depre_cinco: number;
  depre_diez: number;
  depre_altura: string | number | null;
  depre_largura: string | number | null;
  depre_mts2: number | null;
  depre_listaprecio: number;
  depre_codlote: number;
  depre_lote: string | null;
  depre_vence: string | null;
  depre_descripcio_art: string;
  depre_obs: string | null;
  depre_procesado: number | null;
  precio_original?: number | null;
  precio_guaranies: number | null;
  precio_dolares: number | null;
  precio_reales: number | null;
  precio_pesos: number | null;
  descripcion: string;
  cod_barra: string;
  editar_nombre?: number | null;
}

interface PresupuestoRecuperado {
  id: number;
  cliente: number;
  vendedor?: number;
  items: Array<{
    articulo: number;
    cantidad: number;
    precio: number;
    descuento?: number;
    lote?: string;
    loteid?: number;
  }>;
}

interface FormularioPresupuestosProps {
  cliente?: Cliente,
  operador?: number
}

const FormularioPresupuestos = ({cliente, operador}: FormularioPresupuestosProps) => {
  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();
  const { monedas, fetchMonedas } = useMonedasStore();
  const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();
  const { cotizaciones, fetchCotizaciones } = useCotizacionesStore();
  const [, setVendedores] = useState<Vendedor[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [articulos, setArticulos] = useState<ArticuloBusqueda[]>([]);

  const [isBuscadorClientesOpen, setIsBuscadorClientesOpen] = useState<boolean>(false);

  //estados para todo lo seleccionado
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [operadorSeleccionado, setOperadorSeleccionado] =
    useState<Vendedor | null>(null);
  const [vendedorSeleccionado, setVendedorSeleccionado] =
    useState<Vendedor | null>(null);
  const [listaPrecioSeleccionada, setListaPrecioSeleccionada] =
    useState<ListaPrecios | null>(null);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );
  const [condicionPago, setCondicionPago] = useState<string>("");
  const [validezOferta, setValidezOferta] = useState<string>("");
  const [plazoEntrega, setPlazoEntrega] = useState<string>("");
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticuloBusqueda | null>(null);
  const [tipoFlete, setTipoFlete] = useState<string>("");
  const [detalleAdicional, setDetalleAdicional] = useState<boolean>(false);
  const [detalleAdicionalText, setDetalleAdicionalText] = useState<string>("");

  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(true);

  const [articuloBusqueda, setArticuloBusqueda] = useState<string>("");
  const [isArticuloCardVisible, setIsArticuloCardVisible] =
    useState<boolean>(false);
  const [articuloBusquedaId, setArticuloBusquedaId] = useState<string>("");

  const [clienteBusqueda, setClienteBusqueda] = useState<string>("");

  const [vendedorBusqueda, setVendedorBusqueda] = useState<string>("");

  const [, setVendedorBusquedaId] = useState<string>("");

  const [hoveredArticulo, setHoveredArticulo] = useState<ArticuloBusqueda | null>(
    null
  );

  const [itemParaPresupuesto, setItemParaPresupuesto] = useState<
    ItemParaPresupuesto[]
  >([]);

  const [observacionPresupuesto, setObservacionPresupuesto] =
    useState<string>("");

  const [cantidadParaItem, setCantidadParaItem] = useState<number>(1);
  const [descuentoParaItem, setDescuentoParaItem] = useState<number>(0);

  const [totalDescuentoFactura, setTotalDescuentoFactura] = useState<
    number | null
  >(null);

  const [, setOperadores] = useState<Vendedor[]>([]);
  const clienteRef = useRef<HTMLInputElement>(null);
  const vendedorRef = useRef<HTMLInputElement>(null);
  const cantidadItemInputRef = useRef<HTMLInputElement>(null);
  const descuentoItemInputRef = useRef<HTMLInputElement>(null);
  const busquedaItemPorIdInputRef = useRef<HTMLInputElement>(null);
  const busquedaItemInputRef = useRef<HTMLInputElement>(null);
  const listaPrecioInputRef = useRef<HTMLSelectElement>(null);
  const precioItemInputRef = useRef<HTMLInputElement>(null);

  const permisos_descuento = JSON.parse(
    sessionStorage.getItem("permisos_descuento") || "[]"
  );

  const operadorCodigo = sessionStorage.getItem("user_id");
  const operadorNombre = sessionStorage.getItem("user_name");

  const [, setPresupuestoRecuperado] = useState<PresupuestoRecuperado | null>(
    null
  );

  const [isMobile] = useMediaQuery("(max-width: 1200px)");

  const toast = useToast();

  const [nuevaDescripcionItem, setNuevaDescripcionItem] = useState<string>("");

  const [codigoPresupuesto, setCodigoPresupuesto] = useState<number | null>(
    null
  );

  const [busquedaClienteId, setBusquedaClienteId] = useState<number | null>(
    null
  );
  const [busquedaVendedorId, setBusquedaVendedorId] = useState<number | null>(
    null
  );

  const [mostrarSubtotalCheck, setMostrarSubtotalCheck] = useState<boolean>(true);
  const [mostrarTotalCheck, setMostrarTotalCheck] = useState<boolean>(true);
  const [mostrarMarcaCheck, setMostrarMarcaCheck] = useState<boolean>(true);
  const [impresoraCheck, setImpresoraCheck] = useState<boolean>(true);
  const [pdfCheck, setPdfCheck] = useState<boolean>(false);
  const [isArticuloModalOpen, setIsArticuloModalOpen] = useState<boolean>(false);

  // Agregar este estado junto a los otros estados (cerca de la línea 159)
  const [precioArticulo, setPrecioArticulo] = useState<number>(0);

  

  const {
    onOpen: onOpenDetallesVentasCliente,
    onClose: onCloseDetallesVentasCliente,
    isOpen: isOpenDetallesVentasCliente,
  } = useDisclosure();

  const {
    onOpen: onOpenPresupuestosPendientes,
    onClose: onClosePresupuestosPendientes,
    isOpen: isOpenPresupuestosPendientes,
  } = useDisclosure();

  const {
    onOpen: onOpenDetalleAdicional,
    onClose: onCloseDetalleAdicional,
    isOpen: isOpenDetalleAdicional,
  } = useDisclosure();

  async function getArticulos(
    busqueda: string,
    id_articulo?: string | null,
    codigo_barra?: string | null
  ) {
    try {
      const response = await axios.get(
        `${api_url}articulos/buscar-articulos`,
        {
          params: {
            articulo_id: id_articulo,
            codigo_barra: codigo_barra,
            busqueda: busqueda,
            stock: true
          },
        }
      );
      console.log("Respuesta de articulos", response.data.body);
      setArticulos(response.data.body);
    } catch (error) {
      setTimeout(() => {
        toast({
          title: "Error",
          description: "Error al obtener los articulos",
          status: "error",
        });
      }, 1000);
    }
  }

  const getClientePorId = async (
    id: number | null,
    id_cliente: number | null
  ) => {
    console.log("Buscando cliente", id);
    try {
      const response = await axios.get(`${api_url}clientes/get-clientes`, {
        params: {
          id_cliente: id_cliente,
          id: id,
        },
      });
      console.log("Respuesta de cliente", response.data.body);
      setClienteSeleccionado(response.data.body[0]);
      console.log("Cliente seleccionado", response.data.body[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getVendedoresPorId = async (busqueda: number) => {
    const response = await axios.get(`${api_url}usuarios/vendedores`, {
      params: {
        id_vendedor: busqueda,
      },
    });
    setVendedores(response.data.body);
    setVendedorSeleccionado(response.data.body[0]);
  };

  const getOperadoresPorId = async (busqueda: number) => {
    const response = await axios.get(`${api_url}usuarios/vendedores`, {
      params: {
        id_vendedor: busqueda,
      },
    });
    setOperadores(response.data.body);
    setOperadorSeleccionado(response.data.body[0]);
  };

  // const buscarVendedores = async (busqueda: string) => {
  //   const response = await axios.get(`${api_url}usuarios/vendedores`, {
  //     params: {
  //       busqueda: busqueda,
  //     },
  //   });
  //   setVendedores(response.data.body);
  // };

  const handleBuscarArticulos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setArticuloBusqueda(busqueda);
    setArticuloSeleccionado(null);
    if (busqueda.length > 0) {
      setIsArticuloCardVisible(true);
      getArticulos(busqueda);
    } else {
      setIsArticuloCardVisible(false);
      setArticulos([]);
    }
  };

  const handleBuscarArticuloPorId = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const busqueda = e.target.value;
    setArticuloBusquedaId(busqueda);
    setArticuloSeleccionado(null);
    if (busqueda.length > 0) {
      getArticulos("", null, busqueda);
    } else {
      setIsArticuloCardVisible(false);
      setArticulos([]);
    }
  };

  const handleBuscarClientePorId = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Buscando cliente por id", e);
    const busqueda = typeof e === "number" ? e : e.target.value;
    if (busqueda === "" || busqueda === null) {
      setClienteSeleccionado(null);
      setBusquedaClienteId(null);
    } else if (busqueda) {
      getClientePorId(Number(busqueda), null);
      setBusquedaClienteId(Number(busqueda));
    } else {
      setClienteSeleccionado(null);
      setBusquedaClienteId(null);
    }
  };

  const handleBuscarVendedorPorId = (
    e: React.ChangeEvent<HTMLInputElement> | number
  ) => {
    console.log("Buscando vendedor por id", e);
    const busqueda = typeof e === "number" ? e : e.target.value;
    if (busqueda === "" || busqueda === null) {
      setVendedorSeleccionado(null);
      setBusquedaVendedorId(null);
    } else if (busqueda) {
      getVendedoresPorId(Number(busqueda));
      setBusquedaVendedorId(Number(busqueda));
    } else {
      setVendedorSeleccionado(null);
      setBusquedaVendedorId(null);
    }
  };

  const handleBuscarOperadorPorId = (
    e: React.ChangeEvent<HTMLInputElement> | number
  ) => {
    console.log("Buscando operador por id", e);
    const busqueda = typeof e === "number" ? e : e.target.value;
    if (busqueda === "" || busqueda === null) {
      setOperadorSeleccionado(null);
    } else if (busqueda) {
      getOperadoresPorId(Number(busqueda));
    } else {
      setOperadorSeleccionado(null);
    }
  };

  // const handleSelectCliente = (cliente: Cliente) => {
  //   setClienteSeleccionado(cliente);
  //   handleBuscarVendedorPorId(cliente.vendedor_cliente);
  //   setVendedorSeleccionado(
  //     vendedores.find((vendedor) => vendedor.id === cliente.vendedor_cliente) ||
  //       null
  //   );
  // };

  const handleSelectArticulo = (item: ArticuloBusqueda) => {
    setArticuloSeleccionado(item);
    setIsArticuloCardVisible(false);
    setArticulos([]);
    setHoveredArticulo(null);
    setArticuloBusqueda("");
    setArticuloBusquedaId("");
    console.log("Precio del artículo seleccionado:", item.precio_venta_guaranies);
    setPrecioArticulo(item.precio_venta_guaranies);
    setCantidadParaItem(1);
    setDescuentoParaItem(0);
  };

  const crearItemValidado = (
    articulo: ArticuloBusqueda,
    cantidad: number,
    precio: number,
    descuento: number = 0
  ): ItemParaPresupuesto | null => {
    // Usar directamente el precio que se pasa
    const precioNumerico = precio;
    
    // Usar el precio modificado como base en lugar del precio original del artículo
    let precioEnGuaranies = precioNumerico;
    
    // 6. Cálculo de precio en moneda actual
    let precioUnitarioMonedaActual = precioEnGuaranies;
    if (monedaSeleccionada?.mo_codigo !== 1) {
      // Conversión a moneda extranjera
      switch (monedaSeleccionada?.mo_codigo) {
        case 2: // Dólares
          precioUnitarioMonedaActual =
            precioEnGuaranies / cotizaciones[0].usd_venta;
          break;
        case 3: // Reales
          precioUnitarioMonedaActual =
            precioEnGuaranies / cotizaciones[0].brl_venta;
          break;
        case 4: // Pesos
          precioUnitarioMonedaActual =
            precioEnGuaranies / cotizaciones[0].ars_venta;
          break;
      }
    }

    // 7. Cálculo de montos con descuento
    const montoDescuento = (precioNumerico * cantidad * descuento) / 100;
    const montoTotal = precioNumerico * cantidad - montoDescuento;

    // 8. Cálculo de impuestos
    let deve_exentas = 0;
    let deve_cinco = 0;
    let deve_diez = 0;

    switch (articulo.iva) {
      case 1: // Exento
        deve_exentas = montoTotal;
        break;
      case 2: // IVA 10%
        deve_diez = montoTotal;
        break;
      case 3: // IVA 5%
        deve_cinco = montoTotal;
        break;
    }

    // 9. Crear el item con todas las validaciones aplicadas
    return {
      precio_guaranies: precioEnGuaranies,
      precio_dolares: Number(
        (precioEnGuaranies / cotizaciones[0].usd_venta)
      ),
      precio_reales: Number(
        (precioEnGuaranies / cotizaciones[0].brl_venta)
      ),
      precio_pesos: Number(
        (precioEnGuaranies / cotizaciones[0].ars_venta)
      ),
      cod_barra: articulo.codigo_barra,
      depre_articulo: articulo.id_articulo,
      descripcion: articulo.descripcion,
      depre_cantidad: cantidad,
      depre_precio: precioUnitarioMonedaActual, // Ahora usará el precio modificado
      precio_original: articulo.precio_venta_guaranies, // Guardar el precio original
      depre_descuento: descuento || 0,
      depre_exentas: Number(deve_exentas),
      depre_cinco: Number(deve_cinco),
      depre_diez: Number(deve_diez),
      editar_nombre: articulo.editar_nombre,
      depre_lote: articulo.lote,
      depre_codlote: articulo.id_lote,
      depre_vence: articulo.vencimiento_lote,
      depre_descripcio_art: nuevaDescripcionItem,
      depre_obs: null,
      depre_procesado: null,
      depre_altura: null,
      depre_largura: null,
      depre_mts2: null,
      depre_listaprecio: listaPrecioSeleccionada?.lp_codigo || 0,
    };
  };

  const agregarItemAPresupuesto = () => {
    if (!articuloSeleccionado) return;

    const nuevoItem = crearItemValidado(
      articuloSeleccionado,
      cantidadParaItem || 1,
      precioArticulo,
      descuentoParaItem || 0
    );

    if (nuevoItem) {
      setItemParaPresupuesto([...itemParaPresupuesto, nuevoItem]);
      setArticuloSeleccionado(null);
      setCantidadParaItem(1);
      setDescuentoParaItem(0);
      setPrecioArticulo(0); // Resetear el nuevo estado
      if(nuevoItem.editar_nombre === 1){
        setNuevaDescripcionItem(nuevoItem.descripcion);
      } else {
        setNuevaDescripcionItem('');
      }
    }
    console.log("Precio al agregar:", precioArticulo);
    busquedaItemPorIdInputRef.current?.focus();
  };

  
  const handleEliminarItem = (item: ItemParaPresupuesto) => {
    setItemParaPresupuesto(itemParaPresupuesto.filter((i) => i !== item));
  };

  const handleButtonPress = () => {
    if (articulos.length > 0) {
      handleSelectArticulo(articulos[0]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (articuloSeleccionado) {
        if (permisos_descuento === 1) {
          descuentoItemInputRef.current?.focus();
        } else {
          cantidadItemInputRef.current?.focus();
        }
      } else if (hoveredArticulo) {
        handleSelectArticulo(hoveredArticulo);
        setHoveredArticulo(null);
      } else if (articulos.length > 0) {
        handleSelectArticulo(articulos[0]);
      } else if (!articuloBusquedaId || articuloBusquedaId === "") {
        setIsArticuloModalOpen(true); // Si no hay búsqueda, abrimos el modal
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = hoveredArticulo
        ? articulos.findIndex(
          (a) => a.id_articulo === hoveredArticulo.id_articulo
        )
        : -1;

      if (e.key === "ArrowDown") {
        if (currentIndex < articulos.length - 1) {
          setHoveredArticulo(articulos[currentIndex + 1]);
        }
      } else if (e.key === "ArrowUp") {
        if (currentIndex > 0) {
          setHoveredArticulo(articulos[currentIndex - 1]);
        }
      }
    }
  };

  const handleCantidadKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      listaPrecioInputRef.current?.focus();
    }
  };

  const handleListaPrecioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      precioItemInputRef.current?.focus();
    }
  };

  const handlePrecioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      descuentoItemInputRef.current?.focus();
    }
  };


  const handleDescuentoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (articuloSeleccionado) {
        agregarItemAPresupuesto();
      }
      setCantidadParaItem(1);
      setDescuentoParaItem(0);
    }
  };


  const handleCancelarPresupuesto = () => {
    setItemParaPresupuesto([]);
    setArticuloSeleccionado(null);
    setCantidadParaItem(1);
    setDescuentoParaItem(0);
    setClienteSeleccionado(null);
    setClienteBusqueda("");
    setVendedorSeleccionado(null);
    setVendedorBusqueda("");
    setVendedorSeleccionado(null);
    setVendedorBusquedaId("");
    setCodigoPresupuesto(null);
    setPresupuestoRecuperado(null);
    setObservacionPresupuesto("");
    setPlazoEntrega("");
    setValidezOferta("");
    setTipoFlete("");
    setCondicionPago("");
    setMonedaSeleccionada(null);
    setSucursalSeleccionada(null);
    setNuevaDescripcionItem('');
    setBusquedaClienteId(null);
    setClienteSeleccionado(null);
    setBusquedaVendedorId(null);
    setVendedorSeleccionado(null);

  };

  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
    fetchMonedas();
    fetchListaPrecios();
    fetchCotizaciones();
    getOperadoresPorId(operadorCodigo ? parseInt(operadorCodigo) : 0);
  }, []);

  useEffect(() => {
    if (!sucursalSeleccionada && sucursales.length > 0) {
      setSucursalSeleccionada(sucursales[0]);
    }
    if (!depositoSeleccionado && depositos.length > 0) {
      setDepositoSeleccionado(depositos[0]);
    }
    if (!listaPrecioSeleccionada && listaPrecios.length > 0) {
      setListaPrecioSeleccionada(listaPrecios[0]);
    }
    if (!monedaSeleccionada && monedas.length > 0) {
      console.log("monedas", monedas);
      setMonedaSeleccionada(monedas[0]);
    }
  }, [sucursales, depositos, monedas, listaPrecios]);

  const totalExentas = itemParaPresupuesto.reduce(
    (total, item) => total + item.depre_exentas,
    0
  );

  const totalCinco = itemParaPresupuesto.reduce(
    (total, item) => total + item.depre_cinco,
    0
  );

  const totalDiez = itemParaPresupuesto.reduce(
    (total, item) => total + item.depre_diez,
    0
  );

  const totalPagarFactura = itemParaPresupuesto.reduce(
    (total, item) => total + item.depre_precio * item.depre_cantidad,
    0
  );

  const totalDescuentoItems = itemParaPresupuesto.reduce(
    (total, item) =>
      total + item.depre_descuento * item.depre_precio * item.depre_cantidad,
    0
  );

  const totalFinal =
    totalPagarFactura - totalDescuentoItems - (totalDescuentoFactura || 0);

  const formatNumber = (num: number | string) => {
    if (num === undefined || num === null) {
      return "0";
    }

    if (typeof num === "string") {
      num = Number(num);
      return num.toLocaleString("es-PY", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return num.toLocaleString("es-PY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const totalExentasFormateado = formatNumber(totalExentas);
  const totalCincoFormateado = formatNumber(totalCinco);
  const totalDiezFormateado = formatNumber(totalDiez);
  const totalPagarFormateado = formatNumber(totalPagarFactura);
  const totalDescuentoFacturaFormateado = formatNumber(totalDescuentoItems);
  const totalAPagarFormateado = formatNumber(totalFinal);

  const guardarPresupuesto = async () => {
    try {

      console.log("clienteSeleccionado", clienteSeleccionado);
      console.log("vendedorSeleccionado", vendedorSeleccionado);
      console.log("itemParaPresupuesto", itemParaPresupuesto);
      console.log("monedaSeleccionada", monedaSeleccionada);
      console.log("totalDescuentoFactura", totalDescuentoFactura);
      console.log("observacionPresupuesto", observacionPresupuesto);
      console.log("plazoEntrega", plazoEntrega);


      if (!clienteSeleccionado) {
        toast({
          title: "Error",
          description: "Debe seleccionar un cliente",
          status: "error",
          duration: 3000,
        });
        return;
      }
      if (!vendedorSeleccionado) {
        toast({
          title: "Error",
          description: "Debe seleccionar un vendedor",
          status: "error",
          duration: 3000,
        });
        return;
      }
      if (itemParaPresupuesto.length === 0) {
        toast({
          title: "Error",
          description: "Debe agregar al menos un item",
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!monedaSeleccionada) {
        toast({
          title: "Error",
          description: "Debe seleccionar una moneda",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const presupuesto = {
        pre_codigo: codigoPresupuesto || null,
        pre_cliente: clienteSeleccionado.cli_codigo,
        pre_operador: operadorSeleccionado?.op_codigo,
        pre_fecha: fecha,
        pre_moneda: monedaSeleccionada?.mo_codigo,
        pre_descuento: totalDescuentoFactura || 0,
        pre_vendedor: vendedorSeleccionado?.op_codigo,
        pre_hora: new Date().toLocaleTimeString(),
        pre_obs: observacionPresupuesto,
        pre_plazo: plazoEntrega || "8 Dias",
        pre_validez: validezOferta || "8 Dias",
        pre_flete: tipoFlete || "",
        pre_condicion: condicionPago || "8 Dias",
        pre_sucursal: sucursalSeleccionada?.id,
        pre_deposito: depositoSeleccionado?.dep_codigo,
        detalle_adicional: detalleAdicional === true ? 1 : 0,
        detalle_adicional_texto: detalleAdicionalText,
      };

      const detallesPresupuesto = itemParaPresupuesto.map((item) => ({
        depre_articulo: item.depre_articulo,
        depre_cantidad: item.depre_cantidad,
        depre_precio: item.depre_precio,
        depre_descuento: item.depre_descuento,
        depre_exentas: item.depre_exentas,
        depre_cinco: item.depre_cinco,
        depre_diez: item.depre_diez,
        depre_altura: item.depre_altura,
        depre_largura: item.depre_largura,
        depre_mts2: item.depre_mts2,
        depre_listaprecio: item.depre_listaprecio,
        depre_codlote: item.depre_codlote,
        depre_lote: item.depre_lote,
        depre_vence: item.depre_vence,
        depre_descripcio_art: item.depre_descripcio_art || nuevaDescripcionItem,
        depre_obs: item.depre_obs,
        depre_procesado: item.depre_procesado,
      }));

      console.log(presupuesto);
      console.log(detallesPresupuesto);
      const response = await axios.post(
        `${api_url}presupuestos/insertar-presupuesto`,
        {
          presupuesto,
          detallesPresupuesto,
        }
      );

      console.log("la respuesta del servidor es", response.data);
      toast({
        title: "Presupuesto guardado",
        description: "Presupuesto guardado correctamente",
        status: "success",
        duration: 3000,
      });
      Auditar(
        5,
        8,
        response.data.body.presupuestoId,
        operadorCodigo ? parseInt(operadorCodigo) : 0,
        `Presupuesto ID ${response.data.body.presupuestoId} realizado por ${operadorNombre}`
      );

      imprimirNotaPresupuestoComponente(response.data.body.id);

      handleCancelarPresupuesto();
    } catch (error) {
      console.error("Error al guardar el presupuesto", error);
      toast({
        title: "Error",
        description: "Error al guardar el presupuesto",
      });
    }
  };

  function handleLimpiarBusqueda() {
    setArticuloBusqueda("");
    setArticuloBusquedaId("");
    setArticuloSeleccionado(null);
    setCantidadParaItem(1);
    setDescuentoParaItem(0);
    setPrecioArticulo(0); // Resetear el nuevo estado
  }

  function handleGuardarDetalleAdicional() {
    if (detalleAdicionalText.trim() === "") {
      toast({
        title: "Error",
        description: "El detalle adicional no puede estar vacío",
        status: "error",
      });
      return;
    }
    onCloseDetalleAdicional();
  }

  function handleCancelarDetalleAdicional() {
    setDetalleAdicionalText("");
    onCloseDetalleAdicional();
    setDetalleAdicional(false);
  }

  async function handleRecuperarPresupuesto(presupuesto: number) {
    try {
      const response = await axios.get(
        `${api_url}presupuestos/recuperar-presupuesto`,
        {
          params: {
            id: presupuesto,
          },
        }
      );

      // Guardamos el código del presupuesto
      setCodigoPresupuesto(response.data.body.pre_codigo);

      // Guardamos el presupuesto completo
      setPresupuestoRecuperado(response.data.body);

      // Asignamos los items directamente desde la respuesta
      // Aseguramos que items sea un array
      const items = Array.isArray(response.data.body.items) ? response.data.body.items : [];
      setItemParaPresupuesto(items);

      // Buscamos el cliente, operador y vendedor por sus IDs
      handleBuscarClientePorId(response.data.body.pre_cliente);
      handleBuscarOperadorPorId(response.data.body.pre_operador);
      handleBuscarVendedorPorId(response.data.body.pre_vendedor);

      // Seleccionamos la moneda correspondiente
      setMonedaSeleccionada(
        monedas.find(
          (moneda) => moneda.mo_codigo === response.data.body.pre_moneda
        ) || null
      );

      // Asignamos los demás campos del presupuesto
      setObservacionPresupuesto(response.data.body.pre_obs || "");
      setPlazoEntrega(response.data.body.pre_plazo || "8 Dias");
      setValidezOferta(response.data.body.pre_validez || "8 Dias");
      setTipoFlete(response.data.body.pre_flete || "");
      setCondicionPago(response.data.body.pre_condicion || "8 Dias");
      

      // Seleccionamos la sucursal y depósito correspondientes
      setSucursalSeleccionada(
        sucursales.find(
          (sucursal) => sucursal.id === response.data.body.pre_sucursal
        ) || null
      );
      setDepositoSeleccionado(
        depositos.find(
          (deposito) => deposito.dep_codigo === response.data.body.pre_deposito
        ) || null
      );

      // Si hay un item con editar_nombre = 1, actualizamos la descripción
      const itemEditable = items.find((item: ItemParaPresupuesto) => item.editar_nombre === 1);
      if (itemEditable) {
        setNuevaDescripcionItem(itemEditable.depre_descripcio_art || "");
      }

      toast({
        title: "Presupuesto recuperado",
        description: `Presupuesto #${response.data.body.pre_codigo} recuperado correctamente`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al recuperar el presupuesto", error);
      toast({
        title: "Error",
        description: "Error al recuperar el presupuesto",
        status: "error",
        duration: 3000,
      });
    }
  }

  const imprimirNotaPresupuestoComponente = async (presupuesto: number) => {
    const notaPresupuestoDiv = document.createElement("div");
    notaPresupuestoDiv.style.display = "none";
    document.body.appendChild(notaPresupuestoDiv);

    const root = createRoot(notaPresupuestoDiv);
    root.render(
      <NotaPresupuesto
        presupuesto={presupuesto}
        onComplete={() => { }}
        onError={() => { }}
        mostrarSubtotal={mostrarSubtotalCheck}
        mostrarTotal={mostrarTotalCheck}
        mostrarMarca={mostrarMarcaCheck}
        action={isMobile ? "download" : impresoraCheck ? "print" : pdfCheck ? "download" : "print"}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(notaPresupuestoDiv);
    }, 2000);
  };

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      // Solo activar cuando se presiona Enter y el elemento activo es específicamente el body
      // o cuando no hay ningún elemento enfocado
      const activeElement = document.activeElement;
      
      // Verificar que realmente estemos en el body o que no haya elemento activo
      const isBodyOrNoElement = activeElement === document.body || 
                               activeElement === document.documentElement ||
                               activeElement === null;
      
      // Verificar que no estemos en ningún tipo de input
      const isInputElement = activeElement instanceof HTMLInputElement || 
                            activeElement instanceof HTMLTextAreaElement || 
                            activeElement instanceof HTMLSelectElement ||
                            activeElement instanceof HTMLButtonElement;
      
      // Verificar que no estemos en un modal o componente flotante
      const isInModal = activeElement?.closest('[role="dialog"]') || 
                       activeElement?.closest('.modal') ||
                       activeElement?.closest('[data-modal]');
      
      // Verificar que no estemos en el FloatingCard
      const isInFloatingCard = activeElement?.closest('.floating-card') ||
                              document.querySelector('.floating-card')?.contains(activeElement);
      
      if (e.key === "Enter" && isBodyOrNoElement && !isInputElement && !isInModal && !isInFloatingCard) {
        e.preventDefault();
        clienteRef.current?.focus();
      }
    };

    // Usar capture: false (por defecto) para que no interfiera con otros eventos
    document.addEventListener("keydown", handleGlobalEnter);
    return () => {
      document.removeEventListener("keydown", handleGlobalEnter);
    };
  }, []);

  const handleClienteIdKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Enter" &&
      clienteRef.current?.value !== "" &&
      clienteRef.current?.value !== null
    ) {
      e.preventDefault();
      vendedorRef.current?.focus();
    } else if (
      (e.key === "Enter" && clienteRef.current?.value === "") ||
      clienteRef.current?.value === null
    ) {
      setIsBuscadorClientesOpen(true);
    }
  };

  const handleVendedorKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && vendedorRef.current?.value !== "" && vendedorRef.current?.value !== null) {
      e.preventDefault();
      busquedaItemPorIdInputRef.current?.focus();
    }
  };

  useEffect(()=> {
    if(cliente){
      setClienteSeleccionado(cliente);
    }
    if(operador){
      handleBuscarVendedorPorId(operador);
    }
  })

  return (
    <Box
      w={"100%"}
      h={"100vh"}
      className="bg-gray-100"
      p={2}
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      overflowY={isMobile ? "auto" : "hidden"}
    >
      <div
        className={
          isMobile
            ? "flex flex-col gap-2 bg-blue-600 rounded-md h-[6%] justify-center px-1"
            : "flex flex-col gap-2 bg-blue-600 rounded-md h-[6%] justify-center px-4"
        }
      >
        <div
          className={
            isMobile
              ? "flex flex-row gap-2 p-2 items-center"
              : "flex flex-row gap-2 items-center"
          }
        >
          <p className="text-white font-bold text-xl">
            Registro de Presupuestos
          </p>
          {isMobile ? (
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="ml-auto relative h-6 w-8 overflow-hidden"
            >
              <div
                className={`absolute inset-0 transition-all duration-300 transform ${mostrarFiltros ? "opacity-100" : "opacity-0 rotate-90 scale-0"
                  }`}
              >
                <X size={isMobile ? 24 : 32} color="white" />
              </div>
              <div
                className={`absolute inset-0 transition-all duration-300 transform ${mostrarFiltros
                    ? "opacity-0 -rotate-90 scale-0"
                    : "opacity-100"
                  }`}
              >
                <Filter size={isMobile ? 24 : 32} color="white" />
              </div>
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={
          isMobile
            ? mostrarFiltros
              ? "bg-blue-100 rounded-md h-[80%] p-2 flex flex-col gap-2 overflow-y-auto transition-all duration-500 ease-in-out opacity-100"
              : "bg-blue-100 rounded-md flex flex-col gap-2 transition-all duration-500 ease-in-out opacity-0 max-h-0 overflow-hidden pointer-events-none"
            : "bg-blue-100 rounded-md h-[25%] p-2 flex flex-col gap-2 transition-all duration-500 ease-in-out opacity-100"
        }
      >
        <div
          className={isMobile ? "flex flex-col  gap-2" : "flex flex-row  gap-2"}
        >
          <div className="flex flex-col gap-2 flex-1">
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2  flex-1"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="sucursal" className="text-black font-bold">
                  Sucursal
                </label>
                <select
                  name="sucursal"
                  id="sucursal"
                  value={sucursalSeleccionada?.id}
                  onChange={(e) =>
                    setSucursalSeleccionada(
                      sucursales.find(
                        (sucursal) => sucursal.id === parseInt(e.target.value)
                      ) || null
                    )
                  }
                  className={
                    isMobile
                      ? "bg-white rounded-md p-2 w-full"
                      : "bg-white rounded-md p-2"
                  }
                >
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="deposito" className="text-black font-bold">
                  Depósito
                </label>
                <select
                  name="deposito"
                  id="deposito"
                  value={depositoSeleccionado?.dep_codigo}
                  onChange={(e) =>
                    setDepositoSeleccionado(
                      depositos.find(
                        (deposito) =>
                          deposito.dep_codigo === parseInt(e.target.value)
                      ) || null
                    )
                  }
                  className={
                    isMobile
                      ? "bg-white rounded-md p-2 w-full"
                      : "bg-white rounded-md p-2"
                  }
                >
                  {depositos.map((deposito) => (
                    <option
                      key={deposito.dep_codigo}
                      value={deposito.dep_codigo}
                    >
                      {deposito.dep_descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 relative"
                  : "flex flex-row gap-2 items-center relative"
              }
            >
              <label htmlFor="cliente" className="text-black font-bold">
                Cliente:
              </label>
              <div className={isMobile ? "flex flex-row gap-2 items-center" : "flex flex-row gap-2 items-center"}>
                <input
                  ref={clienteRef}
                  type="number"
                  name="cliente_id"
                  id="cliente_id"
                  className={isMobile ? "bg-white rounded-md p-2 flex-1" : "bg-white rounded-md p-2"}
                  placeholder="Buscar cliente por id"
                  value={
                    clienteSeleccionado
                      ? clienteSeleccionado.cli_interno
                      : busquedaClienteId || ""
                  }
                  onChange={(e) => handleBuscarClientePorId(e)}
                  onKeyDown={handleClienteIdKeyPress}
                />
                {isMobile && (
                  <button
                    className="bg-blue-600 text-white px-3 rounded-md text-sm"
                    onClick={() => setIsBuscadorClientesOpen(true)}
                  >
                    Buscar
                  </button>
                )}
              </div>
              <input
                type="text"
                name="cliente_nombre"
                id="cliente_nombre"
                className="bg-white rounded-md p-2 w-full"
                disabled
                placeholder="No se ha seleccionado un cliente"
                value={
                  clienteSeleccionado
                    ? clienteSeleccionado.cli_razon
                    : clienteBusqueda
                }
              />
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 relative"
                  : "flex flex-row gap-2 items-center relative"
              }
            >
              <label htmlFor="vendedor" className="text-black font-bold">
                Vendedor:
              </label>
              <input
                type="number"
                name="vendedor_id"
                id="vendedor_id"
                className="bg-white rounded-md p-2"
                placeholder="Buscar vendedor por id"
                value={busquedaVendedorId || ""}
                onChange={(e) => handleBuscarVendedorPorId(e)}
                onKeyDown={handleVendedorKeyPress}
                ref={vendedorRef}
              />
              <input
                type="text"
                name="vendedor_nombre"
                id="vendedor_nombre"
                className="bg-white rounded-md p-2 w-full"
                disabled
                placeholder="No se ha seleccionado un vendedor"
                value={
                  vendedorSeleccionado
                    ? vendedorSeleccionado.op_nombre
                    : vendedorBusqueda
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="fecha" className="text-black font-bold">
                  Fecha:
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={
                    isMobile
                      ? "bg-white rounded-md p-2 w-full"
                      : "bg-white rounded-md p-2"
                  }
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="moneda" className="text-black font-bold">
                  Moneda:
                </label>
                <select
                  name="moneda"
                  id="moneda"
                  value={monedaSeleccionada?.mo_codigo}
                  disabled={itemParaPresupuesto.length > 0}
                  onChange={(e) =>
                    setMonedaSeleccionada(
                      monedas.find(
                        (moneda) =>
                          moneda.mo_codigo === parseInt(e.target.value)
                      ) || null
                    )
                  }
                  className={
                    isMobile
                      ? "bg-white rounded-md p-2 w-full"
                      : "bg-white rounded-md p-2"
                  }
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="operador" className="text-black font-bold">
                Operador:
              </label>
              <input
                type="number"
                name="operador_id"
                id="operador_id"
                className="bg-white rounded-md p-2 w-10"
                onChange={(e) => handleBuscarOperadorPorId(e)}
                value={operadorSeleccionado?.op_codigo || ""}
                disabled
              />
              <input
                type="text"
                name="operador_nombre"
                id="operador_nombre"
                className="bg-white rounded-md p-2 w-full"
                value={operadorSeleccionado?.op_nombre || ""}
                disabled
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="lista_precios" className="text-black font-bold">
                Lista de Precios:
              </label>
              <select
                name="lista_precios"
                id="lista_precios"
                value={listaPrecioSeleccionada?.lp_codigo}
                onChange={(e) =>
                  setListaPrecioSeleccionada(
                    listaPrecios.find(
                      (listaPrecio) =>
                        listaPrecio.lp_codigo === parseInt(e.target.value)
                    ) || null
                  )
                }
                className={
                  isMobile
                    ? "bg-white rounded-md p-2 w-full"
                    : "bg-white rounded-md p-2"
                }
              >
                {listaPrecios.map((listaPrecio) => (
                  <option
                    key={listaPrecio.lp_codigo}
                    value={listaPrecio.lp_codigo}
                  >
                    {listaPrecio.lp_descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <label htmlFor="condicion_pago" className="text-black font-bold">
                Condición de Pago:
              </label>
              <input
                type="text"
                name="condicion_pago"
                id="condicion_pago"
                className="bg-white rounded-md p-2"
                placeholder="8 Dias"
                value={condicionPago}
                onChange={(e) => setCondicionPago(e.target.value)}
              />
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <label htmlFor="validez_oferta" className="text-black font-bold">
                Validez de la Oferta:
              </label>
              <input
                type="text"
                name="validez_oferta"
                id="validez_oferta"
                className="bg-white rounded-md p-2"
                placeholder="8 Dias"
                value={validezOferta}
                onChange={(e) => setValidezOferta(e.target.value)}
              />
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <label htmlFor="plazo_entrega" className="text-black font-bold">
                Plazo de Entrega:
              </label>
              <input
                type="text"
                name="plazo_entrega"
                id="plazo_entrega"
                className="bg-white rounded-md p-2"
                placeholder="8 Dias"
                value={plazoEntrega}
                onChange={(e) => setPlazoEntrega(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <label htmlFor="tipo_flete" className="text-black font-bold">
                Tipo de Flete
              </label>
              <input
                type="text"
                name="tipo_flete"
                id="tipo_flete"
                className="bg-white rounded-md p-2"
                value={tipoFlete}
                onChange={(e) => setTipoFlete(e.target.value)}
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <button
                className="bg-blue-600 text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                onClick={onOpenPresupuestosPendientes}
              >
                Recuperar presupuestos
              </button>
              <input
                type="text"
                className="bg-white rounded-md p-2 w-1/2"
                value={codigoPresupuesto || ""}
              />
            </div>
            <button
              onClick={() => {
                onOpenDetallesVentasCliente();
              }}
              className="bg-blue-600 text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={!clienteSeleccionado}
            >
              <p className="text-white font-bold">Consultar Ventas</p>
            </button>

            <div className="flex flex-row gap-2 items-center">
              <label
                htmlFor="detalle_adicional"
                className="text-black font-bold"
              >
                Detalle Adicional
              </label>
              <input
                type="checkbox"
                name="detalle_adicional"
                id="detalle_adicional"
                className="bg-white rounded-md p-2 size-4"
                checked={detalleAdicional}
                onChange={(e) => setDetalleAdicional(e.target.checked)}
                onClick={onOpenDetalleAdicional}
              />
            </div>
          </div>
        </div>
        <div
          className={
            isMobile
              ? "flex flex-col gap-2 relative w-full"
              : "flex flex-row gap-2 items-center relative w-full"
          }
        >
          <div
            className={
              isMobile
                ? "flex flex-col gap-2 flex-1 w-full "
                : "flex flex-row gap-2 items-center  flex-1 w-full "
            }
          >
            <input
              type="text"
              name="id_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="Buscar articulo por codigo"
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.codigo_barra
                  : articuloBusquedaId
              }
              onChange={(e) => handleBuscarArticuloPorId(e)}
              onKeyDown={handleKeyPress}
              ref={busquedaItemPorIdInputRef}
            />
            <input
              type="text"
              name="descripcion_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-full"
              }
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.descripcion
                  : articuloBusqueda
              }
              onChange={(e) => handleBuscarArticulos(e)}
              placeholder="Buscar Articulo por descripcion"
              onKeyDown={handleKeyPress}
              ref={busquedaItemInputRef}
            />
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2 "
                : "flex flex-row gap-2 items-center "
            }
          >
            <input
              type="number"
              name="cantidad_articulo"
              id="cantidad_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 "
              }
              placeholder="Cantidad"
              value={cantidadParaItem}
              onChange={(e) => setCantidadParaItem(Number(e.target.value))}
              ref={cantidadItemInputRef}
              onKeyDown={handleCantidadKeyPress}
            />
            <select
              name="lista_precio_articulo"
              id="lista_precio_articulo"
              className="bg-white rounded-md p-2"
              value={listaPrecioSeleccionada?.lp_codigo}
              onChange={(e) =>
                setListaPrecioSeleccionada(
                  listaPrecios.find(
                    (lp) => lp.lp_codigo === Number(e.target.value)
                  ) || null
                )
              }
              ref={listaPrecioInputRef}
              onKeyDown={handleListaPrecioKeyPress}
            >
              {listaPrecios.map((listaPrecio) => (
                <option
                  key={listaPrecio.lp_codigo}
                  value={listaPrecio.lp_codigo}
                >
                  {listaPrecio.lp_descripcion}
                </option>
              ))}
            </select>
            {isMobile ? (
              !articuloSeleccionado ? (
                <button
                  className="bg-blue-600 text-white rounded-md p-2 flex flex-row gap-2 items-center justify-center"
                  onClick={() => handleButtonPress()}
                >
                  <Search />
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white rounded-md p-2 flex flex-row gap-2 items-center justify-center"
                  onClick={handleLimpiarBusqueda}
                >
                  <Eraser />
                </button>
              )
            ) : null}
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2"
                : "flex flex-row gap-2 items-center"
            }
          >
            <input
              type="text"
              name="precio_articulo"
              id="precio_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="Precio Unitario"
              value={precioArticulo}
              onChange={(e) => {
                const value = e.target.value;
                setPrecioArticulo(value === "" ? 0 : Number(value));
              }}
              ref={precioItemInputRef}
              onKeyDown={handlePrecioKeyPress}
            />
            <input
              type="number"
              name="descuento_articulo"
              id="descuento_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="Descuento"
              value={descuentoParaItem || ""}
              onChange={(e) => setDescuentoParaItem(Number(e.target.value))}
              ref={descuentoItemInputRef}
              onKeyDown={handleDescuentoKeyPress}
            />
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2"
                : "flex flex-row gap-2 items-center"
            }
          >
            <input
              type="text"
              name="lote_articulo"
              id="lote_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="Lote"
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.lote || "N/A"
                  : "N/A"
              }
              disabled
            />
            <input
              type="number"
              name="exentas_articulo"
              id="exentas_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="Exentas"
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.iva === 0
                    ? articuloSeleccionado.precio_venta_guaranies
                    : 0
                  : ""
              }
            />
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2"
                : "flex flex-row gap-2 items-center"
            }
          >
            <input
              type="number"
              name="cinco_articulo"
              id="cinco_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="5%"
              disabled
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.iva === 3
                    ? articuloSeleccionado.precio_venta_guaranies
                    : 0
                  : ""
              }
            />
            <input
              type="number"
              name="diez_articulo"
              id="diez_articulo"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 w-full"
                  : "bg-white rounded-md p-2 w-1/2"
              }
              placeholder="10%"
              disabled
              value={
                articuloSeleccionado
                  ? articuloSeleccionado.iva === 2
                    ? articuloSeleccionado.precio_venta_guaranies
                    : 0
                  : ""
              }
            />
          </div>
          <button
            className="bg-green-600 text-white rounded-md p-2 flex flex-row gap-2 items-center justify-center"
            onClick={() => agregarItemAPresupuesto()}
          >
            <Plus />
            {isMobile ? <p className="text-white font-bold">Agregar</p> : ""}
          </button>
          <FloatingCard
            items={articulos}
            onClose={() => setIsArticuloCardVisible(false)}
            onSelect={handleSelectArticulo}
            isVisible={isArticuloCardVisible}
            className={
              isMobile
                ? "absolute top-24 left-0 right-0 z-999"
                : "absolute top-16 left-0 right-0 z-999"
            }
            renderItem={(item) => (
              <div
                className={
                  isMobile
                    ? "flex flex-row gap-2 items-center [&>p]:font-semibold [&>p]:text-xs w-[1200px]"
                    : "flex flex-row gap-2 items-center [&>p]:font-bold"
                }
                onMouseEnter={() => setHoveredArticulo(item)}
                onMouseLeave={() => setHoveredArticulo(null)}
              >
                <p>{item.codigo_barra}</p>
                <Tally1 />
                <p>{item.descripcion}</p>
                <Tally1 />
                <p>P. Contado</p>
                <p>{formatNumber(item.precio_venta_guaranies)}</p>-
                <p>P. Mostrador</p>
                <p>{formatNumber(item.precio_mostrador)}</p>-<p>P. Credito</p>
                <p>{formatNumber(item.precio_credito)}</p>
                <Tally1 />
                <p>Lote:</p>
                <p>{item.lote}</p>
                <Tally1 />
                {item.vencimiento_validacion === 1 ? (
                  <p
                    className={
                      item.estado_vencimiento === "VIGENTE"
                        ? "text-green-500"
                        : item.estado_vencimiento === "PROXIMO"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {item.vencimiento_lote}
                  </p>
                ) : null}
                <Tally1 />
                <p>Stock</p>
                <p>{item.cantidad_lote}</p>
              </div>
            )}
          />
          <ArticuloInfoCard
            articulo={hoveredArticulo}
            isVisible={hoveredArticulo !== null}
          />
        </div>
      </div>
      <div
        className={
          isMobile
            ? "flex flex-col gap-2 bg-white rounded-md h-[100%] shadow-sm p-2 overflow-y-auto"
            : "flex flex-col gap-2 bg-white rounded-md h-[43%] shadow-sm p-2 overflow-y-auto"
        }
      >
        <table className="w-full">
          <thead className="bg-gray-200 text-black rounded-md p-2">
            <tr className="[&>th]:p-2 [&>th]:border-r-2 [&>th]:border-y-2 [&>th]:border-gray-300">
              <th className="text-left border-l-2 border-gray-300">Codigo</th>
              <th className="text-left">Descripcion</th>
              <th>Cantidad</th>
              <th>Precio U.</th>
              <th>Descuento</th>
              <th>Exentas</th>
              <th>5%</th>
              <th>10%</th>
              <th>Lote</th>
              <th>Vence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itemParaPresupuesto.map((item) => (
              <tr
                key={item.depre_articulo}
                className="border-b-2 border-gray-300 [&>td]:p-2 [&>td]:border-r-2 [&>td]:border-gray-300"
              >
                <td>{item.depre_articulo}</td>
                <td>
                  {item.editar_nombre === 1 ? (
                    <input
                      type="text"
                      className="bg-white rounded-md p-2 w-full"
                      value={nuevaDescripcionItem}
                      onChange={(e) => setNuevaDescripcionItem(e.target.value)}
                    />
                  ) : (
                    item.descripcion
                  )}
                </td>
                <td className="text-center">{item.depre_cantidad}</td>
                <td className="text-right">
                  {formatNumber(item.depre_precio)}
                </td>
                <td className="text-right">
                  {formatNumber(item.depre_descuento)}
                </td>
                <td className="text-right">
                  {formatNumber(item.depre_exentas)}
                </td>
                <td className="text-right">{formatNumber(item.depre_cinco)}</td>
                <td className="text-right">{formatNumber(item.depre_diez)}</td>
                <td className="text-center">{item.depre_lote}</td>
                <td className="text-center">{item.depre_vence}</td>
                <td className="flex flex-row gap-2 items-center justify-center py-2">
                  <button
                    className="bg-red-600 text-white rounded-md p-2 flex flex-row gap-2 items-center justify-center hover:bg-red-700"
                    onClick={() => handleEliminarItem(item)}
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={
          isMobile
            ? mostrarFiltros
              ? "bg-blue-100 rounded-md  flex flex-col gap-2 transition-all duration-500 ease-in-out opacity-0 max-h-0 overflow-hidden pointer-events-none"
              : "flex flex-col gap-2 bg-blue-100 rounded-md h-[50%] p-2 overflow-y-auto transition-all duration-500 ease-in-out opacity-100"
            : "flex flex-row gap-2 bg-blue-100 rounded-md h-[28%] p-2 transition-all duration-500 ease-in-out opacity-100"
        }
      >
        <div className="flex flex-col gap-2 flex-1">
          <label
            htmlFor="observacion_presupuesto"
            className="text-black font-bold"
          >
            Observacion
          </label>
          <textarea
            name="observacion_presupuesto"
            id="observacion_presupuesto"
            className="bg-white rounded-md p-2 w-full h-full"
            placeholder="Observacion"
            value={observacionPresupuesto}
            onChange={(e) => setObservacionPresupuesto(e.target.value)}
          ></textarea>
        </div>
        <div
          className={
            isMobile
              ? "flex flex-row gap-2 flex-1 justify-between"
              : "flex flex-col gap-2 flex-1"
          }
        >
          <div>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-black font-bold">Mostrar Subtotal</p>
              <input
                type="checkbox"
                name="mostrar_subtotal"
                id="mostrar_subtotal"
                className="bg-white rounded-md p-2"
                checked={mostrarSubtotalCheck}
                onChange={(e) => setMostrarSubtotalCheck(e.target.checked)}
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-black font-bold">Mostrar Total</p>
              <input
                type="checkbox"
                name="mostrar_total"
                id="mostrar_total"
                className="bg-white rounded-md p-2"
                checked={mostrarTotalCheck}
                onChange={(e) => setMostrarTotalCheck(e.target.checked)}
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <p className="text-black font-bold">Mostrar Marca</p>
              <input
                type="checkbox"
                name="mostrar_total"
                id="mostrar_total"
                className="bg-white rounded-md p-2"
                checked={mostrarMarcaCheck}
                onChange={(e) => setMostrarMarcaCheck(e.target.checked)}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2 bg-white rounded-md p-2 justify-around">
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="mostrar_total"
                  id="mostrar_total"
                  className="bg-white rounded-md p-2"
                  checked={impresoraCheck}
                  onChange={(e) => {
                    setImpresoraCheck(e.target.checked);
                    setPdfCheck(false);
                  }}
                />
                <p className="text-black font-bold">Impresora</p>
              </div>
              <Printer size={isMobile ? 32 : 60} color="green" />
            </div>
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="mostrar_total"
                  id="mostrar_total"
                  className="bg-white rounded-md p-2"
                  checked={pdfCheck}
                  onChange={(e) => {
                    setPdfCheck(e.target.checked);
                    setImpresoraCheck(false);
                  }}
                />
                <p className="text-black font-bold">PDF</p>
              </div>
              <FileText size={isMobile ? 32 : 60} color="red" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div
            className={
              isMobile
                ? "flex flex-row gap-2 items-center"
                : "flex flex-col gap-2 "
            }
          >
            <label
              htmlFor="total_exentas"
              className={
                isMobile ? "text-black font-bold w-1/2" : "text-black font-bold"
              }
            >
              Total Exentas:
            </label>
            <input
              type="text"
              name="total_exentas"
              id="total_exentas"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-12 font-bold text-lg text-right text-black w-1/2"
                  : "bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalExentasFormateado}
            />
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2 items-center"
                : "flex flex-col gap-2 "
            }
          >
            <label
              htmlFor="total_cinco"
              className={
                isMobile ? "text-black font-bold w-1/2" : "text-black font-bold"
              }
            >
              Total 5%:
            </label>
            <input
              type="text"
              name="total_cinco"
              id="total_cinco"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-12 font-bold text-lg text-right text-black w-1/2"
                  : "bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalCincoFormateado}
            />
          </div>
          <div
            className={
              isMobile
                ? "flex flex-row gap-2 items-center"
                : "flex flex-col gap-2 "
            }
          >
            <label
              htmlFor="total_diez"
              className={
                isMobile ? "text-black font-bold w-1/2" : "text-black font-bold"
              }
            >
              Total 10%:
            </label>
            <input
              type="text"
              name="total_diez"
              id="total_diez"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-12 font-bold text-lg text-right text-black w-1/2"
                  : "bg-white rounded-md p-2 h-14 font-bold text-xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalDiezFormateado}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_factura" className="text-black font-bold">
              Total Factura:
            </label>
            <input
              type="text"
              name="total_factura"
              id="total_factura"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-14 font-bold text-2xl text-right text-black"
                  : "bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalPagarFormateado}
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_descuentos" className="text-black font-bold">
              Total Descuentos por Items:
            </label>
            <input
              type="text"
              name="total_descuentos"
              id="total_descuentos"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-14 font-bold text-2xl text-right text-black"
                  : "bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalDescuentoFacturaFormateado}
            />
          </div>
          {isMobile ? null : (
            <button
              className="bg-red-600 text-white rounded-md p-2"
              onClick={() => handleCancelarPresupuesto()}
            >
              <p className="text-white font-bold">Cancelar</p>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="descuento_factura" className="text-black font-bold">
              Descuento por Factura:
            </label>
            <input
              type="text"
              name="descuento_factura"
              id="descuento_factura"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-14 font-bold text-2xl text-right text-black"
                  : "bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              }
              placeholder="0.00"
              onChange={(e) => setTotalDescuentoFactura(Number(e.target.value))}
              value={totalDescuentoFacturaFormateado}
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="total_a_pagar" className="text-black font-bold">
              Total a Pagar
            </label>
            <input
              type="text"
              name="total_a_pagar"
              id="total_a_pagar"
              className={
                isMobile
                  ? "bg-white rounded-md p-2 h-14 font-bold text-2xl text-right text-black"
                  : "bg-white rounded-md p-2 h-20 font-bold text-3xl text-right text-black"
              }
              placeholder="0.00"
              disabled
              value={totalAPagarFormateado}
            />
          </div>
          {isMobile ? (
            <button
              className="bg-red-600 text-white rounded-md p-2"
              onClick={() => handleCancelarPresupuesto()}
            >
              <p className="text-white font-bold">Cancelar</p>
            </button>
          ) : null}
          <button
            className="bg-green-600 text-white rounded-md p-2"
            onClick={() => guardarPresupuesto()}
          >
            <p className="text-white font-bold">Guardar</p>
          </button>
        </div>
      </div>
      <Modal
        isOpen={isOpenDetallesVentasCliente}
        onClose={onCloseDetallesVentasCliente}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <p className="text-black font-bold">Detalles de las Ventas</p>
          </ModalHeader>
          <ModalBody>
            {clienteSeleccionado && isOpenDetallesVentasCliente && (
              <DetallesVentasCliente
                cliente={clienteSeleccionado}
                onClose={onCloseDetallesVentasCliente}
                isOpen={isOpenDetallesVentasCliente}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenPresupuestosPendientes}
        onClose={onClosePresupuestosPendientes}
        size="6xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded="md">
          <ModalHeader className="bg-blue-200 rounded-md">
            <p className="text-black font-bold">Presupuestos Pendientes</p>
          </ModalHeader>
          <ModalBody className="bg-blue-100 rounded-md">
            <PresupuestosPendientes
              onClose={onClosePresupuestosPendientes}
              onSelect={handleRecuperarPresupuesto}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenDetalleAdicional}
        onClose={onCloseDetalleAdicional}
        size="3xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded="md">
          <ModalHeader className="bg-blue-200 rounded-md">
            <p className="text-black font-bold">
              Detalle Adicional Del Presupuesto
            </p>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="bg-blue-100 rounded-md">
            <textarea
              name="detalle_adicional"
              id="detalle_adicional"
              className="bg-white rounded-md p-2 w-full min-h-[400px] focus:outline-sky-600"
              value={detalleAdicionalText}
              onChange={(e) => setDetalleAdicionalText(e.target.value)}
            ></textarea>
          </ModalBody>
          <ModalFooter className="bg-blue-200 rounded-md gap-2">
            <button
              className="bg-green-600 text-white rounded-md p-2"
              onClick={handleGuardarDetalleAdicional}
            >
              <p className="text-white font-bold">Guardar</p>
            </button>
            <button
              className="bg-red-600 text-white rounded-md p-2"
              onClick={handleCancelarDetalleAdicional}
            >
              <p className="text-white font-bold">Cancelar</p>
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ArticulosComponent
        isOpen={isArticuloModalOpen}
        setIsOpen={setIsArticuloModalOpen}
        onSelect={(articulo) => {
          handleSelectArticulo(articulo); // Llamar a la función completa
          cantidadItemInputRef.current?.focus();
        }}
        depositoInicial={depositoSeleccionado?.dep_codigo}
      />
      {isMobile ? (
        <BuscadorClientesMobile
          isOpen={isBuscadorClientesOpen}
          setIsOpen={setIsBuscadorClientesOpen}
          onSelect={(cliente: Cliente) => {
            setClienteSeleccionado(cliente);
            // Usar setTimeout para dar tiempo a que el modal se cierre
            setTimeout(() => {
              vendedorRef.current?.focus();
            }, 100);
          }}
        />
      ) : (
        <BuscadorClientes
          isOpen={isBuscadorClientesOpen}
          setIsOpen={setIsBuscadorClientesOpen}
          onSelect={(cliente: Cliente) => {
            setClienteSeleccionado(cliente);
            // Usar setTimeout para dar tiempo a que el modal se cierre
            setTimeout(() => {
              vendedorRef.current?.focus();
            }, 100);
          }}
        />
      )}
    </Box>
  );
};

export default FormularioPresupuestos;
