import { api_url } from "@/utils";
import axios from "axios";
import {
  Box,
  Heading,
  Flex,
  useMediaQuery,
  Button,
  useToast,
  ModalBody,
  IconButton,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  Modal,
  useDisclosure,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react";
import {
  FileText,
  Plus,
  X,
  Trash,
  CassetteTape,
  Coins,
  FileSearch,
} from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FloatingCard from "@/shared/modules/FloatingCard";
import ModeloTicket from "../facturacion/ModeloTicket";
import ConsultaPedidos from "../pedidos/ConsultaPedidos";
import ConsultaPresupuestos from "../presupuestos/ConsultaPresupuesto";
import ConsultaRemisiones from "../remisiones/ConsultaRemisiones";
import ResumenVentas from "../ventas/ResumenVentas";
import { createRoot } from "react-dom/client";
import ModeloFacturaNuevo from "../facturacion/ModeloFacturaNuevo";
import ModeloNotaComun from "../facturacion/ModeloNotaComun";
import Auditar from "@/shared/services/AuditoriaHook";
import { FacturaSendResponse } from "@/shared/types/factura_electronica/types";
import { useFacturacionElectronicaStore } from "@/stores/facturacionElectronicaStore";
import { useFacturaSend } from "@/shared/hooks/useFacturaSend";
import { useTipoImpresionFacturaStore } from "@/stores/tipoImpresionFacturaStore";
import ModeloFacturaReport from "../facturacion/ModeloFacturaReport";
import ArticuloInfoCard from "@/shared/modules/ArticuloInfoCard";
import BuscadorClientes from "@/shared/ui/clientes/BuscadorClientes";
import { useConfiguraciones } from "@/shared/services/configuraciones/configuracionesHook";
import { SucursalViewModel } from "@/models/viewmodels/sucursalViewModel";
import { DepositoViewModel } from "@/models/viewmodels/depositoViewModel";
import { ClienteViewModel } from "@/models/viewmodels/ClienteViewModel";
import { UsuarioViewModel } from "@/models/viewmodels/usuarioViewModel";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";
import { MetodoPago } from "@/models/viewmodels/MetodoDePago";
import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";
import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";
import { DetalleVentaDTO } from "../ventas/types/sharedDTO.type";
import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { useUsuarioPorId, useUsuarios } from "@/shared/hooks/queries/useUsuarios";
import { useClientePorDefecto, usePrecioPorDefecto, useTipoImpresion } from "@/shared/hooks/queries/useConfiguraciones";
import { useSucursales } from "@/shared/hooks/queries/useSucursales";
import { useDepositos } from "@/shared/hooks/queries/useDepositos";
import { useListaDePrecios } from "@/shared/hooks/queries/useListaDePrecios";
import { useBuscarClientes, useClientePorId } from "@/shared/hooks/queries/useClientes";
import { useArticulosBusqueda } from "@/shared/hooks/queries/articulos/useArticuloBusqueda";
import { buscarArticulos } from "@/repos/articulosApi";
import { agregarItemVenta } from "../ventas/core/services/ventasService";
import { calcularTotales } from "../ventas/core/utils/calcularTotales";
import { VentaViewModel } from "@/models/viewmodels/Ventas/VentaViewModel";
import { formatCurrency } from "../ventas/core/utils/formatCurrency";
import { useMetodosPago } from "@/shared/hooks/queries/useMetodosPago";
import { useMonedas } from "@/shared/hooks/queries/useMonedas";
import { Venta } from "@/models/dtos/Ventas/Venta";

interface VentaCliente {
  codigo: number;
  fecha: string;
  factura: string;
  total: number;
  saldo: number;
  descuento: number;
  estado: number;
  estado_desc: string;
  condicion: string;
  vendedor: string;
}

interface DetalleVentaCliente {
  det_codigo: number;
  codbarra: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  lote: string;
}

interface OpcionesFinalizacionVenta {
  tipo_venta: "CONTADO" | "CREDITO";
  tipo_documento: "FACTURA" | "TICKET";
  nro_factura?: string;
  nro_establecimiento?: number;
  nro_emision?: number;
  timbrado?: string;
  fecha_vencimiento_timbrado?: string;
  cantidad_cuotas?: number;
  entrega_inicial?: number;
  observacion?: string;
}



interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PresupuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RemisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PuntoDeVentaNuevo = () => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<SucursalViewModel | null>(null);

  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<DepositoViewModel | null>(null);

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<ClienteViewModel | null>(null);

  const [vendedorSeleccionado, setVendedorSeleccionado] =
    useState<UsuarioViewModel | null>(null);

  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<MetodoPago | null>(null);
  const [precioSeleccionado, setPrecioSeleccionado] =
    useState<ListaPrecio | null>(null);

  const [cantidad, setCantidad] = useState(1);

  const [articuloBusqueda, setArticuloBusqueda] = useState<string>("");
  const [articuloBusquedaId, setArticuloBusquedaId] = useState<string | null>(
    null
  );
  const [vendedorBusqueda, setVendedorBusqueda] = useState<number | null>(null);
  const [clienteBusqueda, setClienteBusqueda] = useState<string>("");

  const [descuento, setDescuento] = useState<number>(0);

  const [isArticuloCardVisible, setIsArticuloCardVisible] =
    useState<boolean>(false);
  const [, setIsVendedorCardVisible] = useState<boolean>(false);
  const [isClienteCardVisible, setIsClienteCardVisible] =
    useState<boolean>(false);

  const [ventaDTO, setVentaDTO] = useState<Venta>(
    {
      codigo: 0,
      fecha: new Date(),
      operador: 0,
      deposito: 0,
      moneda: 1,
      factura: "",
      credito: 0,
      saldo: 0,
      total: 0,
      devolucion: 0,
      procesado: 0,
      descuento: 0,
      cuotas: 0,
      cantCuotas: 0,
      obs: "Venta desde dispositivo móvil",
      vendedor: 0,
      sucursal: 0,
      metodo: 1,
      aplicarA: 0,
      retencion: 0,
      timbrado: "",
      codeudor: 1,
      pedido: 0,
      hora: new Date().toLocaleTimeString(),
      userPc: "",
      situacion: 1,
      chofer: 0,
      cdc: "",
      qr: "",
      kmActual: 0,
      vehiculo: 0,
      descTrabajo: "",
      kilometraje: 0,
      mecanico: 0,
      servicio: 0,
      siniestro: '',
      cliente: 0,
      vencimiento: undefined,
      estado: 1,
      cajaDefinicion: undefined,
      confOperacion: undefined,
    }
  );

  const [itemsParaVenta, setItemsParaVenta] = useState<DetalleVenta[]>([]);
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);

  const [ultimaVentaId, setUltimaVentaId] = useState<number | null>(null);

  const busquedaInputRef = useRef<HTMLInputElement>(null);
  const descuentoInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);

  const clienteKCInputRef = useRef<HTMLInputElement>(null);
  const tipoDocumentoKCInputRef = useRef<HTMLInputElement>(null);
  const tipoVentaKCInputRef = useRef<HTMLInputElement>(null);
  const montoEntregadoKCInputRef = useRef<HTMLInputElement>(null);

  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticuloBusqueda | null>(null);

  const [montoEntregado, setMontoEntregado] = useState<number | null>(null);
  const [montoEntregadoDolar, setMontoEntregadoDolar] = useState<number | null>(
    null
  );
  const [montoEntregadoReal, setMontoEntregadoReal] = useState<number | null>(
    null
  );
  const [montoEntregadoPeso, setMontoEntregadoPeso] = useState<number | null>(
    null
  );

  const [hoveredArticulo, setHoveredArticulo] =
    useState<ArticuloBusqueda | null>(null);


  const [cuotasList, setCuotasList] = useState<
    Array<{
      fecha: string;
      valor: number;
      saldo: number;
    }>
  >([]);

  const [isBuscadorClientesOpen, setIsBuscadorClientesOpen] =
    useState<boolean>(false);
  const searchTimeOutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isOpen: isConsultaVentasOpen,
    onOpen: onOpenConsultaVentas,
    onClose: onCloseConsultaVentas,
  } = useDisclosure();

  const {
    isOpen: isKCOpen,
    onOpen: onKCOpen,
    onClose: onCloseKCOpen,
  } = useDisclosure();

  const {
    isOpen: isPedidoModalOpen,
    onOpen: onPedidoModalOpen,
    onClose: onPedidoModalClose,
  } = useDisclosure();

  const {
    isOpen: isPresupuestoModalOpen,
    onOpen: onPresupuestoModalOpen,
    onClose: onPresupuestoModalClose,
  } = useDisclosure();

  const {
    isOpen: isRemisionModalOpen,
    onOpen: onRemisionModalOpen,
    onClose: onRemisionModalClose,
  } = useDisclosure();

  const {
    isOpen: isEditarVentaOpen,
    onOpen: onEditarVentaOpen,
    onClose: onEditarVentaClose,
  } = useDisclosure();

  const [buscarItemsConStock, setBuscarItemsConStock] = useState<boolean>(false);
  const [busquedaPorScanner, setBusquedaPorScanner] = useState<boolean>(true);
  const [, setCodigoBarrasBuffer] = useState<string>("");

  const [numeroPedido, setNumeroPedido] = useState<number | null>(null);

  const [, setNumeroPresupuesto] = useState<number | null>(null);

  const [ventaIdEdicion, setVentaIdEdicion] = useState<number | null>(null);
  const [clienteBusquedaId, setClienteBusquedaId] = useState<number | null>(
    null
  );

  const permisos_descuento = JSON.parse(
    sessionStorage.getItem("permisos_descuento") || "[]"
  );


  const { data: tipoImpresionDoc } = useTipoImpresion();

  const [tipoImpresionFactura, setTipoImpresionFactura] = useState<
    number | null
  >(null);

  const cajero_id = sessionStorage.getItem("user_id");

  const [imprimirFactura, setImprimirFactura] = useState<boolean>(true);
  const [imprimirTicket, setImprimirTicket] = useState<boolean>(false);
  const [imprimirNotaInterna, setImprimirNotaInterna] =
    useState<boolean>(false);

  const [opcionesFinalizacion, setOpcionesFinalizacion] =
    useState<OpcionesFinalizacionVenta>({
      tipo_venta: "CONTADO",
      tipo_documento: tipoImpresionDoc?.id === 1 ? "FACTURA" : "TICKET",
      cantidad_cuotas: 1,
      entrega_inicial: 0,
      fecha_vencimiento_timbrado: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      )
        .toISOString()
        .split("T")[0],
    });
  const toast = useToast();
  const { data: sucursales } = useSucursales({ operador: cajero_id ? parseInt(cajero_id) : 0 });
  const { data: depositos } = useDepositos();
  const { data: listaPrecios } = useListaDePrecios();
  const { data: vendedorPorDefecto } = useUsuarioPorId(cajero_id ? parseInt(cajero_id) : 1)
  const { data: clientePorDefecto } = useClientePorDefecto();
  const { data: clientePorId } = useClientePorId(clienteBusquedaId ?? 1)
  const { data: precioPorDefecto } = usePrecioPorDefecto();
  const { data: articulos, isLoading: loadingArticulos, isError: errorArticulos } = useArticulosBusqueda(
    {
      deposito: depositoSeleccionado?.dep_codigo,
      stock: buscarItemsConStock,
      moneda: monedaSeleccionada?.moCodigo,
      busqueda: articuloBusqueda
    }
  )
  const { data: clientes } = useBuscarClientes(clienteBusqueda)
  const { data: metodosPago } = useMetodosPago();
  const { data: monedas } = useMonedas()

  const { total, totalDescuentos, totalAPagar, totalDolares, totalReales, totalPesos } = calcularTotales(itemsParaVenta);


  const cotizacionDolar = 7300;
  const cotizacionPeso = 10;
  const cotizacionReal = 1300;

  useEffect(() => {
    if (precioPorDefecto && listaPrecios) {
      console.log("buscando precio", precioPorDefecto)
      const precioEncontrado = listaPrecios.find(precio => precio.lpCodigo === Number(precioPorDefecto.valor));
      if (precioEncontrado) {
        console.log("precio encontrado y seleccionado", precioEncontrado)
        setPrecioSeleccionado(precioEncontrado);
      }
    }
  }, [precioPorDefecto, listaPrecios]);

  //efecto para seleccionar por defecto un cliente
  useEffect(() => {
    if (clientes) {
      const clientePreseleccionado = clientes.find(cli => cli.cli_codigo === clientePorDefecto?.id)
      if (clientePreseleccionado) {
        setClienteSeleccionado(clientePreseleccionado)
      }
    }
  }, [clientes])

  // efecto para seleccionar un cliente cada que cambie el buscador por id
  useEffect(() => {
    if (clientePorId) setClienteSeleccionado(clientePorId)
  }, [clientePorId])



  // efecto para seleccioanr al cajero por defecto
  useEffect(() => {
    if (vendedorPorDefecto) setVendedorSeleccionado(vendedorPorDefecto)
  }, [vendedorPorDefecto])

  useEffect(() => {
    if (sucursales) setSucursalSeleccionada(sucursales[0])
  }, [sucursales])

  useEffect(() => {
    if (clienteSeleccionado) {
      setVentaDTO(prevState => ({
        ...prevState,
        cliente: clienteSeleccionado?.cli_codigo
      }))
    }
    if (vendedorSeleccionado) {
      setVentaDTO(prevState => ({
        ...prevState,
        vendedor: vendedorSeleccionado.op_codigo,
        operador: vendedorSeleccionado.op_codigo,
        userPc: `Dispositivo de ${vendedorSeleccionado.op_nombre}`
      }));
    }
    if (sucursalSeleccionada) {
      setVentaDTO(prevState => ({
        ...prevState,
        sucursal: sucursalSeleccionada.id
      }));
    }
    if (depositoSeleccionado) {
      setVentaDTO(prevState => ({
        ...prevState,
        deposito: depositoSeleccionado.dep_codigo
      }));
    }
    if (monedaSeleccionada) {
      setVentaDTO(prevState => ({
        ...prevState,
        moneda: monedaSeleccionada.moCodigo
      }));
    }

  }, [clientePorDefecto, vendedorSeleccionado, sucursalSeleccionada, depositoSeleccionado]);


  useEffect(() => {
    setVentaDTO(prevState => ({
      ...prevState,
      total: total
    }));
  }, [total]);

  useEffect(() => {
    console.log('ventaDTO', ventaDTO)
    console.log('detalleVenta', itemsParaVenta)
  }, [itemsParaVenta, ventaDTO])

  // const obtenerDatosFacturacion = async () => {
  //   try {
  //     const response = await axios.get(`${api_url}definicion-ventas/timbrado`, {
  //       params: {
  //         usuario: operador,
  //       },
  //     });

  //     console.log(response.data.body);
  //     setOpcionesFinalizacion({
  //       ...opcionesFinalizacion,
  //       nro_establecimiento: response.data.body[0].d_establecimiento,
  //       nro_emision: response.data.body[0].d_p_emision,
  //       nro_factura: response.data.body[0].d_nro_secuencia + 1,
  //       timbrado: response.data.body[0].d_nrotimbrado,
  //     });
  //     setD_codigo(response.data.body[0].d_codigo);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };


  const handleBuscarArticulo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setArticuloBusqueda(busqueda);
    setArticuloSeleccionado(null);

    // Limpiar el timeout anterior si existe
    if (searchTimeOutRef.current) {
      clearTimeout(searchTimeOutRef.current);
    }

    // Si el input está vacío, limpiar resultados inmediatamente
    if (busqueda.length === 0) {
      setIsArticuloCardVisible(false);
      return;
    }

    // Configurar un nuevo timeout para la búsqueda
    searchTimeOutRef.current = setTimeout(() => {
      setIsArticuloCardVisible(true);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir
  };

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeOutRef.current) {
        clearTimeout(searchTimeOutRef.current);
      }
    };
  }, []);

  const handleBuscarArticuloPorId = async (codigo: string) => {
    try {
      const response = await buscarArticulos(
        undefined,
        undefined,
        codigo,
        monedaSeleccionada?.moCodigo,
        buscarItemsConStock,
        depositoSeleccionado?.dep_codigo,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )

      if (response && response.length > 0) {
        const articulo = response[0];
        const nuevoItem = agregarItemVenta(itemsParaVenta, {
          articulo,
          cantidad: cantidad || 1,
          precioSeleccionado: precioSeleccionado!,
          depositoSeleccionado: depositoSeleccionado!,
          sucursalSeleccionada: sucursalSeleccionada!,
          vendedorSeleccionado: vendedorSeleccionado!,
          precioUnitario,
          descuento,
        });
        if (nuevoItem.ok) {
          setTimeout(() => {
            setArticuloBusquedaId("");
            setCodigoBarrasBuffer("");
            busquedaPorIdInputRef.current?.focus();
          }, 100); // Pequeño delay para que se vea el código antes de limpiarlo
        }
      } else {
        toast({
          title: "Artículo no encontrado",
          description: "No se encontró ningún artículo con ese código",
          status: "warning",
          duration: 3000,
        });
        // Limpiamos después de mostrar el error
        setTimeout(() => {
          setArticuloBusquedaId("");
          setCodigoBarrasBuffer("");
          busquedaPorIdInputRef.current?.focus();
        }, 1000); // Delay más largo para que se pueda ver el código que causó el error
      }
    } catch (error) {
      console.error("Error al buscar artículo:", error);
      toast({
        title: "Error",
        description: "Hubo un error al buscar el artículo",
        status: "error",
        duration: 3000,
      });
      // Limpiamos después de mostrar el error
      setTimeout(() => {
        setArticuloBusquedaId("");
        setCodigoBarrasBuffer("");
        busquedaPorIdInputRef.current?.focus();
      }, 1000);
    }
  };

  const handleBuscarCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setClienteBusqueda(busqueda);

    // Si el input está vacío, limpiamos la selección
    if (busqueda === "") {
      setClienteSeleccionado(null);
    }

    if (busqueda.length >= 0) {
      setIsClienteCardVisible(true);
    } else {
      setIsClienteCardVisible(false);
    }
  };

  const handleBuscarClientePorId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    if (busqueda.length > 0) {
      setClienteBusquedaId(Number(busqueda));
    } else {
      setClienteSeleccionado(null);
      setClienteBusqueda("");
    }
  };

  const handleBuscarVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsVendedorCardVisible(true);
    const busqueda = e.target.value;
    setVendedorBusqueda(Number(busqueda));
  };

  const handleSelectArticulo = (articulo: ArticuloBusqueda) => {
    setArticuloSeleccionado(articulo);
    setIsArticuloCardVisible(false);
    setHoveredArticulo(null);
    setArticuloBusqueda("");
    setArticuloBusquedaId("");
  };

  const handleSelectCliente = (cliente: ClienteViewModel) => {
    setClienteSeleccionado(cliente);
    setClienteBusqueda(cliente.cli_razon);
    setIsClienteCardVisible(false);
  };

  const handleAgregarItem = (cantidad: number, articulo?: ArticuloBusqueda,) => {
    if (!articulo) {
      return;
    }
    const resultado = agregarItemVenta(itemsParaVenta, {
      articulo,
      cantidad: cantidad || 1,
      precioSeleccionado: precioSeleccionado!,
      depositoSeleccionado: depositoSeleccionado!,
      sucursalSeleccionada: sucursalSeleccionada!,
      vendedorSeleccionado: vendedorSeleccionado!,
      precioUnitario,
      descuento,
    });

    if (!resultado.ok) {
      toast({
        title: "Error",
        description: resultado.error,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setItemsParaVenta(resultado.detalleVenta!);
    setCantidad(1);
    setPrecioUnitario(0);
    setDescuento(0);
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (articuloSeleccionado) {
        handleAgregarItem(cantidad, articuloSeleccionado);
        busquedaPorIdInputRef.current?.focus();
      } else if (hoveredArticulo) {
        handleSelectArticulo(hoveredArticulo);
        setHoveredArticulo(null);
      } else if (articulos && articulos?.length > 0) {
        handleSelectArticulo(articulos[0]);
      }
    } else if (articulos && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const currentIndex = hoveredArticulo
        ? articulos.findIndex((a) => a.idLote === hoveredArticulo.idLote)
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
  const handleDescuentoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      cantidadInputRef.current?.focus();
    }
  };

  const handleCantidadKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (articuloSeleccionado) {
        handleAgregarItem(cantidad, articuloSeleccionado);
      }
      setCantidad(1);
      setDescuento(0);
      busquedaPorIdInputRef.current?.focus();
    }
  };

  const handleCancelarVenta = () => {
    setMontoEntregado(0);
    setMontoEntregadoDolar(0);
    setMontoEntregadoReal(0);
    setMontoEntregadoPeso(0);
    setItemsParaVenta([]);
    setArticuloSeleccionado(null);
    setArticuloBusqueda("");
    setCantidad(1);
    setDescuento(0);
    setClienteBusqueda("");
    setClienteBusquedaId(0);
  };
  // const totalExentas = itemsParaVenta.reduce(
  //   (total, item) => total + item.deve_exentas,
  //   0
  // );
  // const totalCinco = itemsParaVenta.reduce(
  //   (total, item) => total + item.deve_cinco,
  //   0
  // );
  // const totalDiez = itemsParaVenta.reduce(
  //   (total, item) => total + item.deve_diez,
  //   0
  // );
  // const totalItems = itemsParaVenta.reduce(
  //   (total, item) => total + item.deve_cantidad,
  //   0
  // );
  // const totalPagar = itemsParaVenta.reduce(
  //   //siempre en la moneda seleccionada
  //   (total, item) => total + item.deve_precio * item.deve_cantidad,
  //   0
  // );

  // const totalPagarGuaranies = itemsParaVenta.reduce(
  //   (total, item) => total + item.precio_guaranies * item.deve_cantidad,
  //   0
  // );
  // const totalPagarDolares = itemsParaVenta.reduce(
  //   (total, item) => total + item.precio_dolares * item.deve_cantidad,
  //   0
  // );
  // const totalPagarReales = itemsParaVenta.reduce(
  //   (total, item) => total + item.precio_reales * item.deve_cantidad,
  //   0
  // );
  // const totalPagarPesos = itemsParaVenta.reduce(
  //   (total, item) => total + item.precio_pesos * item.deve_cantidad,
  //   0
  // );

  // const totalDescuentoItems = itemsParaVenta.reduce(
  //   (total, item) =>
  //     total +
  //     (item.deve_descuento * item.deve_precio * item.deve_cantidad) / 100,
  //   0
  // );
  // const totalDescuentoFactura = 0;
  // const totalDescuento = totalDescuentoItems + totalDescuentoFactura;

  // const totalPagarFinal = totalPagar - totalDescuento; //siempre en la moneda seleccionada

  // // const porcentajeDescuento = (totalDescuento / totalPagar) * 100;

  // // Formatear los números con 2 decimales y separador de miles
  // const formatNumber = (num: number | string) => {
  //   // Convertir a número si es string
  //   const numValue = typeof num === "string" ? Number(num) : num;

  //   // Definir la cantidad de decimales según la moneda
  //   const decimals = monedaSeleccionada?.mo_codigo === 1 ? 0 : 2;

  //   // Formatear según la configuración regional y la cantidad de decimales
  //   return numValue.toLocaleString("es-PY", {
  //     minimumFractionDigits: decimals,
  //     maximumFractionDigits: decimals,
  //   });
  // };

  // const formatearDivisasExtranjeras = (num: number) => {
  //   return num.toLocaleString("es-PY", {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });
  // };

  // const totalExentasFormateado = formatNumber(totalExentas);
  // const totalCincoFormateado = formatNumber(totalCinco);
  // const totalDiezFormateado = formatNumber(totalDiez);
  // const totalItemsFormateado = formatNumber(totalItems);
  // const totalPagarFormateado = formatNumber(totalPagar);
  // const totalDescuentoItemsFormateado = formatNumber(totalDescuentoItems);
  // const totalDescuentoFormateado = formatNumber(totalDescuento);
  // const totalDolaresFormateado = (
  //   totalesVenta.dolares
  // );
  // const totalRealesFormateado = formatearDivisasExtranjeras(
  //   totalesVenta.reales
  // );
  // const totalPesosFormateado = formatearDivisasExtranjeras(totalesVenta.pesos);
  // // const porcentajeDescuentoFormateado = porcentajeDescuento;
  // const totalEnGuaraniesFormateado = formatNumber(totalesVenta.guaranies);

  const ResumenVentasCliente = ({
    cliente,
    onClose,
    isModal,
  }: {
    cliente: ClienteViewModel;
    onClose: () => void;
    isModal: boolean;
  }) => {
    const [ventas, setVentas] = useState<VentaCliente[]>([]);
    const [detalleVenta, setDetalleVenta] = useState<DetalleVentaCliente[]>([]);
    const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(
      null
    );
    const toast = useToast();

    const fetchVentasCliente = async () => {
      try {
        const response = await axios.post(`${api_url}venta/consultas`, {
          cliente: cliente.cli_codigo,
          estadoVenta: 3,
        });
        setVentas(response.data.body);
      } catch (error) {
        toast({
          title: "Error al cargar las ventas",
          description: "No se pudieron cargar las ventas del cliente",
          status: "error",
          duration: 3000,
        });
      }
    };

    const fetchDetalleVenta = async (codigo: number) => {
      try {
        const response = await axios.get(
          `${api_url}venta/detalles?cod=${codigo}`
        );
        setDetalleVenta(response.data.body);
      } catch (error) {
        toast({
          title: "Error al cargar el detalle",
          description: "No se pudo cargar el detalle de la venta",
          status: "error",
          duration: 3000,
        });
      }
    };

    useEffect(() => {
      fetchVentasCliente();
    }, [cliente]);

    const setColor = (estado: number) => {
      if (estado === 2) return "bg-pink-200"; // anulado
      return "bg-white";
    };

    return (
      <Box h="full" p={4} display="flex" flexDirection="column" gap={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Últimas ventas de {cliente.cli_razon}</Heading>
          <IconButton
            aria-label="Cerrar"
            icon={<X />}
            onClick={onClose}
            variant="ghost"
          />
        </Flex>

        <Box flex={1} overflow="auto">
          <Box mb={4} maxH="50%" overflow="auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr className="[&>th]:p-2 text-left">
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Factura</th>
                  <th>Total</th>
                  <th>Saldo</th>
                  <th>Descuento</th>
                  <th>Condición</th>
                  <th>Vendedor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr
                    key={venta.codigo}
                    className={`${setColor(
                      venta.estado
                    )} hover:bg-gray-50 cursor-pointer ${ventaSeleccionada === venta.codigo ? "bg-blue-100" : ""
                      }`}
                    onClick={() => {
                      setVentaSeleccionada(venta.codigo);
                      fetchDetalleVenta(venta.codigo);
                    }}
                  >
                    <td className="p-2">{venta.codigo}</td>
                    <td className="p-2">{venta.fecha}</td>
                    <td className="p-2">{venta.factura}</td>
                    <td className="p-2 text-right">
                      {venta.total.toLocaleString("es-PY")}
                    </td>
                    <td className="p-2 text-right">
                      {venta.saldo.toLocaleString("es-PY")}
                    </td>
                    <td className="p-2 text-right">
                      {venta.descuento.toLocaleString("es-PY")}
                    </td>
                    <td className="p-2">{venta.condicion}</td>
                    <td className="p-2">{venta.vendedor}</td>
                    <td className="p-2">{venta.estado_desc}</td>
                    <td>
                      {isModal && (
                        <Button
                          onClick={() => {
                            onEditarVentaOpen();
                          }}
                        >
                          Editar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          {ventaSeleccionada && (
            <Box>
              <Heading size="sm" mb={2}>
                Detalle de la venta
              </Heading>
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr className="[&>th]:p-2 text-left">
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Subtotal</th>
                    <th>Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleVenta.map((detalle) => (
                    <tr key={detalle.det_codigo} className="hover:bg-gray-50">
                      <td className="p-2">{detalle.codbarra}</td>
                      <td className="p-2">{detalle.descripcion}</td>
                      <td className="p-2 text-right">{detalle.cantidad}</td>
                      <td className="p-2 text-right">
                        {detalle.precio.toLocaleString("es-PY")}
                      </td>
                      <td className="p-2 text-right">{detalle.descuento}%</td>
                      <td className="p-2 text-right">
                        {(
                          detalle.precio *
                          detalle.cantidad *
                          (1 - detalle.descuento / 100)
                        ).toLocaleString("es-PY")}
                      </td>
                      <td className="p-2">{detalle.lote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const calcularCuotas = useCallback(() => {
    if (
      !opcionesFinalizacion.cantidad_cuotas ||
      !opcionesFinalizacion.fecha_vencimiento_timbrado ||
      !totalAPagar
    ) {
      setCuotasList([]);
      return;
    }

    const montoTotal =
      totalAPagar - (opcionesFinalizacion.entrega_inicial || 0);
    const valorCuota = Math.ceil(
      montoTotal / opcionesFinalizacion.cantidad_cuotas
    );
    const fechaInicial = new Date(
      opcionesFinalizacion.fecha_vencimiento_timbrado
    );

    const nuevasCuotas = [];
    let saldoRestante = montoTotal;

    for (let i = 0; i < opcionesFinalizacion.cantidad_cuotas; i++) {
      const fechaCuota = new Date(fechaInicial);
      fechaCuota.setMonth(fechaInicial.getMonth() + i);

      nuevasCuotas.push({
        fecha: fechaCuota.toISOString().split("T")[0],
        valor: valorCuota,
        saldo: saldoRestante - valorCuota,
      });

      saldoRestante -= valorCuota;
    }

    setCuotasList(nuevasCuotas);
  }, [
    opcionesFinalizacion.cantidad_cuotas,
    opcionesFinalizacion.fecha_vencimiento_timbrado,
    opcionesFinalizacion.entrega_inicial,
    totalAPagar,
  ]);

  // Agregar este efecto para recalcular las cuotas cuando cambien los valores relevantes
  useEffect(() => {
    calcularCuotas();
  }, [calcularCuotas]);

  // const finalizarVenta = async () => {
  //   try {
  //     if (itemsParaVenta.length === 0) {
  //       toast({
  //         title: "Error",
  //         description: "No se han seleccionado articulos para la venta",
  //         status: "error",
  //         duration: 3000,
  //       });
  //       return;
  //     }
  //     if (!clienteSeleccionado) {
  //       toast({
  //         title: "Error",
  //         description: "No se ha seleccionado un cliente",
  //         status: "error",
  //         duration: 3000,
  //       });
  //       return;
  //     }
  //     if (!vendedorSeleccionado) {
  //       toast({
  //         title: "Error",
  //         description: "No se ha seleccionado un vendedor",
  //         status: "error",
  //         duration: 3000,
  //       });
  //       return;
  //     }

  // const documentoTipo = (() => {
  //   switch (clienteSeleccionado.cli_tipo_doc) {
  //     case 1:
  //       return 1;
  //     case 2:
  //       return 1;
  //     case 3:
  //       return 2;
  //     case 4:
  //       return 3;
  //     case 5:
  //       return 1;
  //     case 6:
  //       return 6;
  //     case 7:
  //       return 9;
  //     case 8:
  //       return 1;
  //   }
  // })();

  // const dataFacturaSend: FacturaSendResponse = {
  //   tipoDocumento: 1,
  //   establecimiento: opcionesFinalizacion.nro_establecimiento || 0,
  //   punto: opcionesFinalizacion.nro_emision || 0,
  //   numero: opcionesFinalizacion.nro_factura || 0,
  //   observacion: "",
  //   fecha: new Date().toISOString().split(".")[0],
  //   tipoEmision: 1,
  //   tipoTransaccion: 1,
  //   tipoImpuesto: 1,
  //   moneda:
  //     monedaSeleccionada?.moCodigo === 1
  //       ? "PYG"
  //       : monedaSeleccionada?.moCodigo === 2
  //         ? "USD"
  //         : monedaSeleccionada?.moCodigo === 3
  //           ? "BRL"
  //           : monedaSeleccionada?.moCodigo === 4
  //             ? "ARS"
  //             : "PYG",
  //   cambio: monedaSeleccionada?.moCodigo != 1 ? cotizacionDolar : 0,
  //   cliente: {
  //     contribuyente:
  //       clienteSeleccionado.cli_tipo_doc === 1 ||
  //         clienteSeleccionado.cli_tipo_doc === 18
  //         ? true
  //         : false,
  //     ruc:
  //       clienteSeleccionado.cli_tipo_doc === 1
  //         ? clienteSeleccionado.cli_ruc
  //         : null,
  //     razonSocial: clienteSeleccionado.cli_razon,
  //     nombreFantasia: clienteSeleccionado.cli_descripcion,
  //     tipoOperacion:
  //       clienteSeleccionado.cli_tipo_doc === 1
  //         ? 1
  //         : clienteSeleccionado.cli_tipo_doc === 18
  //           ? 3
  //           : 2,
  //     numeroCasa: "001",
  //     departamento: clienteSeleccionado.cli_departamento || 1,
  //     departamentoDescripcion: clienteSeleccionado.dep_descripcion || "",
  //     distrito: clienteSeleccionado.cli_distrito || 1,
  //     distritoDescripcion:
  //       clienteSeleccionado.cli_distrito_descripcion || "",
  //     direccion: clienteSeleccionado.cli_dir || "",
  //     ciudad: clienteSeleccionado.cli_ciudad || 1,
  //     ciudadDescripcion: clienteSeleccionado.cli_ciudad_descripcion || "",
  //     pais: "PRY",
  //     paisDescripcion: "Paraguay",
  //     tipoContribuyente: 1,
  //     documentoTipo: documentoTipo,
  //     telefono: clienteSeleccionado.cli_tel || "",
  //     celular: clienteSeleccionado.cli_tel || "",
  //     email: clienteSeleccionado.cli_mail || "",
  //     codigo: clienteSeleccionado.cli_interno,
  //   },
  //   usuario: {
  //     documentoTipo: 1,
  //     documentoNumero: vendedorSeleccionado?.op_documento || "",
  //     nombre: vendedorSeleccionado?.op_nombre || "",
  //     cargo: "Vendedor",
  //   },
  //   factura: {
  //     presencia: 1,
  //   },
  //   // condicion: {
  //   //   tipo: opcionesFinalizacion.tipo_venta === "CREDITO" ? 2 : 1,
  //   //   entregas:
  //   //     opcionesFinalizacion.tipo_venta === "CONTADO"
  //   //       ? [
  //   //           {
  //   //             tipo: 1, // Efectivo
  //   //             monto: totalPagarFinal.toString(),
  //   //             moneda:
  //   //               monedaSeleccionada?.mo_codigo === 1
  //   //                 ? "PYG"
  //   //                 : monedaSeleccionada?.mo_codigo === 2
  //   //                 ? "USD"
  //   //                 : monedaSeleccionada?.mo_codigo === 3
  //   //                 ? "BRL"
  //   //                 : monedaSeleccionada?.mo_codigo === 4
  //   //                 ? "ARS"
  //   //                 : "PYG",
  //   //             cambio: 0.0,
  //   //           },
  //   //         ]
  //   //       : [],
  //   //   credito:
  //   //     opcionesFinalizacion.tipo_venta === "CREDITO"
  //   //       ? {
  //   //           tipo: 1, // Plazo
  //   //           plazo: `${
  //   //             opcionesFinalizacion.cantidad_cuotas || 1
  //   //           } cuotas`,
  //   //           cuotas: opcionesFinalizacion.cantidad_cuotas || 1,
  //   //           infoCuotas: Array.from(
  //   //             { length: opcionesFinalizacion.cantidad_cuotas || 1 },
  //   //             (_, i) => {
  //   //               const montoTotal =
  //   //                 totalPagarFinal -
  //   //                 (opcionesFinalizacion.entrega_inicial || 0);
  //   //               const montoCuota =
  //   //                 montoTotal /
  //   //                 (opcionesFinalizacion.cantidad_cuotas || 1);
  //   //               const fechaVencimiento = new Date();
  //   //               fechaVencimiento.setDate(
  //   //                 fechaVencimiento.getDate() + 30 * (i + 1)
  //   //               );

  //   //               return {
  //   //                 moneda:
  //   //                   monedaSeleccionada?.mo_codigo === 1
  //   //                     ? "PYG"
  //   //                     : monedaSeleccionada?.mo_codigo === 2
  //   //                     ? "USD"
  //   //                     : monedaSeleccionada?.mo_codigo === 3
  //   //                     ? "BRL"
  //   //                     : monedaSeleccionada?.mo_codigo === 4
  //   //                     ? "ARS"
  //   //                     : "PYG",
  //   //                 monto: montoCuota,
  //   //                 vencimiento: fechaVencimiento
  //   //                   .toISOString()
  //   //                   .split("T")[0],
  //   //               };
  //   //             }
  //   //           ),
  //   //         }
  //   //       : null,
  //   // },
  //   condicion: {
  //     tipo: opcionesFinalizacion.tipo_venta === "CREDITO" ? 2 : 1,

  //     // Para CONTADO
  //     entregas:
  //       opcionesFinalizacion.tipo_venta === "CONTADO"
  //         ? [
  //           {
  //             tipo: 1, // Efectivo
  //             monto: totalAPagar.toString(),
  //             moneda:
  //               monedaSeleccionada?.moCodigo === 1
  //                 ? "PYG"
  //                 : monedaSeleccionada?.moCodigo === 2
  //                   ? "USD"
  //                   : monedaSeleccionada?.moCodigo === 3
  //                     ? "BRL"
  //                     : monedaSeleccionada?.moCodigo === 4
  //                       ? "ARS"
  //                       : "PYG",
  //             monedaDescripcion:
  //               monedaSeleccionada?.moCodigo || "Guaraníes",
  //             cambio:
  //               monedaSeleccionada?.moCodigo != 1 ? cotizacionDolar : 0,
  //           },
  //         ]
  //         : [],

  //     // Para CRÉDITO
  //     credito:
  //       opcionesFinalizacion.tipo_venta === "CREDITO"
  //         ? {
  //           tipo: 1, // Plazo
  //           plazo: `${opcionesFinalizacion.cantidad_cuotas || 1} cuotas`,
  //           cuotas: opcionesFinalizacion.cantidad_cuotas || 1,
  //           montoEntrega: opcionesFinalizacion.entrega_inicial || 0,
  //           infoCuotas: Array.from(
  //             { length: opcionesFinalizacion.cantidad_cuotas || 1 },
  //             (_) => {
  //               return {
  //                 moneda:
  //                   monedaSeleccionada?.mo_codigo === 1
  //                     ? "PYG"
  //                     : monedaSeleccionada?.mo_codigo === 2
  //                       ? "USD"
  //                       : monedaSeleccionada?.mo_codigo === 3
  //                         ? "BRL"
  //                         : monedaSeleccionada?.mo_codigo === 4
  //                           ? "ARS"
  //                           : "PYG",
  //                 monto: 0,
  //                 vencimiento: "",
  //               };
  //             }
  //           ),
  //         }
  //         : null,
  //   },
  //   items: itemsParaVenta.map((item) => {
  //     // Variables para el cálculo de IVA
  //     let ivaTipo = 1; // Por defecto, Gravado IVA
  //     let ivaBase = 100;
  //     let ivaPorcentaje = 10;
  //     let IVa5 = 0;
  //     let IVa10 = 0;
  //     let vartotal = 0;
  //     let VGravada = 0;
  //     let vporc = 0;
  //     if (item.deve_cinco > 0 && item.deve_exentas > 0) {
  //       // CASE vcinco > 0 AND vexentas > 0
  //       IVa5 = Math.round((item.deve_cinco / 21) * 100) / 100;
  //       vartotal = item.deve_cinco + item.deve_exentas - IVa5;
  //       ivaTipo = 4;
  //       ivaPorcentaje = 5;
  //       VGravada = Math.round((item.deve_cinco / 1.05) * 100) / 100;
  //       vporc = (VGravada * 100) / vartotal;
  //       ivaBase = parseFloat(vporc.toFixed(8));
  //     } else if (item.deve_diez > 0 && item.deve_exentas > 0) {
  //       // CASE vdiez > 0 AND vexentas > 0
  //       IVa10 = Math.round((item.deve_diez / 11) * 100) / 100;
  //       vartotal = item.deve_diez + item.deve_exentas - IVa10;
  //       ivaTipo = 4;
  //       ivaPorcentaje = 10;
  //       VGravada = Math.round((item.deve_diez / 1.1) * 100) / 100;
  //       vporc = (VGravada * 100) / vartotal;
  //       ivaBase = parseFloat(vporc.toFixed(8));
  //     } else if (item.deve_cinco > 0) {
  //       // CASE vcinco > 0
  //       ivaTipo = 1;
  //       ivaPorcentaje = 5;
  //       ivaBase = 100;
  //     } else if (item.deve_diez > 0) {
  //       // CASE vdiez > 0
  //       ivaTipo = 1;
  //       ivaPorcentaje = 10;
  //       ivaBase = 100;
  //     } else if (
  //       item.deve_cinco === 0 &&
  //       item.deve_diez === 0 &&
  //       item.deve_exentas > 0
  //     ) {
  //       // Caso para productos exentos
  //       ivaTipo = 3; // Exento
  //       ivaPorcentaje = 0;
  //       ivaBase = 0;
  //     }

  //     return {
  //       codigo: item.deve_articulo,
  //       descripcion: item.articulo,
  //       observacion: "",
  //       unidadMedida: item.ar_unidad_medida || 77, // Unidad
  //       cantidad: item.deve_cantidad,
  //       precioUnitario: item.deve_precio,
  //       cambio: monedaSeleccionada?.mo_codigo != 1 ? cotizacionDolar : 0,
  //       ivaTipo: ivaTipo,
  //       ivaBase: ivaBase,
  //       iva: ivaPorcentaje,
  //       lote: item.deve_lote || "",
  //       vencimiento: item.deve_vencimiento || "",
  //     };
  //   }),
  // };

  // let responseFacturaSend: any = null;

  // if (
  //   usaFacturaElectronica === 1 &&
  //   opcionesFinalizacion.tipo_documento === "FACTURA"
  // ) {
  //   console.log("Factura send: ", dataFacturaSend);
  //   responseFacturaSend = await enviarFacturas([dataFacturaSend]);
  //   console.log("Respuesta factura send: ", responseFacturaSend);
  //   if (responseFacturaSend.success === true) {
  //     toast({
  //       title: "Éxito",
  //       description: "Factura Electronica emitida correctamente",
  //       status: "info",
  //       duration: 3000,
  //     });
  //   } else if (responseFacturaSend.success === false) {
  //     toast({
  //       title: "Error al emitir la factura electronica",
  //       description: `Error:${responseFacturaSend.errores[0].error}`,
  //       status: "warning",
  //       duration: 50000,
  //       isClosable: true,
  //     });
  //   } else {
  //     toast({
  //       title: "Error",
  //       description: `Error desconocido al emitir la factura electronica`,
  //       status: "error",
  //       duration: 3000,
  //     });
  //   }
  // }

  // const totalAEnviar = () => {
  //   switch (monedaSeleccionada?.mo_codigo) {
  //     case 1:
  //       return totalesVenta.guaranies;
  //     case 2:
  //       return totalesVenta.dolares;
  //     case 3:
  //       return totalesVenta.reales;
  //     case 4:
  //       return totalesVenta.pesos;
  //     default:
  //       return totalesVenta.guaranies;
  //   }
  // };
  // Preparar objeto de venta
  // const venta = {
  //   ventaId: ventaIdEdicion || null,
  //   cliente: clienteSeleccionado.cli_codigo,
  //   operador: Number(operador),
  //   deposito: depositoSeleccionado?.dep_codigo,
  //   moneda: monedaSeleccionada?.moCodigo,
  //   fecha: fecha,
  //   factura:
  //     opcionesFinalizacion.tipo_documento === "FACTURA"
  //       ? opcionesFinalizacion.nro_emision +
  //       "-" +
  //       opcionesFinalizacion.nro_establecimiento +
  //       "-000" +
  //       opcionesFinalizacion.nro_factura
  //       : null,
  //   credito: opcionesFinalizacion.tipo_venta === "CREDITO" ? 1 : 0,
  //   saldo:
  //     opcionesFinalizacion.tipo_venta === "CREDITO"
  //       ? totalAEnviar() - (opcionesFinalizacion.entrega_inicial || 0)
  //       : totalAEnviar(),
  //   vencimiento: opcionesFinalizacion.fecha_vencimiento_timbrado || null,
  //   descuento: totalDescuento,
  //   total: totalAEnviar(),
  //   cuotas: opcionesFinalizacion.tipo_venta === "CREDITO" ? 1 : 0,
  //   cantCuotas: opcionesFinalizacion.cantidad_cuotas || 0,
  //   obs: opcionesFinalizacion.observacion || "",
  //   vendedor: vendedorSeleccionado.op_codigo,
  //   sucursal: sucursales[0].id,
  //   timbrado:
  //     opcionesFinalizacion.tipo_documento === "FACTURA"
  //       ? opcionesFinalizacion.timbrado
  //       : null,
  //   pedido: numeroPedido,
  //   hora: new Date().toLocaleTimeString(),
  //   userpc: sessionStorage.getItem("user_name") || "Sistema web",
  //   situacion: 1,
  //   chofer: null,
  //   metodo: metodoPagoSeleccionado?.me_codigo || 1,
  //   ve_cdc: usaFacturaElectronica
  //     ? responseFacturaSend?.result?.deList[0]?.cdc || ""
  //     : "",
  //   ve_qr: usaFacturaElectronica
  //     ? responseFacturaSend?.result?.deList[0]?.qr || ""
  //     : "",
  // };

  // // Preparar detalles de venta
  // const detalleVentas = itemsParaVenta.map((item) => ({
  //   deve_articulo: item.deve_articulo,
  //   deve_cantidad: item.deve_cantidad,
  //   deve_precio: item.deve_precio,
  //   deve_descuento: item.deve_descuento,
  //   deve_exentas: item.deve_exentas,
  //   deve_cinco: item.deve_cinco,
  //   deve_diez: item.deve_diez,
  //   deve_color: item.deve_color,
  //   deve_bonificacion: item.deve_bonificacion,
  //   deve_vendedor: item.deve_vendedor,
  //   deve_codioot: item.deve_codioot,
  //   deve_costo: item.deve_costo,
  //   deve_costo_art: item.deve_costo_art,
  //   deve_cinco_x: item.deve_cinco_x,
  //   deve_diez_x: item.deve_diez_x,
  //   lote: item.deve_lote,
  //   loteid: item.loteid,
  //   articulo_editado: item.editar_nombre === 1,
  //   deve_codigo: item.deve_articulo,
  //   deve_descripcion_editada:
  //     item.editar_nombre === 1 ? item.articulo : null,
  // }));


  // Enviar datos al backend
  //     const response = await axios.post(`${api_url}venta/agregar-venta-nuevo`, {
  //       venta,
  //       detalle_ventas: detalleVentas,
  //     });

  //     console.log(response.data.body);

  //     if (response.data.body.status === "success") {
  //       toast({
  //         title: "Éxito",
  //         description: "Venta realizada correctamente",
  //         status: "success",
  //         duration: 3000,
  //       });

  //       actualizarUltimaFactura(
  //         d_codigo,
  //         Number(opcionesFinalizacion.nro_factura)
  //       );
  //       onCloseKCOpen();

  //       handleCancelarVenta();
  //       Auditar(
  //         5,
  //         8,
  //         response.data.body.ventaId,
  //         operador ? parseInt(operador) : 0,
  //         `Venta ID ${response.data.body.ventaId} realizada por ${operador}`
  //       );

  //       setUltimaVentaId(response.data.body.ventaId);

  //       if (imprimirFactura) {
  //         if (tipoImpresionFactura === 1) {
  //           isMobile
  //             ? await imprimirFacturaComponenteReport(
  //               response.data.body.ventaId,
  //               "download"
  //             )
  //             : await imprimirFacturaComponenteReport(
  //               response.data.body.ventaId,
  //               "print"
  //             );
  //         } else if (tipoImpresionFactura === 2) {
  //           isMobile
  //             ? await imprimirFacturaComponente(
  //               response.data.body.ventaId,
  //               "download"
  //             )
  //             : await imprimirFacturaComponente(
  //               response.data.body.ventaId,
  //               "print"
  //             );
  //         }
  //       }
  //       if (imprimirTicket) {
  //         isMobile
  //           ? await imprimirTicketComponente(
  //             response.data.body.ventaId,
  //             "download"
  //           )
  //           : await imprimirTicketComponente(
  //             response.data.body.ventaId,
  //             "print"
  //           );
  //       }
  //       if (imprimirNotaInterna) {
  //         isMobile
  //           ? await imprimirNotaComponente(
  //             response.data.body.ventaId,
  //             "download"
  //           )
  //           : await imprimirNotaComponente(response.data.body.ventaId, "print");
  //       }
  //     }

  //     getClientePorDefecto();
  //   } catch (error) {
  //     console.error("Error al finalizar la venta:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo completar la venta",
  //       status: "error",
  //       duration: 3000,
  //     });
  //   }
  // };

  // async function convertirDocumentoAVenta(documento: DocumentoBase) {
  //   try {
  //     // Limpiar estado actual
  //     handleCancelarVenta();

  //     // Obtener datos del cliente
  //     await getClientePorId(null, documento.cliente);

  //     // Obtener datos del vendedor
  //     if (documento.vendedor) {
  //       await getVendedores(documento.vendedor);
  //     }

  //     // Procesar cada item
  //     for (const item of documento.items) {
  //       try {
  //         // Buscar artículo
  //         console.log("Getting un item", item);
  //         const response = await axios.get(
  //           `${api_url}articulos/buscar-articulos`,
  //           {
  //             params: {
  //               articulo_id: item.articulo,
  //               deposito: depositoSeleccionado?.dep_codigo,
  //             },
  //           }
  //         );
  //         console.log(response.data.body);
  //         if (response.data.body.length > 0) {
  //           const articulo = response.data.body[0];
  //           // Crear el nuevo item directamente
  //           const nuevoItem = {
  //             deve_articulo: articulo.id_articulo,
  //             deve_cantidad: item.cantidad,
  //             deve_precio: item.precio,
  //             deve_descuento: item.descuento || 0,
  //             deve_exentas: articulo.iva === 1 ? item.precio : 0,
  //             deve_cinco: articulo.iva === 3 ? item.precio : 0,
  //             deve_diez: articulo.iva === 2 ? item.precio : 0,
  //             deve_color: null,
  //             deve_bonificacion: 0 || 0,
  //             deve_vendedor: documento.vendedor || 0,
  //             deve_codioot: 0 || 0,
  //             deve_costo: articulo.costo || 0,
  //             deve_costo_art: articulo.costo || 0,
  //             deve_cinco_x: articulo.iva === 3 ? item.precio * 0.05 : 0,
  //             deve_diez_x: articulo.iva === 2 ? item.precio * 0.1 : 0,
  //             deve_lote: item.lote || "",
  //             loteid: item.loteid || 0,
  //             editar_nombre: 0,
  //             articulo: articulo.descripcion,
  //             deve_devolucion: 0,
  //             deve_vencimiento: null,
  //             deve_talle: null,
  //           };

  //           console.log("Nuevo item", nuevoItem);

  //           setItemsParaVenta((prev) => [...prev, nuevoItem as ItemParaVenta]);

  //           await new Promise((resolve) => setTimeout(resolve, 100));
  //         } else {
  //           toast({
  //             title: "Error",
  //             description: `No se encontró el artículo con código ${item.articulo}`,
  //             status: "error",
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Error al procesar item:", error);
  //         toast({
  //           title: "Error",
  //           description: `Error al procesar el artículo ${item.articulo}`,
  //           status: "error",
  //         });
  //       }
  //     }

  //     toast({
  //       title: "Éxito",
  //       description: `${documento.tipo} convertido a venta correctamente`,
  //       status: "success",
  //     });
  //   } catch (error) {
  //     console.error("Error al convertir documento a venta:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo convertir el documento a venta",
  //       status: "error",
  //     });
  //   }
  // }

  // async function obtenerYEditarVenta(id: number) {
  //   try {
  //     const response = await axios.get(`${api_url}venta/venta-edicion`, {
  //       params: { id },
  //     });

  //     setVentaIdEdicion(id);

  //     console.log(response.data.body);

  //     const ventaData = response.data.body[0];

  //     const venta: DocumentoBase = {
  //       id: ventaData.id,
  //       tipo: "VENTA",
  //       cliente: ventaData.cliente,
  //       vendedor: ventaData.vendedor,
  //       items: ventaData.items.map((item: any) => ({
  //         articulo: item.articulo,
  //         cantidad: item.cantidad || 1,
  //         precio: item.precio,
  //         descuento: item.descuento || 0,
  //         lote: item.lote || "",
  //         loteid: item.loteid || 0,
  //       })),
  //     };

  //     await convertirDocumentoAVenta(venta);
  //   } catch (error) {
  //     console.error("Error al obtener venta:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo obtener la venta",
  //       status: "error",
  //     });
  //   }
  // }

  // async function obtenerYConvertirPedido(pedido_id: number) {
  //   try {
  //     setNumeroPedido(pedido_id);

  //     const response = await axios.get(`${api_url}pedidos/obtener`, {
  //       params: { id: pedido_id },
  //     });

  //     // La respuesta viene como un array, tomamos el primer elemento
  //     const pedidoData = response.data.body[0];

  //     if (!pedidoData) {
  //       throw new Error("No se encontró el pedido");
  //     }

  //     const pedido: DocumentoBase = {
  //       id: pedido_id,
  //       tipo: "PEDIDO",
  //       cliente: pedidoData.cliente,
  //       vendedor: pedidoData.vendedor,
  //       items: pedidoData.items.map((item: any) => ({
  //         articulo: item.articulo,
  //         cantidad: item.cantidad || 1,
  //         precio: item.precio,
  //         descuento: item.descuento || 0,
  //         lote: item.lote || "",
  //         loteid: item.loteid,
  //       })),
  //     };

  //     await convertirDocumentoAVenta(pedido);

  //     toast({
  //       title: "Éxito",
  //       description: "Pedido convertido a venta correctamente",
  //       status: "success",
  //     });
  //   } catch (error) {
  //     console.error("Error al obtener pedido:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo obtener el pedido",
  //       status: "error",
  //     });
  //   }
  // }

  // async function obtenerYConvertirPresupuesto(presupuesto_id: number) {
  //   try {
  //     setNumeroPresupuesto(presupuesto_id);
  //     const response = await axios.get(`${api_url}presupuestos/obtener`, {
  //       params: { id: presupuesto_id },
  //     });

  //     console.log(response.data.body);

  //     const presupuestoData = response.data.body[0];

  //     if (!presupuestoData) {
  //       throw new Error("No se encontró el presupuesto");
  //     }

  //     const presupuesto: DocumentoBase = {
  //       id: presupuestoData.id,
  //       tipo: "PRESUPUESTO",
  //       cliente: presupuestoData.cliente,
  //       vendedor: presupuestoData.vendedor,
  //       items: presupuestoData.items.map((item: any) => ({
  //         articulo: item.articulo,
  //         cantidad: item.cantidad || 1,
  //         precio: item.precio,
  //         descuento: item.descuento || 0,
  //         lote: item.lote || "",
  //         loteid: item.loteid,
  //       })),
  //     };
  //     await convertirDocumentoAVenta(presupuesto);
  //   } catch (error) {
  //     console.error("Error al obtener presupuesto:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo obtener el presupuesto",
  //       status: "error",
  //       duration: 3000,
  //     });
  //   }
  // }

  // async function obtenerYConvertirRemision(remision_id: number) {
  //   try {
  //     const response = await axios.get(`${api_url}remisiones/obtener`, {
  //       params: { id: remision_id },
  //     });

  //     console.log(response.data.body);

  //     const remisionData = response.data.body[0];

  //     const remision: DocumentoBase = {
  //       id: remisionData.id,
  //       tipo: "REMISION",
  //       cliente: remisionData.cliente,
  //       vendedor: remisionData.vendedor,
  //       items: remisionData.items.map((item: any) => ({
  //         articulo: item.articulo,
  //         cantidad: item.cantidad,
  //         precio: item.precio,
  //         descuento: item.descuento || 0,
  //         lote: item.lote,
  //         loteid: item.loteid,
  //       })),
  //     };
  //     await convertirDocumentoAVenta(remision);
  //   } catch (error) {
  //     console.error("Error al obtener remision:", error);
  //     toast({
  //       title: "Error",
  //       description: "No se pudo obtener la remision",
  //       status: "error",
  //       duration: 3000,
  //     });
  //   }
  // }

  const EditarVentaModal: React.FC<EditarVentaModalProps> = ({
    isOpen,
    onClose,
  }) => {
    const handleSelectVenta = (venta: VentaViewModel) => {
      onClose();
    };
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <ResumenVentas
              onSelectVenta={handleSelectVenta}
              onCloseVenta={onClose}
              isModal={true}
              clienteSeleccionado={clienteSeleccionado || undefined}
            /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const RemisionModal: React.FC<RemisionModalProps> = ({ isOpen, onClose }) => {
    // const handleSelectRemision = (remision: Remisiones) => {
    //   onClose();
    // };
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Consulta de Remisiones</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <ConsultaRemisiones
              onSelectRemision={handleSelectRemision}
              onClose={onClose}
              isModal={true}
              clienteSeleccionado={clienteSeleccionado || undefined}
            /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const PresupuestoModal: React.FC<PresupuestoModalProps> = ({
    isOpen,
    onClose,
  }) => {
    // const handleSelectPresupuesto = (presupuesto: PresupuestoViewModel) => {
    //   onClose();
    // };
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Consulta de Presupuestos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <ConsultaPresupuestos
              onSelectPresupuesto={handleSelectPresupuesto}
              onClose={onClose}
              isModal={true}
              clienteSeleccionado={clienteSeleccionado || undefined}
            /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const PedidoModal: React.FC<PedidoModalProps> = ({ isOpen, onClose }) => {
    // const handleSelectPedido = (pedido: PedidosNuevo) => {
    //   obtenerYConvertirPedido(pedido.pedido_id);
    //   onClose();
    // };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Consulta de Pedidos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <ConsultaPedidos
              onSelectPedido={handleSelectPedido}
              onClose={onClose}
              isModal={true}
              clienteSeleccionado={clienteSeleccionado}
            /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  function calcularMontoEntregado(
    valor: number,
    moneda: "GS" | "USD" | "BRL" | "ARS"
  ) {
    switch (moneda) {
      case "GS":
        setMontoEntregado(valor);
        setMontoEntregadoDolar(Number((valor / cotizacionDolar).toFixed(2)));
        setMontoEntregadoReal(Number((valor / cotizacionReal).toFixed(2)));
        setMontoEntregadoPeso(Number((valor / cotizacionPeso).toFixed(2)));
        break;
      case "USD":
        setMontoEntregado(valor * cotizacionDolar);
        setMontoEntregadoDolar(valor);
        setMontoEntregadoReal(
          Number(((valor * cotizacionDolar) / cotizacionReal).toFixed(2))
        );
        setMontoEntregadoPeso(
          Number(((valor * cotizacionDolar) / cotizacionPeso).toFixed(2))
        );
        break;
      case "BRL":
        setMontoEntregado(valor * cotizacionReal);
        setMontoEntregadoDolar(
          Number(((valor * cotizacionReal) / cotizacionDolar).toFixed(2))
        );
        setMontoEntregadoReal(valor);
        setMontoEntregadoPeso(
          Number(((valor * cotizacionReal) / cotizacionPeso).toFixed(2))
        );
        break;
      case "ARS":
        setMontoEntregado(valor * cotizacionPeso);
        setMontoEntregadoDolar(
          Number(((valor * cotizacionPeso) / cotizacionDolar).toFixed(2))
        );
        setMontoEntregadoReal(
          Number(((valor * cotizacionPeso) / cotizacionReal).toFixed(2))
        );
        setMontoEntregadoPeso(valor);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === cantidadInputRef.current) {
        return;
      }
      if (
        e.key === "F12" &&
        (
          document.activeElement === busquedaInputRef.current)
      ) {
        return;
      }
      if (e.key === "F6") {
        e.preventDefault();
        cantidadInputRef.current?.focus();
      } else if (e.key === "F5") {
        e.preventDefault();
        busquedaPorIdInputRef.current?.focus();
      } else if (
        e.key === "+" &&
        document.activeElement === busquedaPorIdInputRef.current
      ) {
        e.preventDefault();
        busquedaInputRef.current?.focus();
      } else if (e.key === "F12") {
        e.preventDefault();
        // Si el modal de finalización está abierto, finalizar la venta
        if (isKCOpen) {
          //TODO APLICAR EL MUTATION AQUI
        }
        // Si no está abierto pero hay items y cliente seleccionado, abrir el modal
        else if (
          itemsParaVenta.length > 0 &&
          clienteSeleccionado &&
          vendedorSeleccionado
        ) {
          onKCOpen();
        }
        // Si no se cumplen las condiciones, mostrar mensaje de error
        else {
          if (!clienteSeleccionado) {
            toast({
              title: "Error",
              description:
                "No se puede finalizar la venta, falta seleccionar un cliente",
              status: "error",
            });
          } else if (!vendedorSeleccionado) {
            toast({
              title: "Error",
              description:
                "No se puede finalizar la venta, falta seleccionar un vendedor",
              status: "error",
            });
          } else if (!itemsParaVenta.length) {
            toast({
              title: "Error",
              description:
                "No se puede finalizar la venta, no hay articulos en la venta",
              status: "error",
            });
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    itemsParaVenta,
    clienteSeleccionado,
    vendedorSeleccionado,
    isKCOpen,
    onKCOpen,
  ]);

  const handleKCKeyDown = (e: React.KeyboardEvent) => {
    // Para el input de tipo de documento
    if (document.activeElement === tipoDocumentoKCInputRef.current) {
      if (e.key === "1") {
        setOpcionesFinalizacion({
          ...opcionesFinalizacion,
          tipo_documento: "TICKET",
        });
        setImprimirFactura(false);
        setImprimirTicket(true);
      } else if (e.key === "2") {
        setOpcionesFinalizacion({
          ...opcionesFinalizacion,
          tipo_documento: "FACTURA",
        });
        setImprimirFactura(true);
        setImprimirTicket(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        tipoVentaKCInputRef.current?.focus();
      }
    }

    // Para el input de tipo de venta
    if (document.activeElement === tipoVentaKCInputRef.current) {
      if (e.key === "1") {
        setOpcionesFinalizacion({
          ...opcionesFinalizacion,
          tipo_venta: "CONTADO",
        });
      } else if (e.key === "2") {
        setOpcionesFinalizacion({
          ...opcionesFinalizacion,
          tipo_venta: "CREDITO",
        });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        montoEntregadoKCInputRef.current?.focus();
      }
    }
  };

  const calcularVueltoGuaranies = () => {
    const vueltoBruto = (totalAPagar || 0) - (montoEntregado || 0);
    const vuelto = Math.abs(vueltoBruto);
    return vuelto;
  };

  const imprimirFacturaComponenteReport = async (
    ventaId: number,
    accion: "print" | "download" | "b64" = "print"
  ) => {
    const facturaDiv = document.createElement("div");
    facturaDiv.style.display = "none";
    document.body.appendChild(facturaDiv);

    const root = createRoot(facturaDiv);
    root.render(
      <ModeloFacturaReport
        id_venta={ventaId}
        monto_entregado={montoEntregado || 0}
        monto_recibido={montoEntregado || 0}
        vuelto={calcularVueltoGuaranies()}
        onImprimir={true}
        accion={accion}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(facturaDiv);
    }, 2000);
  };

  const imprimirFacturaComponente = async (
    ventaId: number,
    accion: "print" | "download" | "b64" = "print"
  ) => {
    const facturaDiv = document.createElement("div");
    facturaDiv.style.display = "none";
    document.body.appendChild(facturaDiv);

    const root = createRoot(facturaDiv);
    root.render(
      <ModeloFacturaNuevo
        id_venta={ventaId}
        monto_entregado={montoEntregado || 0}
        monto_recibido={montoEntregado || 0}
        vuelto={calcularVueltoGuaranies()}
        onImprimir={true}
        accion={accion}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(facturaDiv);
    }, 2000);
  };

  const imprimirNotaComponente = async (
    ventaId: number,
    accion: "print" | "download" | "b64" = "print"
  ) => {
    const notaDiv = document.createElement("div");
    notaDiv.style.display = "none";
    document.body.appendChild(notaDiv);

    const root = createRoot(notaDiv);
    root.render(
      <ModeloNotaComun
        id_venta={ventaId}
        monto_entregado={montoEntregado || 0}
        monto_recibido={montoEntregado || 0}
        vuelto={calcularVueltoGuaranies()}
        onImprimir={true}
        accion={accion}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(notaDiv);
    }, 2000);
  };

  // const imprimirTicketComponente = async (
  //   ventaId: number,
  //   accion: "print" | "download" | "b64" = "print"
  // ) => {
  //   // Componente oculto que solo se usa para generar el PDF
  //   const ticketDiv = document.createElement("div");
  //   ticketDiv.style.display = "none";
  //   document.body.appendChild(ticketDiv);

  //   const root = createRoot(ticketDiv);
  //   root.render(
  //     <ModeloTicket
  //       id_venta={ventaId}
  //       monto_entregado={montoEntregado || 0}
  //       monto_recibido={montoEntregado || 0}
  //       vuelto={calcularVueltoGuaranies()}
  //       onImprimir={true}
  //       accion={accion}
  //     />
  //   );
  //   setTimeout(() => {
  //     root.unmount();
  //     document.body.removeChild(ticketDiv);
  //   }, 2000);
  // };


  const busquedaPorIdInputRef = useRef<HTMLInputElement>(null);

  const handleClienteIdKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      if (e.currentTarget.value !== "" && e.currentTarget.value !== null) {
        e.preventDefault();
        tipoDocumentoKCInputRef.current?.focus();
      } else {
        onCloseKCOpen(); // Cierra el modal KC
        setTimeout(() => setIsBuscadorClientesOpen(true), 200); // Abre el buscador de clientes
      }
    }
  };

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement === document.body) {
        e.preventDefault();
        busquedaPorIdInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalEnter);
    return () => {
      document.removeEventListener("keydown", handleGlobalEnter);
    };
  }, []);

  const handleScannerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    if (busquedaPorScanner) {
      // Actualizamos el valor visible en el input
      setArticuloBusquedaId(valor);
      setCodigoBarrasBuffer(valor);

      // La mayoría de los scanners terminan con un enter (\n o \r)
      if (valor.includes('\n') || valor.includes('\r')) {
        // Limpiamos caracteres especiales del código
        const codigoLimpio = valor.replace(/[\n\r]/g, '').trim();
        if (codigoLimpio.length > 0) {
          console.log('Código escaneado:', codigoLimpio);
          handleBuscarArticuloPorId(codigoLimpio);
        }
      }
    } else {
      // Modo manual
      setArticuloBusquedaId(valor);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (busquedaPorScanner && (e.key === 'Enter' || e.key === 'Return')) {
      e.preventDefault(); // Prevenir comportamiento por defecto del Enter
      const valor = (e.target as HTMLInputElement).value.trim();
      if (valor.length > 0) {
        console.log('Código escaneado (por Enter):', valor);
        handleBuscarArticuloPorId(valor);
      }
    } else if (!busquedaPorScanner && e.key === 'Enter') {
      e.preventDefault();
      const valor = (e.target as HTMLInputElement).value.trim();
      if (valor.length > 0) {
        handleBuscarArticuloPorId(valor);
      }
    }
  };

  return (
    <Box
      h={"100vh"}
      w={"100%"}
      p={2}
      bg={"gray.100"}
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      overflowY={"auto"}
    >
      <Flex
        bgGradient="linear(to-r, blue.500, blue.600)"
        color="white"
        p={isMobile ? 2 : 3}
        alignItems="center"
        rounded="lg"
      >
        <ShoppingCart size={24} className="mr-2" />
        <Heading size={isMobile ? "sm" : "md"}>Punto de Venta</Heading>
      </Flex>
      <Box
        w="100%"
        h={isMobile ? "100%" : "18%"}
        p={2}
        shadow="sm"
        rounded="md"
        className="bg-blue-100"
      >
        <div
          className={isMobile ? "flex flex-col gap-2" : "flex flex-row gap-2"}
        >
          <div className="flex flex-col gap-2 flex-1">
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2"
                  : "flex flex-row gap-2 items-center"
              }
            >
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold">Fecha</p>
                <input
                  type="date"
                  className="border rounded-md p-2"
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold">Sucursal</p>
                <select
                  className="border rounded-md p-2"
                  name=""
                  id=""
                  onChange={(e) => {
                    setSucursalSeleccionada(
                      sucursales && sucursales.find(
                        (sucursal) => sucursal.id === parseInt(e.target.value)
                      ) || null
                    );
                  }}
                >
                  {sucursales && sucursales.map((sucursal) => (
                    <option value={sucursal.id}>{sucursal.descripcion}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold">Deposito</p>
                <select
                  className="border rounded-md p-2"
                  name=""
                  id=""
                  onChange={(e) => {
                    setDepositoSeleccionado(
                      depositos && depositos.body.find(
                        (deposito) =>
                          deposito.dep_codigo === parseInt(e.target.value)
                      ) || null
                    );
                  }}
                >
                  {depositos && depositos.body.map((deposito) => (
                    <option value={deposito.dep_codigo}>
                      {deposito.dep_descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold">Lista de precios</p>
                <select
                  className="border rounded-md p-2"
                  value={precioSeleccionado?.lpCodigo}
                  name=""
                  id=""
                  onChange={(e) => {
                    setPrecioSeleccionado(
                      listaPrecios && listaPrecios.find(
                        (precio) =>
                          precio.lpCodigo === parseInt(e.target.value)
                      ) || null
                    );
                  }}
                >
                  {listaPrecios && listaPrecios.map((precio) => (
                    <option value={precio.lpCodigo}>
                      {precio.lpDescripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold">Moneda</p>
                <select
                  disabled={itemsParaVenta.length > 0}
                  className="border rounded-md p-2"
                  name=""
                  id=""
                  value={monedaSeleccionada?.moCodigo}
                  onChange={(e) => {
                    setMonedaSeleccionada(
                      monedas && monedas.find(
                        (moneda) =>
                          moneda.moCodigo === parseInt(e.target.value)
                      ) || null
                    );
                  }}
                >
                  {monedas && monedas.map((moneda) => (
                    <option value={moneda.moCodigo}>
                      {moneda.moDescripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col   bg-white rounded-md p-2">
                <p className="text-sm font-bold ">Código de venta:</p>
                <div className="flex flex-col  items-center justify-center">
                  <p className="text-xl font-bold text-blue-500">
                    {ultimaVentaId === null ? 0 : ultimaVentaId + 1}
                  </p>
                </div>
              </div>
              <div className="flex flex-col   bg-white rounded-md p-2">
                <p className="text-sm font-bold ">Cotizacion del dia:</p>
                <div className="flex flex-row items-center justify-center gap-8">
                  <div className="flex flex-row items-center justify-center gap-2">
                    <p>USD:</p>
                    <p className="text-lg font-bold text-green-600">
                      {cotizacionDolar}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2">
                    <p>BRL:</p>
                    <p className="text-lg font-bold text-green-600">
                      {cotizacionReal}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2">
                    <p>ARS:</p>
                    <p className="text-lg font-bold text-green-600">
                      {cotizacionPeso}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={
                isMobile ? "flex flex-col gap-2" : "flex flex-row gap-2"
              }
            >
              <div className="flex flex-col gap-2 flex-1 relative">
                <p className="text-sm font-bold">Cliente:</p>
                <div className="flex flex-row gap-2">
                  <input
                    type="number"
                    name="cliente-codigo"
                    id="cliente-codigo"
                    autoComplete="off"
                    readOnly={true}
                    className="border rounded-md p-2 w-[80px]"
                    value={
                      clienteSeleccionado
                        ? clienteSeleccionado.cli_interno
                        : clienteBusquedaId || ""
                    }
                  />
                  <input
                    type="text"
                    name="cliente-nombre"
                    id="cliente-nombre"
                    autoComplete="off"
                    value={
                      clienteSeleccionado
                        ? clienteSeleccionado.cli_razon
                        : clienteBusqueda || ""
                    }
                    readOnly={true}
                    className="border rounded-md p-2 flex-1"
                    placeholder="Buscar cliente"
                  />
                  <FloatingCard
                    isVisible={isClienteCardVisible}
                    items={clientes}
                    onClose={() => setIsClienteCardVisible(false)}
                    onSelect={handleSelectCliente}
                    className="absolute top-16 left-0 right-0 z-999"
                    renderItem={(item) => <p>{item.cli_razon}</p>}
                  />
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-between bg-blue-200 p-2 rounded-md">
                <div className="flex flex-col gap-2">
                  <p className="text-md font-bold">Limite de crédito</p>
                  <div className=" font-bold bg-white p-2 rounded-md text-right">
                    {clienteSeleccionado?.cli_limitecredito}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-md font-bold">Deuda actual</p>
                  <div className="text-red-600 font-bold bg-white p-2 rounded-md text-right">
                    {clienteSeleccionado?.deuda_actual}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-md font-bold">Credito disponible</p>
                  <div className="text-green-600 font-bold bg-white p-2 rounded-md text-right">
                    {clienteSeleccionado?.credito_disponible}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1 relative">
                <p className="text-sm font-bold">Cajero:</p>
                <div className="flex flex-row gap-2">
                  <input
                    type="text"
                    name=""
                    id=""
                    value={
                      vendedorSeleccionado
                        ? vendedorSeleccionado.op_nombre || ""
                        : "No hay vendedor seleccionado."
                    }
                    onChange={(e) => {
                      handleBuscarVendedor(e);
                    }}
                    onClick={() => {
                      setIsVendedorCardVisible(true);
                    }}
                    readOnly={true}
                    className="border rounded-md flex-1 p-2 disabled:bg-gray-400 disabled:text-black disabled:font-bold"
                    placeholder="Buscar vendedor"
                  />
                </div>
                {(vendedorSeleccionado || vendedorBusqueda) && (
                  <button
                    onClick={() => {
                      setVendedorBusqueda(null);
                      setVendedorSeleccionado(null);
                      setIsVendedorCardVisible(false);
                    }}
                    className="absolute right-2 top-2/3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2 rounded-md "></div>
        </div>
      </Box>
      <Box
        w={"100%"}
        h={isMobile ? "100%" : "80%"}
        shadow="sm"
        rounded="md"
        display={"flex"}
        flexDirection={isMobile ? "column" : "row"}
        gap={2}
      >
        <Box
          w={isMobile ? "100%" : "80%"}
          h={"100%"}
          shadow="sm"
          rounded="md"
          display={"flex"}
          flexDirection={"column"}
          gap={2}
        >
          <Box
            w={"100%"}
            h={isMobile ? "100%" : "85%"}
            bg="white"
            shadow="sm"
            rounded="md"
          >
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 p-2 border-b relative"
                  : "flex flex-row gap-2 p-2 border-b relative"
              }
            >

              <input
                type="text"
                value={articuloSeleccionado ? articuloSeleccionado.codigoBarra : articuloBusquedaId ?? ""}
                className="border rounded-md p-2 flex-1 items-center justify-center w-32 text-center"
                placeholder={busquedaPorScanner ? "Escanear código..." : "Buscar por código..."}
                onChange={handleScannerInput}
                onKeyDown={handleKeyDown}
                ref={busquedaPorIdInputRef}
              />
              <div className="relative w-full">
                <input
                  type="text"
                  value={
                    articuloSeleccionado
                      ? articuloSeleccionado.descripcion
                      : articuloBusqueda
                  }
                  className="border rounded-md p-2 flex-1 items-center justify-center w-full"
                  placeholder="Buscar articulo por nombre o codigo de barras"
                  onClick={() => {
                    setIsArticuloCardVisible(true);
                  }}
                  onFocus={() => {
                    setIsArticuloCardVisible(true);
                  }}
                  onChange={(e) => {
                    handleBuscarArticulo(e);
                  }}
                  onKeyDown={handleKeyPress}
                  ref={busquedaInputRef}
                />
                {articuloBusqueda && (
                  <button
                    onClick={() => {
                      setArticuloBusqueda("");
                      setIsArticuloCardVisible(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <input
                type="number"
                name=""
                id=""
                className="border rounded-md p-2 w-28"
                placeholder="Descuento"
                value={descuento || ""}
                onChange={(e) => {
                  if (permisos_descuento === 1) {
                    setDescuento(Number(e.target.value));
                  }
                }}
                disabled={permisos_descuento === 0}
                onKeyDown={handleDescuentoKeyPress}
                ref={descuentoInputRef}
              />
              <input
                type="number"
                className="border rounded-md p-2 w-16"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => {
                  setCantidad(Number(e.target.value));
                }}
                min={1}
                ref={cantidadInputRef}
                onKeyDown={handleCantidadKeyPress}
              />
              <Button colorScheme="green" onClick={
                () => handleAgregarItem(cantidad, articuloSeleccionado ?? undefined)
              }>
                <Plus />
              </Button>
              <FloatingCard
                isVisible={isArticuloCardVisible}
                items={articulos}
                onClose={() => setIsArticuloCardVisible(false)}
                onSelect={(articulo) => {
                  setArticuloSeleccionado(articulo);
                  setIsArticuloCardVisible(false);
                }}
                className={
                  isMobile
                    ? "absolute top-24 left-0 right-0 z-999 shadow-md"
                    : "absolute top-12 left-0 right-0 z-999 shadow-md"
                }
                renderGeneral={(items, selectedIndex) => (
                  <div className="flex flex-row gap-2 ">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-500 text-white [&>th]:p-2 [&>th]:text-center [&>th]:border [&>th]:border-gray-200">
                          <th>Código</th>
                          <th>Descripción</th>
                          <th>Stock</th>
                          <th>P. {listaPrecios?.[0]?.lpDescripcion || 'N/A'}</th>
                          <th>P. {listaPrecios?.[1]?.lpDescripcion || 'N/A'}</th>
                          <th>P. {listaPrecios?.[2]?.lpDescripcion || 'N/A'}</th>
                          <th>Lote</th>
                          <th>Vencimiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((articulo, index) => (
                          <tr
                            key={articulo.idLote}
                            className={`cursor-pointer transition-colors duration-150 [&>td]:p-2 [&>td]:text-center [&>td]:border [&>td]:border-gray-200 ${index === selectedIndex
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                              }`}
                            onMouseEnter={() => {
                              setHoveredArticulo(articulo);
                            }}
                            onMouseLeave={() => {
                              setHoveredArticulo(null);
                            }}
                            onClick={() => {
                              setArticuloSeleccionado(articulo);
                              setIsArticuloCardVisible(false);
                              busquedaPorIdInputRef.current?.focus();
                            }}
                          >
                            <td>{articulo.codigoBarra}</td>
                            <td>{articulo.descripcion}</td>
                            <td>{articulo.cantidadLote}</td>
                            <td>{articulo.precioVentaGuaranies}</td>
                            <td>{articulo.precioVentaDolar}</td>
                            <td>{articulo.precioVentaReal}</td>
                            <td>{articulo.lote}</td>
                            <td>{articulo.vencimientoLote}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              // renderItem={(item) => (
              //   <div
              //     className={
              //       isMobile
              //         ? "flex flex-row gap-2 items-center [&>p]:font-semibold [&>p]:text-xs"
              //         : "flex flex-row gap-2 items-center [&>p]:font-bold"
              //     }
              //     onMouseEnter={() => setHoveredArticulo(item)}
              //     onMouseLeave={() => setHoveredArticulo(null)}
              //   >
              //     <p>{item.codigo_barra}</p>
              //     <Tally1 />
              //     <p>{item.descripcion}</p>
              //     <Tally1 />
              //     {monedaSeleccionada?.mo_codigo === 1 ? (
              //       <>
              //         <p>P. Contado</p>
              //         <p>{formatNumber(item.precio_venta_guaranies)}</p>
              //         <p>P. Mostrador</p>
              //         <p>{formatNumber(item.precio_mostrador)}</p>
              //         <p>P. Credito</p>
              //         <p>{formatNumber(item.precio_credito)}</p>
              //       </>
              //     ) : (
              //       <>
              //         <p>
              //           P. Contado{" "}
              //           {monedaSeleccionada?.mo_descripcion.toLowerCase()}:
              //         </p>
              //         <p>{formatNumber(item.precio_venta_dolar)}</p>
              //       </>
              //     )}
              //     <Tally1 />
              //     {item.vencimiento_validacion === 1 ? (
              //       <>
              //         <p
              //           className={
              //             item.estado_vencimiento === "VIGENTE"
              //               ? "text-green-500"
              //               : item.estado_vencimiento === "PROXIMO"
              //               ? "text-yellow-500"
              //               : "text-red-500"
              //           }
              //         >
              //           {item.vencimiento_lote}
              //         </p>
              //         <Tally1 />
              //         <p>Lote: {item.lote}</p>
              //       </>
              //     ) : null}
              //     <Tally1 />
              //     <p>Stock</p>
              //     <p>{item.cantidad_lote}</p>
              //   </div>
              // )}
              />
              <ArticuloInfoCard
                articulo={hoveredArticulo}
                isVisible={hoveredArticulo !== null}
              />
            </div>
            <div className="flex flex-col  w-full h-[calc(100%-100px)] overflow-y-auto ">
              <table>
                <thead className="bg-blue-500 text-white">
                  <tr className="text-md font-bold [&>th]:p-2 [&>th]:text-center [&>th]:border [&>th]:border-gray-200 [&>th]:text-3xl">
                    <th>Cod. de Barras</th>
                    <th>Descripcion</th>
                    <th>Cantidad</th>
                    {/* <th>V/B</th> */}
                    {/* <th>Lote</th> */}
                    {/* <th>Vencimiento</th> */}
                    <th>Precio U.</th>
                    <th>Descuento</th>
                    {/* <th>Exentas</th> */}
                    {/* <th>5%</th> */}
                    {/* <th>10%</th> */}
                    <th>SubTotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsParaVenta.map((item) => (
                    <tr
                      key={item.deveArticulo}
                      className="[&>td]:px-2 [&>td]:py-1 [&>td]:border [&>td]:border-gray-200 [&>td]:text-2xl [&>td]:font-bold"
                    >
                      <td>{item.codigoBarra}</td>
                      <td>
                        {item.editarNombre === 1 ? (
                          <input
                            className="border rounded-md w-full"
                            type="text"
                            value={item.deveArticulo}
                            onChange={(e) => {
                              setItemsParaVenta(
                                itemsParaVenta.map((currentItem) =>
                                  currentItem.deveArticulo ===
                                    item.deveArticulo
                                    ? {
                                      ...currentItem,
                                      articulo: e.target.value,
                                    }
                                    : currentItem
                                )
                              );
                            }}
                          />
                        ) : (
                          item.deveArticulo
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          min="1"
                          className="border rounded-md p-1 w-16 text-center"
                          value={item.deveCantidad}
                          onChange={(e) => {
                          }}
                        />
                      </td>
                      {/* <td className="text-center">{item.deve_bonificacion}</td> */}
                      {/* <td className="text-center">{item.deve_lote}</td> */}
                      {/* <td className="text-center">{item.deve_vencimiento}</td> */}
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          className={`border rounded-md p-1 ${item.devePrecio !== item.precioUnitario
                            ? "bg-yellow-100"
                            : ""
                            }`}
                          value={item.devePrecio}
                          onChange={(e) => {
                          }}
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={`border rounded-md p-1 w-16 text-center ${permisos_descuento === 0 ? "bg-gray-100" : ""
                            }`}
                          value={item.deveDescuento}
                          disabled={permisos_descuento === 0}
                          onChange={(e) => {
                          }}
                        />
                      </td>
                      {/* <td className="text-right">
                        {formatNumber(item.deve_exentas)}
                      </td> */}
                      {/* <td className="text-right">
                        {formatNumber(item.deve_cinco)}
                      </td> */}
                      {/* <td className="text-right">
                        {formatNumber(item.deve_diez)}
                      </td> */}
                      <td className="text-right">
                        {(
                          (item.devePrecio -
                            (item.deveDescuento * item.devePrecio) / 100) *
                          item.deveCantidad
                        )}
                      </td>
                      <td className="flex items-center justify-center">
                        <button
                          className="text-red-500"
                          onClick={() => { }}
                        >
                          <Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
          <Box
            w={"100%"}
            h={isMobile ? "20%" : "10%"}
            shadow="sm"
            rounded="md"
            className="flex flex-row gap-2 bg-blue-200  items-end"
          >
            {/* <div className="flex flex-col-reverse gap-2 p-2 w-full bg-orange-200 m-2 rounded-md">
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total exentas:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalExentasFormateado}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total 5%:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalCincoFormateado}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total 10%:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalDiezFormateado}
                  </p>
                </div>
              </div>
            </div> */}
            {/* <div className="flex flex-col gap-2 p-2 w-full">
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Subtotal:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalPagarFormateado}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total desc. por items :</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalDescuentoItemsFormateado}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total desc. por factura:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto ">
                  <p className="text-right text-xl font-bold">
                    {totalDescuentoFormateado}
                  </p>
                </div>
              </div>
            </div> */}
            {/* <div className="flex flex-col gap-2 p-2 w-full">
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Porcentaje de descuento:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {porcentajeDescuentoFormateado || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total de items vendidos:</p>
                <div className="bg-white px-4 py-2 rounded-md w-1/2 ml-auto">
                  <p className="text-right text-xl font-bold">
                    {totalItemsFormateado}
                  </p>
                </div>
              </div>
            </div> */}
            <div className="flex flex-row gap-2 p-2 w-full  bg-blue-300  m-2 rounded-md">
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-xl font-bold">Total GS.:</p>
                <div className=" px-4 py-2 rounded-md w-3/4 ml-auto bg-black">
                  <p className="text-right text-5xl font-bold text-green-500 ">
                    {formatCurrency(totalAPagar)}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total USD:</p>
                <div className=" px-4 py-2 rounded-md w-3/4 ml-auto bg-blue-800">
                  <p className="text-right text-5xl font-bold text-white">
                    {formatCurrency(totalDolares, "USD")}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total BRL:</p>
                <div className=" px-4 py-2 rounded-md w-3/4 ml-auto bg-blue-800">
                  <p className="text-right text-5xl font-bold text-white">
                    {formatCurrency(totalReales, "RL")}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full flex-1 items-center">
                <p className="text-md font-bold">Total ARS:</p>
                <div className=" px-4 py-2 rounded-md w-3/4 ml-auto bg-blue-800">
                  <p className="text-right text-5xl font-bold text-white">
                    {formatCurrency(totalPesos, "ARS")}
                  </p>
                </div>
              </div>
            </div>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          w={isMobile ? "100%" : "20%"}
          h={isMobile ? "20%" : "100%"}
          p={2}
          bg="white"
          shadow="sm"
          rounded="md"
          gap={2}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 [&>p]:text-sm [&>p]:font-bold">
              <p>F5 para buscar articulo por codigo</p>
              <p>
                Para busqueda manual de articulos presione "+" en la barra de
                busqueda
              </p>
              <p>F6 para agregar cantidad</p>
              <p>F12 para finalizar venta</p>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2 items-center justify-center">
                <input
                  type="checkbox"
                  checked={buscarItemsConStock}
                  onChange={(e) => setBuscarItemsConStock(e.target.checked)}
                />
                <p className="text-sm font-bold">Buscar items con stock</p>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <input
                  type="checkbox"
                  checked={busquedaPorScanner}
                  onChange={(e) => setBusquedaPorScanner(e.target.checked)}
                />
                <p className="text-sm font-bold">Búsqueda por scanner</p>
              </div>
            </div>
            <button className="flex flex-row gap-2 items-center justify-center bg-slate-400 p-2 rounded-md">
              <FileSearch size={32} color="white" />
              <p className="text-md font-bold text-white">
                Calc. Cuota p/Selec.
              </p>
            </button>
            <p className="text-md font-bold">Obs. de venta:</p>
            <textarea
              name=""
              id=""
              className="w-full h-20 border rounded-md p-2"
            />
            <div className="flex flex-col bg-orange-200 p-2  rounded-md gap-2">
              <p className="text-sm font-bold">Consultar:</p>
              <div className="flex flex-col gap-2">
                <div
                  className="flex flex-row gap-2 items-center p-1 rounded-md bg-white cursor-pointer hover:bg-blue-300 transition-all duration-300"
                  onClick={() => {
                    onPedidoModalOpen();
                  }}
                >
                  <FileText />
                  <p>Pedidos</p>
                </div>
                <div
                  className="flex flex-row gap-2 items-center p-1 rounded-md bg-white cursor-pointer hover:bg-blue-300 transition-all duration-300 "
                  onClick={() => {
                    onPresupuestoModalOpen();
                  }}
                >
                  <FileText />
                  <p>Presupuestos</p>
                </div>
                <div
                  className="flex flex-row gap-2 items-center p-1 rounded-md bg-white cursor-pointer hover:bg-blue-300 transition-all duration-300"
                  onClick={() => {
                    onRemisionModalOpen();
                  }}
                >
                  <FileText />
                  <p>Remisiones</p>
                </div>
                <div
                  className="flex flex-row gap-2 items-center p-1 rounded-md bg-white cursor-pointer hover:bg-blue-300 transition-all duration-300"
                  onClick={() => {
                    onEditarVentaOpen();
                  }}
                >
                  <FileText />
                  <p>Editar venta</p>
                </div>
              </div>
            </div>
            <input type="number" />
          </div>
          <div className="flex flex-row gap-2 w-full">
            <button
              className="bg-blue-400 p-2 rounded-md hover:bg-blue-700 w-full"
              onClick={() => {
                if (!clienteSeleccionado) {
                  toast({
                    title: "Error",
                    description: "Por favor, seleccione un cliente primero",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                  return;
                }
                onOpenConsultaVentas();
              }}
            >
              <p className="text-white font-bold flex flex-row gap-2 items-center justify-center">
                <Coins size={24} /> Consultar ventas del cliente
              </p>
            </button>
          </div>
          <div className="flex flex-row gap-2 ">
            <button
              onClick={handleCancelarVenta}
              className="flex flex-row gap-2 items-center justify-center w-full bg-red-600 p-2 rounded-md hover:bg-red-700"
            >
              <p className="text-white font-bold">Cancelar </p>
              <X size={24} className="text-white" />
            </button>
            <button
              onClick={() => {
                try {
                  onKCOpen();
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Error al finalizar la venta",
                    status: "error",
                  });
                }
              }}
              className="flex flex-row gap-2 items-center justify-center w-full bg-blue-600 p-2 rounded-md hover:bg-blue-700"
            >
              <p className="text-white font-bold">Guardar </p>
              <CassetteTape size={24} className="text-white" />
            </button>
          </div>
        </Box>
      </Box>
      <Modal
        isOpen={isConsultaVentasOpen}
        onClose={onCloseConsultaVentas}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalBody p={0} className="overflow-y-auto">
            <ResumenVentasCliente
              cliente={clienteSeleccionado!}
              onClose={onCloseConsultaVentas}
              isModal={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isKCOpen} onClose={onCloseKCOpen} size="6xl">
        <ModalOverlay />
        <ModalContent onKeyDown={handleKCKeyDown}>
          <ModalHeader>Finalizar Venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2">
                <input
                  type="number"
                  ref={clienteKCInputRef}
                  name="cliente-codigo"
                  id="cliente-codigo"
                  autoComplete="off"
                  className="border rounded-md p-2 w-[80px]"
                  tabIndex={1}
                  onChange={(e) => {
                    handleBuscarClientePorId(e);
                  }}
                  onKeyDown={(e) => {
                    handleClienteIdKeyPress(e);
                  }}
                  value={
                    clienteSeleccionado
                      ? clienteSeleccionado.cli_interno
                      : clienteBusquedaId || ""
                  }
                />
                <input
                  type="text"
                  name="cliente-nombre"
                  id="cliente-nombre"
                  autoComplete="off"
                  value={
                    clienteSeleccionado
                      ? clienteSeleccionado.cli_razon
                      : clienteBusqueda
                  }
                  onChange={(e) => {
                    handleBuscarCliente(e);
                  }}
                  onClick={() => {
                    setIsClienteCardVisible(true);
                  }}
                  className="border rounded-md p-2 flex-1"
                  placeholder="Buscar cliente"
                />
                <FloatingCard
                  isVisible={isClienteCardVisible}
                  items={clientes}
                  onClose={() => setIsClienteCardVisible(false)}
                  onSelect={handleSelectCliente}
                  className="absolute top-16 left-0 right-0 z-999"
                  renderItem={(item) => <p>{item.cli_razon}</p>}
                />
              </div>
              {/* Tipo de Documento */}
              <div className="flex flex-col gap-2">
                <p className="font-bold">
                  Tipo de Documento (1: Nota Común, 2: Factura)
                </p>
                <div
                  className="flex gap-4"
                  ref={tipoDocumentoKCInputRef}
                  tabIndex={2}
                >
                  <button
                    tabIndex={-1}
                    className={`px-4 py-2 rounded-md ${opcionesFinalizacion.tipo_documento === "TICKET"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                      }`}
                    onClick={() => {
                      setOpcionesFinalizacion({
                        ...opcionesFinalizacion,
                        tipo_documento: "TICKET",
                      });
                      setImprimirFactura(false);
                      setImprimirTicket(true);
                    }}
                  >
                    Nota Comun
                  </button>
                  <button
                    tabIndex={-1}
                    className={`px-4 py-2 rounded-md ${opcionesFinalizacion.tipo_documento === "FACTURA"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                      }`}
                    onClick={() => {
                      setOpcionesFinalizacion({
                        ...opcionesFinalizacion,
                        tipo_documento: "FACTURA",
                      });
                      setImprimirFactura(true);
                      setImprimirTicket(false);
                    }}
                  >
                    Factura
                  </button>

                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="radio"
                      className="w-4 h-4"
                      name="impresion"
                      checked={imprimirFactura}
                      onChange={() => {
                        setImprimirFactura(true);
                        setImprimirTicket(false);
                        setImprimirNotaInterna(false);
                      }}
                      disabled={opcionesFinalizacion.tipo_documento === "TICKET"}
                    />
                    <p className="text-md font-bold">Impr. factura</p>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="radio"
                      className="w-4 h-4"
                      name="impresion"
                      checked={imprimirTicket}
                      onChange={() => {
                        setImprimirFactura(false);
                        setImprimirTicket(true);
                        setImprimirNotaInterna(false);
                      }}
                      disabled={opcionesFinalizacion.tipo_documento === "FACTURA"}
                    />
                    <p className="text-md font-bold">Impr. ticket</p>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="radio"
                      className="w-4 h-4"
                      name="impresion"
                      checked={imprimirNotaInterna}
                      onChange={() => {
                        setImprimirFactura(false);
                        setImprimirTicket(false);
                        setImprimirNotaInterna(true);
                      }}
                    />
                    <p className="text-md font-bold">Impr. nota interna</p>
                  </div>
                </div>
              </div>

              {/* Campos de Factura */}
              {opcionesFinalizacion.tipo_documento === "FACTURA" && (
                <div className="flex flex-row gap-4 p-4 bg-blue-100 rounded-md">
                  <div className="flex flex-col gap-2 w-1/2">
                    <p className="font-bold">Timbrado</p>
                    <input
                      type="text"
                      className="border rounded-md p-2"
                      value={opcionesFinalizacion.timbrado || ""}
                      onChange={(e) =>
                        setOpcionesFinalizacion({
                          ...opcionesFinalizacion,
                          timbrado: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <p className="font-bold">Número de Factura</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="border rounded-md p-2 w-16 text-center"
                        maxLength={3}
                        value={
                          opcionesFinalizacion.nro_establecimiento
                            ?.toString()
                            .padStart(3, "0") || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setOpcionesFinalizacion({
                            ...opcionesFinalizacion,
                            nro_establecimiento: value
                              ? parseInt(value)
                              : undefined,
                          });
                        }}
                        placeholder="000"
                      />
                      <span className="flex items-center">-</span>
                      <input
                        type="text"
                        className="border rounded-md p-2 w-16 text-center"
                        maxLength={3}
                        value={
                          opcionesFinalizacion.nro_emision
                            ?.toString()
                            .padStart(3, "0") || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setOpcionesFinalizacion({
                            ...opcionesFinalizacion,
                            nro_emision: value ? parseInt(value) : undefined,
                          });
                        }}
                        placeholder="000"
                      />
                      <span className="flex items-center">-</span>
                      <input
                        type="text"
                        className="border rounded-md p-2 w-28 text-center"
                        maxLength={7}
                        value={
                          opcionesFinalizacion.nro_factura
                            ?.toString()
                            .padStart(7, "0") || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setOpcionesFinalizacion({
                            ...opcionesFinalizacion,
                            nro_factura: value,
                          });
                        }}
                        placeholder="0000000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tipo de Venta */}
              <div className="flex flex-col gap-2">
                <p className="font-bold">Tipo de Venta</p>
                <div
                  className="flex gap-4"
                  ref={tipoVentaKCInputRef}
                  tabIndex={3}
                >
                  <button
                    tabIndex={-1}
                    className={`px-4 py-2 rounded-md ${opcionesFinalizacion.tipo_venta === "CONTADO"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                      }`}
                    onClick={() =>
                      setOpcionesFinalizacion({
                        ...opcionesFinalizacion,
                        tipo_venta: "CONTADO",
                        cantidad_cuotas: undefined,
                        entrega_inicial: undefined,
                      })
                    }
                  >
                    Contado
                  </button>
                  <button
                    tabIndex={-1}
                    className={`px-4 py-2 rounded-md ${opcionesFinalizacion.tipo_venta === "CREDITO"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                      }`}
                    onClick={() =>
                      setOpcionesFinalizacion({
                        ...opcionesFinalizacion,
                        tipo_venta: "CREDITO",
                        cantidad_cuotas: 1,
                        entrega_inicial: 0,
                      })
                    }
                  >
                    Crédito
                  </button>
                </div>
              </div>
              {opcionesFinalizacion.tipo_venta === "CREDITO" && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2 justify-between bg-blue-200 p-2 rounded-md">
                    <div className="flex flex-col gap-2">
                      <p className="text-md font-bold">Limite de crédito</p>
                      <div className=" font-bold bg-white p-2 rounded-md text-right">
                        {clienteSeleccionado?.cli_limitecredito}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-md font-bold">Deuda actual</p>
                      <div className="text-red-600 font-bold bg-white p-2 rounded-md text-right">
                        {clienteSeleccionado?.deuda_actual}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-md font-bold">Credito disponible</p>
                      <div className="text-green-600 font-bold bg-white p-2 rounded-md text-right">
                        {clienteSeleccionado?.credito_disponible}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-4 p-4 bg-blue-50 rounded-md w-1/2">
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Cantidad de Cuotas</p>
                        <input
                          type="number"
                          disabled={
                            !clienteSeleccionado?.cli_limitecredito ||
                            clienteSeleccionado.cli_limitecredito == "0"
                          }
                          className="border rounded-md p-2"
                          value={opcionesFinalizacion.cantidad_cuotas || ""}
                          onChange={(e) =>
                            setOpcionesFinalizacion({
                              ...opcionesFinalizacion,
                              cantidad_cuotas: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Entrega Inicial</p>
                        <input
                          type="number"
                          className="border rounded-md p-2"
                          value={opcionesFinalizacion.entrega_inicial || ""}
                          disabled={
                            !clienteSeleccionado?.cli_limitecredito ||
                            clienteSeleccionado.cli_limitecredito == "0"
                          }
                          onChange={(e) =>
                            setOpcionesFinalizacion({
                              ...opcionesFinalizacion,
                              entrega_inicial: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Vencimiento</p>
                        <input
                          type="date"
                          className="border rounded-md p-2"
                          disabled={
                            !clienteSeleccionado?.cli_limitecredito ||
                            clienteSeleccionado.cli_limitecredito == "0"
                          }
                          value={
                            opcionesFinalizacion.fecha_vencimiento_timbrado ||
                            ""
                          }
                          onChange={(e) =>
                            setOpcionesFinalizacion({
                              ...opcionesFinalizacion,
                              fecha_vencimiento_timbrado: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Tabla de Cuotas */}
                    <div className="w-1/2 p-4 bg-blue-100 rounded-md">
                      <p className="font-bold mb-2">Plan de Pagos</p>
                      <div className="overflow-auto max-h-[300px]">
                        <table className="w-full bg-white">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Fecha</th>
                              <th className="p-2 text-right">Monto</th>
                              <th className="p-2 text-right">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white border-2 border-gray-300 overflow-auto">
                            {cuotasList.map((cuota, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{cuota.fecha}</td>
                                <td className="p-2 text-right">
                                  {formatCurrency(cuota.valor)}
                                </td>
                                <td className="p-2 text-right">
                                  {formatCurrency(cuota.saldo)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos de Crédito */}

              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <p className="font-bold">Metodo de pago</p>
                  <select
                    name=""
                    id=""
                    value={metodoPagoSeleccionado?.id}
                    onChange={(e) =>
                      setMetodoPagoSeleccionado(
                        metodosPago && metodosPago.find(
                          (metodo) =>
                            metodo.id === Number(e.target.value)
                        ) || null
                      )
                    }
                  >
                    {metodosPago && metodosPago.map((metodo) => (
                      <option value={metodo.id}>
                        {metodo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-row gap-4 bg-blue-200 p-2 rounded-md">
                  <div className="flex flex-col gap-2 w-1/2">
                    <div>
                      <p className="font-bold text-lg">Monto total GS:</p>
                      <input
                        type="text"
                        value={formatCurrency(totalAPagar)}
                        readOnly
                        className="border rounded-md p-2 text-right bg-blue-700 w-full text-white font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto total USD:</p>
                      <input
                        type="number"
                        value={totalDolares.toFixed(2)}
                        readOnly
                        className="border rounded-md p-2 text-right bg-blue-700 w-full text-white font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto total BRL:</p>
                      <input
                        type="number"
                        value={totalReales.toFixed(2)}
                        readOnly
                        className="border rounded-md p-2 text-right bg-blue-700 w-full text-white font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto total ARS:</p>
                      <input
                        type="number"
                        value={totalPesos.toFixed(2)}
                        readOnly
                        className="border rounded-md p-2 text-right bg-blue-700 w-full text-white font-bold text-2xl"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div>
                      <p className="font-bold text-lg">Monto entregado GS:</p>
                      <input
                        ref={montoEntregadoKCInputRef}
                        type="number"
                        value={montoEntregado || ""}
                        onChange={(e) => {
                          calcularMontoEntregado(Number(e.target.value), "GS");
                        }}
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto entregado USD:</p>
                      <input
                        type="number"
                        value={montoEntregadoDolar || ""}
                        onChange={(e) => {
                          calcularMontoEntregado(Number(e.target.value), "USD");
                        }}
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto entregado BRL:</p>
                      <input
                        type="number"
                        value={montoEntregadoReal || ""}
                        onChange={(e) => {
                          calcularMontoEntregado(Number(e.target.value), "BRL");
                        }}
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto entregado ARS:</p>
                      <input
                        type="number"
                        value={montoEntregadoPeso || ""}
                        onChange={(e) => {
                          calcularMontoEntregado(Number(e.target.value), "ARS");
                        }}
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div>
                      <p className="font-bold text-lg">Monto faltante GS:</p>
                      <input
                        type="number"
                        readOnly
                        value={
                          montoEntregado &&
                            montoEntregado - totalAPagar < 0
                            ? Math.abs(montoEntregado - totalAPagar)
                            : 0
                        }
                        className="border rounded-md p-2 text-right bg-white w-full text-red-600 font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto faltante USD:</p>
                      <input
                        type="number"
                        readOnly
                        value={
                          montoEntregadoDolar &&
                            montoEntregadoDolar - totalDolares < 0
                            ? Math.abs(
                              montoEntregadoDolar - totalDolares
                            ).toFixed(2)
                            : 0
                        }
                        className="border rounded-md p-2 text-right bg-white w-full text-red-600 font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto faltante BRL:</p>
                      <input
                        type="number"
                        readOnly
                        value={
                          montoEntregadoReal &&
                            montoEntregadoReal - totalReales < 0
                            ? Number(
                              Math.abs(
                                montoEntregadoReal - totalReales
                              ).toFixed(2)
                            )
                            : 0
                        }
                        className="border rounded-md p-2 text-right bg-white w-full text-red-600 font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Monto faltante ARS:</p>
                      <input
                        type="number"
                        readOnly
                        value={
                          montoEntregadoPeso &&
                            montoEntregadoPeso - totalPesos < 0
                            ? Number(
                              Math.abs(
                                (montoEntregadoPeso - totalPesos) /
                                cotizacionPeso
                              ).toFixed(2)
                            )
                            : 0
                        }
                        className="border rounded-md p-2 text-right bg-white w-full text-red-600 font-bold text-2xl"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div>
                      <p className="font-bold text-lg">Cambio GS:</p>
                      <input
                        type="text"
                        value={
                          montoEntregado &&
                            totalAPagar - montoEntregado < 0
                            ? formatCurrency(
                              Math.abs(totalAPagar - montoEntregado)
                            )
                            : 0
                        }
                        readOnly
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Cambio USD:</p>
                      <input
                        type="number"
                        value={
                          montoEntregadoDolar &&
                            totalDolares - montoEntregadoDolar < 0
                            ? Number(
                              Math.abs(
                                totalDolares - montoEntregadoDolar
                              ).toFixed(2)
                            )
                            : 0
                        }
                        readOnly
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Cambio BRL:</p>
                      <input
                        type="number"
                        value={
                          montoEntregadoReal &&
                            totalReales - montoEntregadoReal < 0
                            ? Number(
                              Math.abs(
                                totalReales - montoEntregadoReal
                              ).toFixed(2)
                            )
                            : 0
                        }
                        readOnly

                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Cambio ARS:</p>
                      <input
                        type="number"
                        value={
                          montoEntregadoPeso &&
                            totalPesos - montoEntregadoPeso < 0
                            ? Number(
                              Math.abs(
                                totalPesos - montoEntregadoPeso
                              ).toFixed(2)
                            )
                            : 0
                        }
                        readOnly
                        className="border rounded-md p-2 text-right bg-black w-full text-green-500 border-green-500  font-bold text-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observación */}
              <div className="flex flex-col gap-2">
                <p className="font-bold">Observación</p>
                <textarea
                  className="border rounded-md p-2"
                  value={opcionesFinalizacion.observacion || ""}
                  onChange={(e) =>
                    setOpcionesFinalizacion({
                      ...opcionesFinalizacion,
                      observacion: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => { }}>
              Finalizar Venta
            </Button>
            <Button variant="ghost" onClick={onCloseKCOpen}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PedidoModal isOpen={isPedidoModalOpen} onClose={onPedidoModalClose} />
      <PresupuestoModal
        isOpen={isPresupuestoModalOpen}
        onClose={onPresupuestoModalClose}
      />
      <RemisionModal
        isOpen={isRemisionModalOpen}
        onClose={onRemisionModalClose}
      />
      <EditarVentaModal
        isOpen={isEditarVentaOpen}
        onClose={onEditarVentaClose}
      />
      <BuscadorClientes
        isOpen={isBuscadorClientesOpen}
        setIsOpen={setIsBuscadorClientesOpen}
        onSelect={(cliente) => {
          setClienteSeleccionado(cliente);
          setIsBuscadorClientesOpen(false);
          setTimeout(() => onKCOpen(), 200); // Vuelve a abrir el modal KC
          setTimeout(() => {
            clienteKCInputRef.current?.focus();
          }, 300);
        }}
      />
    </Box>
  );
};

export default PuntoDeVentaNuevo;
