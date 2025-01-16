import React, { useEffect, useRef, useState } from "react";
import { FileText, Minus, ShoppingCart } from "lucide-react";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Grid,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Heading,
  useToast,
  Text,
  useMediaQuery,
  Divider,
  ChakraProvider,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  GridItem,
  InputGroup,
  InputLeftAddon,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "@/services/AuthContext";
import { api_url } from "@/utils";
import { debounce } from "lodash";
import VentaModal from "../ventas/imprimirVenta";
import Auditar from "@/services/AuditoriaHook";
import ConsultaPresupuestos from "../presupuestos/ConsultaPresupuesto";
import {
  MetodosPago,
  Cuota,
  Pedidos,
  DetallePedidos,
  Factura,
} from "@/types/shared_interfaces";
import ConsultaPedidos from "../pedidos/ConsultaPedidos";
// import usePermisos from "@/hooks/usePermisos";

interface Sucursal {
  id: number;
  descripcion: string;
}

interface Deposito {
  dep_codigo: number;
  dep_descripcion: string;
}

interface Vendedor {
  id: number;
  op_nombre: string;
  op_codigo: string;
}

interface Cliente {
  cli_codigo: number;
  cli_interno: number;
  cli_razon: string;
  cli_ruc: string;
  cli_limitecredito: number;
  cli_acuerdo: number;
}

interface Articulo {
  ar_codigo: number;
  ar_descripcion: string;
  ar_pvg: number;
  ar_pvcredito: number;
  ar_pvmostrador: number;
  ar_pvd: number;
  ar_pvdcredito: number;
  ar_pvdmostrador: number;
  ar_codbarra: string;
  ar_iva: number;
  al_cantidad: number;
  al_vencimiento: string;
  ar_editar_desc: number;
}

interface Presupuesto {
  codigo: number;
  codcliente: number;
  cliente: string;
  moneda: string;
  fecha: string;
  codsucursal: number;
  sucursal: string;
  vendedor: string;
  operador: string;
  total: number;
  descuento: number;
  saldo: number;
  condicion: string;
  vencimiento: string;
  factura: string;
  obs: string;
  estado: number;
  estado_desc: string;
}

interface DetallePresupuesto {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  exentas: number;
  cinco: number;
  diez: number;
  lote: string;
  vence: string;
  iva: number;
  ar_editar_desc: number;
}

export interface Item {
  id: number;
  ar_codigo?: number;
  nombre: string;
  precioOriginal: number;
  precioUnitario: number;
  cantidad: number;
  impuesto: number;
  impuesto5: number;
  impuesto10: number;
  exentas: number;
  subtotal: number;
  descuentoIndividual: number;
  ar_editar_desc: number;
}

const tasasDeCambio: { [key: string]: number } = {
  USD: 0.00013,
  PYG: 1,
};

interface DetalleVentas {
  detalle_venta_id: number;
  ar_codigo: number;
  nombre_original: string;
}

interface ItemEditado {
  ar_codigo: number;
  nombre_editado: string;
}

interface DescripcionEditada {
  deve_codigo: number;
  ar_descripcion: string;
}

const saveItemsToLocalStorage = (items: any[]) => {
  localStorage.setItem("cartItems", JSON.stringify(items));
};

const loadItemsFromLocalStorage = (): any[] => {
  const savedItems = localStorage.getItem("cartItems");
  return savedItems ? JSON.parse(savedItems) : [];
};

export default function VentaBalcon() {
  // const { tienePermisos, loading } = usePermisos(107);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodosPago[]>([]);
  const [sucursal, setSucursal] = useState("");
  const [deposito, setDeposito] = useState("");
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const [depositoId, setDepositoId] = useState<string>("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [moneda, setMoneda] = useState("PYG");
  const [vendedor, setVendedor] = useState("");
  const [operador, setOperador] = useState<string>("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<
    (typeof clientes)[0] | null
  >(null);
  const [articuloBusqueda, setArticuloBusqueda] = useState("");
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState<
    {
      id: number;
      ar_codigo?: number;
      nombre: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
      impuesto: number;
      impuesto5: number;
      impuesto10: number;
      exentas: number;
      precioOriginal: number;
      descuentoIndividual: number;
      ar_editar_desc: number;
    }[]
  >(loadItemsFromLocalStorage());
  const [selectedItem, setSelectedItem] = useState<
    (typeof articulos)[0] | null
  >(null);
  const [condicionVenta, setCondicionVenta] = useState(0);
  const [notaFiscal, setNotaFiscal] = useState(1);
  const [isMobile] = useMediaQuery("(max-width: 75em)");
  const [recomendaciones, setRecomendaciones] = useState<typeof articulos>([]);
  const [recomendacionesClientes, setRecomendacionesClientes] = useState<
    typeof clientes
  >([]);
  const [descuentoTipo, setDescuentoTipo] = useState<"porcentaje" | "valor">(
    "porcentaje"
  );
  const [descuentoValor, setDescuentoValor] = useState(0);
  const [buscarVendedor, setBuscarVendedor] = useState("");
  const [recomedacionesVendedores, setRecomendacionesVendedores] = useState<
    typeof vendedores
  >([]);
  const [newSaleID, setNewSaleID] = useState<number | null>(null);
  const [, setError] = useState<string | null>(null);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [numeroTimbrado, setNumeroTimbrado] = useState("");
  const [numeroEstablecimiento, setNumeroEstablecimiento] = useState("");
  const [numeroEmision, setNumeroEmision] = useState("");
  const [creditoUtilizado, setCreditoUtilizado] = useState(0);
  const [entregaInicial, setEntregaInicial] = useState(0);
  const [cuotas, setCuotas] = useState(1);
  const [fechaVencimiento, setFechaVencimiento] = useState(fecha);
  const [metodoPago, setMetodoPago] = useState(0);
  const [montoRecibido, setMontoRecibido] = useState(0);
  const [buscarSoloConStock, setBuscarSoloConStock] = useState(true);
  const [cuotasList, setCuotasList] = useState<Cuota[]>([]);
  const toast = useToast();
  const { auth } = useAuth();
  const vendedorRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const articuloRef = useRef<HTMLInputElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setVentaFinalizada] = useState<any>(null);
  const [, setDetalleVentaFinalizada] = useState<any[]>([]);
  const [, setClienteInfo] = useState<any>(null);
  const [, setSucursalInfo] = useState<any>(null);
  const [, setVendedorInfo] = useState<any>(null);
  const cobrarEnBalcon = localStorage.getItem("cobrarEnBalcon");
  const [isPresupuestoModalOpen, setIsPresupuestoModalOpen] = useState(false);
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedidos | null>(
    null
  );
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] =
    useState<Presupuesto | null>(null);
  const [presupuestoOriginalItems, setPresupuestoOriginalItems] = useState<
    DetallePresupuesto[]
  >([]);

  const [pedidoOriginalItems, setPedidoOriginalItems] = useState<
    DetallePedidos[]
  >([]);

  const [isFinalizarVentaModalOpen, setIsFinalizarVentaModalOpen] =
    useState(false);

  const operadorActual = localStorage.getItem("user_id");
  // Funciones y Effects para traer los datos//

  const cobrarEnBalconParsed = JSON.parse(cobrarEnBalcon || "{}");
  const [, setDetalleVentas] = useState<DetalleVentas[]>([]);
  const [itemsEditados, setItemsEditados] = useState<ItemEditado[]>([]);
  const [listaPrecios, setListaPrecios] = useState<any[0]>([]);
  const [listaPrecio, setListaPrecio] = useState("");
  const [acuerdoCliente, setAcuerdoCliente] = useState(1);
  const [consultaExterna, setConsultaExterna] = useState(0);
  const [bonificacion, setBonificacion] = useState(0);
  const [facturaData, setFacturaData] = useState<Factura[]>([]);
  const [ultimaVentaId, setUltimaVentaId] = useState<number>(0);
  const [cotizacionDolar, setCotizacionDolar] = useState<number>(7770);
  const [cotizacionReal, setCotizacionReal] = useState<number>(1200);
  const [cotizacionPeso, setCotizacionPeso] = useState<number>(5);
  const operadorMovimiento = Number(localStorage.getItem("operador_movimiento"));

  async function traerUltimaVentaId() {
    try {
      const response = await axios.get(`${api_url}venta/idUltimaVenta`);
      console.log(response.data.body);
      setUltimaVentaId(response.data.body[0].id);
    } catch (err) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al intentar obtener el id de la ultima venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function obtenerTimbrado() {
    try {
      const response = await axios.get(
        `${api_url}definicion-ventas/timbrado?usuario=${operadorActual}`
      );
      console.log(response.data.body);
      setFacturaData(response.data.body);
      setNumeroFactura(response.data.body[0].d_nro_secuencia + 1);
      setNumeroEstablecimiento(response.data.body[0].d_establecimiento);
      setNumeroEmision(response.data.body[0].d_p_emision);
      setNumeroTimbrado(response.data.body[0].d_nrotimbrado);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar obtener el timbrado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function actualizarUltimaFactura(codigo: number, numero: number) {
    try {
      await axios.post(
        `${api_url}definicion-ventas/sec?secuencia=${codigo}&codigo=${numero}`
      );
    } catch (err) {
      toast({
        title: "Error",
        description:
          "Hubo un problema al actualizar la secuencia de la factura.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  const fetchCotizaciones = async () => {
    try {
      const response = await axios.get(`${api_url}cotizaciones/`);
      console.log("Cotizaciones", response.data.body);
      setCotizacionDolar(response.data.body[0].usd_venta);
      setCotizacionPeso(response.data.body[0].ars_venta);
      setCotizacionReal(response.data.body[0].brl_venta);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isFinalizarVentaModalOpen) {
      obtenerTimbrado();
      traerUltimaVentaId();
    }
  }, [isFinalizarVentaModalOpen]);

  useEffect(() => {
    // traerListaPrecios

    const fetchListasPrecios = async () => {
      try {
        const response = await axios.get(`${api_url}listasprecios/`);
        setListaPrecios(response.data.body);
        console.log(response.data.body);
        if (response.data.body.length > 0) {
          setListaPrecio(response.data.body[0].lp_codigo.toString());
        }
      } catch {
        console.log("error");
      }
    };

    // traerSucursales

    const fetchSucursales = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}sucursales/listar`);
        setSucursales(response.data.body);
        if (response.data.body.length > 0) {
          setSucursal(response.data.body[0].id.toString());
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // traer depositos

    const fetchDepositos = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}depositos/`);
        setDepositos(response.data.body);
        if (response.data.body.length > 0) {
          const primerDeposito = response.data.body[0];
          setDeposito(primerDeposito.dep_codigo.toString());
          setDepositoId(primerDeposito.dep_codigo.toString());
          setDepositoSeleccionado(primerDeposito);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los depósitos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // traerclientes

    const fetchClientes = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(operadorMovimiento ===1 ? `${api_url}clientes?vendedor=${operadorActual}` : `${api_url}clientes`);
        console.log(response.data.body);
        setClientes(response.data.body);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchVendedores = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}usuarios`);
        setVendedores(response.data.body);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        toast({
          title: "Error",
          description: "Hubo un problema al traer los artículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchMetodoPago = async () => {
      if (!auth) {
        setError("No estás autentificado");
        return;
      }
      try {
        const response = await axios.get(`${api_url}venta/metodosPago`);
        setMetodosPago(response.data.body);
        if (response.data.body.length > 0) {
          setMetodoPago(response.data.body[0].me_codigo);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
        // toast({
        //   title: "Error",
        //   description: "Hubo un problema al traer los metodos de pago.",
        //   status: "error",
        //   duration: 5000,
        //   isClosable: true,
        // });
      }
    };
    fetchCotizaciones();
    traerUltimaVentaId();
    fetchListasPrecios();
    fetchSucursales();
    fetchDepositos();
    fetchClientes();
    fetchVendedores();
    fetchMetodoPago();
  }, [auth, toast]);

  const formatCurrency = (amount: number) => {
    const currencySymbol: { [key: string]: string } = {
      USD: "$",
      PYG: "₲",
    };

    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: moneda === "PYG" ? 0 : 2,
      maximumFractionDigits: moneda === "PYG" ? 0 : 2,
    })
      .format(amount)
      .replace(/\s/g, "")
      .replace(moneda, currencySymbol[moneda]);
  };

  const agregarItem = () => {
    if (selectedItem) {
      let precioSeleccionado;
      switch (listaPrecio) {
        case "2": // Crédito
          precioSeleccionado = selectedItem.ar_pvcredito;
          break;
        case "3": // Mostrador
          precioSeleccionado = selectedItem.ar_pvmostrador;
          break;
        case "1": // Contado
        default:
          precioSeleccionado = selectedItem.ar_pvg;
          break;
      }
      const precioEnMonedaActual = precioSeleccionado * tasasDeCambio[moneda];
      const impuestos = calcularImpuesto(
        selectedItem.ar_pvg,
        selectedItem.ar_iva
      );
      const nuevoItem = {
        id: selectedItem.ar_codigo,
        nombre: selectedItem.ar_descripcion,
        precioOriginal: precioSeleccionado,
        precioUnitario: precioEnMonedaActual,
        cantidad: cantidad,
        impuesto: selectedItem.ar_iva,
        impuesto5: impuestos.impuesto5,
        impuesto10: impuestos.impuesto10,
        exentas: impuestos.exentas,
        subtotal: precioEnMonedaActual * cantidad,
        descuentoIndividual: 0,
        ar_editar_desc: selectedItem.ar_editar_desc,
      };
      const newItems = [...items, nuevoItem];
      setItems(newItems);
      saveItemsToLocalStorage(newItems);
      setArticuloBusqueda("");
      setCantidad(1);
      setSelectedItem(null);
    } else {
      toast({
        title: "Artículo no seleccionado",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    }
  };

  const eliminarItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    saveItemsToLocalStorage(newItems);
  };

  const calcularTotal = () => {
    let total = calcularTotalConDescuentos();
    if (descuentoTipo === "porcentaje") {
      total -= (total * descuentoValor) / 100;
    } else {
      total -= descuentoValor * tasasDeCambio[moneda];
    }
    return total;
  };

  const actualizarCantidadItem = (index: number, nuevaCantidad: number) => {
    const newItems = [...items];
    newItems[index].cantidad = nuevaCantidad;
    newItems[index].subtotal = newItems[index].precioUnitario * nuevaCantidad;
    setItems(newItems);
    saveItemsToLocalStorage(newItems);
  };

  const actualizarDescuentoIndividual = (
    index: number,
    nuevoDescuento: number
  ) => {
    const newItems = [...items];
    newItems[index].descuentoIndividual = nuevoDescuento;
    setItems(newItems);
    saveItemsToLocalStorage(newItems);
  };

  const actualizarPrecioUnitario = (index: number, nuevoPrecio: number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.precioUnitario = nuevoPrecio;
    item.subtotal = nuevoPrecio * item.cantidad;

    // Recalcular impuestos basados en el nuevo precio
    const nuevosImpuestos = calcularImpuesto(nuevoPrecio, item.impuesto);
    item.impuesto5 = nuevosImpuestos.impuesto5;
    item.impuesto10 = nuevosImpuestos.impuesto10;
    item.exentas = nuevosImpuestos.exentas;

    setItems(newItems);
    saveItemsToLocalStorage(newItems);
  };

  const actualizarDescripcionArticulo = (
    index: number,
    nuevaDescripcion: string
  ) => {
    const newItems = [...items];
    const item = newItems[index];
    item.nombre = nuevaDescripcion;
    setItems(newItems);
    saveItemsToLocalStorage(newItems);

    const nuevosItemsEditados = [...itemsEditados];
    const itemEditado = {
      ar_codigo: item.id,
      nombre_editado: nuevaDescripcion,
    };
    const itemEditadoIndex = nuevosItemsEditados.findIndex(
      (editado) => editado.ar_codigo === item.id
    );

    if (itemEditadoIndex !== -1) {
      nuevosItemsEditados[itemEditadoIndex] = itemEditado;
    } else {
      nuevosItemsEditados.push(itemEditado);
    }

    setItemsEditados(nuevosItemsEditados);
  };

  const calcularTotalConDescuentos = () => {
    return items.reduce((acc, item) => {
      const subtotalConDescuentoIndividual =
        item.subtotal * (1 - item.descuentoIndividual / 100);
      return acc + subtotalConDescuentoIndividual;
    }, 0);
  };

  const calcularImpuesto = (precio: number, impuesto: number) => {
    switch (impuesto) {
      case 3:
        return { impuesto5: precio / 21, impuesto10: 0, exentas: 0 };
      case 2:
        return { impuesto5: 0, impuesto10: precio / 11, exentas: 0 };
      case 1:
        return { impuesto5: 0, impuesto10: 0, exentas: precio };
      default:
        return { impuesto5: 0, impuesto10: 0, exentas: 0 };
    }
  };

  const calcularTotalExcentas = () => {
    let totalExentas = 0;
    items.forEach((item) => {
      const exentas = calcularImpuesto(item.precioUnitario, item.impuesto);
      totalExentas +=
        exentas.exentas * item.cantidad * (1 - item.descuentoIndividual / 100);
    });
    return totalExentas;
  };

  const calcularTotal5 = () => {
    let totalImpuesto5 = 0;
    items.forEach((item) => {
      const impuestos = calcularImpuesto(item.precioUnitario, item.impuesto);
      totalImpuesto5 +=
        impuestos.impuesto5 *
        item.cantidad *
        (1 - item.descuentoIndividual / 100);
    });
    return totalImpuesto5;
  };

  const calcularTotal10 = () => {
    let totalImpuesto10 = 0;
    items.forEach((item) => {
      const impuestos = calcularImpuesto(item.precioUnitario, item.impuesto);
      totalImpuesto10 +=
        impuestos.impuesto10 *
        item.cantidad *
        (1 - item.descuentoIndividual / 100);
    });
    return totalImpuesto10;
  };

  const calcularTotalImpuestos = () => {
    let totalImpuesto5 = 0;
    let totalImpuesto10 = 0;
    let totalExentas = 0;

    items.forEach((item) => {
      const precioEnMonedaActual = item.precioUnitario * tasasDeCambio[moneda];
      const impuestos = calcularImpuesto(precioEnMonedaActual, item.impuesto);

      totalImpuesto5 +=
        impuestos.impuesto5 *
        item.cantidad *
        (1 - item.descuentoIndividual / 100);
      totalImpuesto10 +=
        impuestos.impuesto10 *
        item.cantidad *
        (1 - item.descuentoIndividual / 100);
      totalExentas +=
        impuestos.exentas *
        item.cantidad *
        (1 - item.descuentoIndividual / 100);
    });

    return totalImpuesto5 + totalImpuesto10 + totalExentas;
  };

  // (actualizarMoneda(item.impuesto5) * item.cantidad * (1 - item.descuentoIndividual / 100))

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setArticuloBusqueda(busqueda);
    debouncedFetchArticulos(busqueda);
  };

  const debouncedFetchArticulos = debounce(async (busqueda: string) => {
    if (busqueda.length > 0) {
      if (!auth) {
        toast({
          title: "Error de autenticación",
          description: "No estás autentificado",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      try {
        const response = await axios.get(`${api_url}articulos/`, {
          params: {
            buscar: busqueda,
            id_deposito: parseInt(depositoId),
            stock: buscarSoloConStock ? true : false,
          },
        });
        setRecomendaciones(response.data.body);
        setArticulos(response.data.body);
      } catch (error) {
        console.error("Error al buscar artículos:", error);
        toast({
          title: "Error",
          description: "Hubo un problema al buscar los artículos.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setRecomendaciones([]);
      }
    } else {
      setRecomendaciones([]);
    }
  }, 900);

  useEffect(() => {
    return () => {
      debouncedFetchArticulos.cancel();
    };
  }, []);

  useEffect(() => {
    saveItemsToLocalStorage(items);
  }, [items]);

  const handleDepositoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setDepositoId(id);
    const deposito =
      depositos.find((d) => d.dep_codigo.toString() === id) || null;
    setDepositoSeleccionado(deposito);
  };

  const handleStockCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBuscarSoloConStock(e.target.checked);
    if (articuloBusqueda.length > 0) {
      debouncedFetchArticulos(articuloBusqueda);
    }
  };

  const handleBusquedaCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaCliente = e.target.value;
    setClienteBusqueda(busquedaCliente);
    if (busquedaCliente.length > 0) {
      const filteredRecomendacionesClientes = clientes
        .filter(
          (cliente) =>
            cliente.cli_razon
              .toLowerCase()
              .includes(busquedaCliente.toLowerCase()) ||
            cliente.cli_ruc.includes(busquedaCliente) ||
            cliente.cli_interno.toString().includes(busquedaCliente)
        )
        .slice(0, 5);
      setRecomendacionesClientes(filteredRecomendacionesClientes);
    } else {
      setRecomendacionesClientes([]);
    }
  };

  const handleBusquedaVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaVendedor = e.target.value;
    setBuscarVendedor(busquedaVendedor);

    if (busquedaVendedor.length > 0) {
      const filteredVendedores = vendedores
        .filter(
          (vendedor) =>
            vendedor.op_nombre
              .toLowerCase()
              .includes(busquedaVendedor.toLowerCase()) ||
            vendedor.op_codigo.toString().includes(busquedaVendedor)
        )
        .slice(0, 5);

      setRecomendacionesVendedores(filteredVendedores);

      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].op_nombre);
        setOperador(filteredVendedores[0].op_codigo);
      } else {
        setVendedor("");
        setOperador("");
      }
    } else {
      setRecomendacionesVendedores([]);
      setVendedor("");
      setOperador("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".recomendaciones-menu")) {
        setRecomendaciones([]);
        setRecomendacionesClientes([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        const precioEnMonedaActual =
          item.precioOriginal * tasasDeCambio[moneda];
        const impuestos = calcularImpuesto(item.precioOriginal, item.impuesto);
        return {
          ...item,
          precioUnitario: precioEnMonedaActual,
          ...impuestos,
          subtotal: precioEnMonedaActual * item.cantidad,
        };
      })
    );
    if (descuentoTipo === "valor") {
      setDescuentoValor(
        (prevValor) =>
          (prevValor / tasasDeCambio[moneda === "USD" ? "PYG" : "USD"]) *
          tasasDeCambio[moneda]
      );
    }
  }, [moneda]);

  const now = new Date();
  const horaLocal = now.toLocaleTimeString();

  const ventaData = {
    venta: {
      ve_cliente: clienteSeleccionado?.cli_codigo,
      ve_operador: operadorActual,
      ve_deposito: parseInt(deposito),
      ve_moneda: moneda === "PYG" ? 1 : 0,
      ve_fecha: fecha,
      ve_factura:
        notaFiscal === 1
          ? 0
          : `${numeroEstablecimiento}-${numeroEmision}-${numeroFactura}`,
      ve_timbrado: notaFiscal === 1 ? 0 : numeroTimbrado,
      ve_credito: condicionVenta,
      ve_saldo: Number(cobrarEnBalcon) === 1 ? 0 : calcularTotal(),
      ve_sucursal: parseInt(sucursal),
      ve_total: calcularTotal(),
      ve_vencimiento: selectedItem?.al_vencimiento.substring(0, 10)
        ? selectedItem.al_vencimiento
        : "2001-01-01",
      ve_descuento:
        descuentoTipo === "porcentaje"
          ? items.reduce((acc, item) => acc + item.subtotal, 0) *
            (descuentoValor / 100)
          : descuentoValor,
      ve_vendedor: (() => {
        const normalize = (str: string) =>
          typeof str === "string" ? str.toLowerCase().trim() : "";
        const vendedor = vendedores.find(
          (v) => normalize(v.op_nombre) === normalize(operador)
        );
        return vendedor ? vendedor.op_codigo : 1;
      })(),
      ve_hora: horaLocal,
    },
    detalle_ventas: items.map((item) => {
      const itemSubtotal = item.precioUnitario * item.cantidad;
      const totalSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      let itemDescuento = 0;

      if (descuentoTipo === "porcentaje") {
        itemDescuento = itemSubtotal * (descuentoValor / 100);
      } else {
        // Distribuir el descuento proporcionalmente
        itemDescuento = (itemSubtotal / totalSubtotal) * descuentoValor;
      }
      const deve_exentas = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.exentas *
          item.cantidad -
          itemDescuento,
        0
      );
      const deve_cinco = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.impuesto5 *
          item.cantidad *
          21 -
          itemDescuento,
        0
      );
      const deve_diez = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.impuesto10 *
          item.cantidad *
          11 -
          itemDescuento,
        0
      );

      return {
        deve_articulo: item.id,
        deve_cantidad: item.cantidad,
        deve_precio: bonificacion === 1 ? 0 : item.precioUnitario,
        deve_descuento: item.precioUnitario * (item.descuentoIndividual / 100),
        deve_exentas: bonificacion === 1 ? 0 : deve_exentas,
        deve_cinco: bonificacion === 1 ? 0 : deve_cinco,
        deve_diez: bonificacion === 1 ? 0 : deve_diez,
        deve_vendedor: operadorActual,
        deve_bonificacion: bonificacion,
      };
    }),
  };

  const localVentaData = {
    venta: {
      ve_cliente: clienteSeleccionado?.cli_codigo,
      ve_operador: operador ? parseInt(operador) : 1,
      ve_deposito: depositoSeleccionado?.dep_descripcion,
      ve_moneda: moneda === "PYG" ? 1 : 0,
      ve_fecha: fecha,
      ve_factura: numeroFactura,
      ve_credito: condicionVenta,
      ve_saldo: clienteSeleccionado?.cli_limitecredito,
      ve_sucursal: parseInt(sucursal),
      ve_total: calcularTotal(),
      ve_vencimiento: selectedItem?.al_vencimiento.substring(0, 10)
        ? selectedItem.al_vencimiento
        : "2001-01-01",
      ve_descuento:
        descuentoTipo === "porcentaje"
          ? items.reduce((acc, item) => acc + item.subtotal, 0) *
            (descuentoValor / 100)
          : descuentoValor,
      ve_vendedor: operador ? parseInt(operador) : 1,
      ve_hora: horaLocal,
    },
    detalle_ventas: items.map((item) => {
      const itemSubtotal = item.precioUnitario * item.cantidad;
      const totalSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      let itemDescuento = 0;

      if (descuentoTipo === "porcentaje") {
        itemDescuento = itemSubtotal * (descuentoValor / 100);
      } else {
        // Distribuir el descuento proporcionalmente
        itemDescuento = (itemSubtotal / totalSubtotal) * descuentoValor;
      }
      const deve_exentas = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.exentas *
          item.cantidad -
          itemDescuento,
        0
      );
      const deve_cinco = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.impuesto5 *
          item.cantidad *
          21 -
          itemDescuento,
        0
      );
      const deve_diez = Math.max(
        (1 - (item.descuentoIndividual ?? 0) / 100) *
          item.impuesto10 *
          item.cantidad *
          11 -
          itemDescuento,
        0
      );

      return {
        deve_articulo: item.id,
        deve_descripcion: item.nombre,
        deve_cantidad: item.cantidad,
        deve_precio: item.precioUnitario,
        deve_descuento: itemDescuento,
        deve_exentas: deve_exentas,
        deve_cinco: deve_cinco,
        deve_diez: deve_diez,
        deve_vendedor: operadorActual,
      };
    }),
  };

  const finalizarVenta = async () => {
    if (!clienteSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!sucursal) {
      toast({
        title: "Error",
        description: "Por favor, seleccione una sucursal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!deposito) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un depósito",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!vendedor) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un vendedor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, agregue al menos un artículo a la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (acuerdoCliente === 1 && cuotas < 1) {
      toast({
        title: "Error",
        description:
          "Por favor, ingrese la cantidad de cuotas o desactive el check del acuerdo con el cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${api_url}venta/agregarVenta`,
        ventaData,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.body) {
        const newSaleID = response.data.body;
        setNewSaleID(response.data.body);
        console.log(newSaleID);

        if (newSaleID !== null) {
          await traerDetalleVentaId(newSaleID);
        }

        setVentaFinalizada(localVentaData.venta);
        setDetalleVentaFinalizada(localVentaData.detalle_ventas);
        setClienteInfo(clienteSeleccionado);
        setSucursalInfo(sucursales.find((s) => s.id.toString() === sucursal));
        setVendedorInfo(vendedores.find((v) => v.op_codigo === operador));
        setIsModalOpen(true);
        setItems([]);
        saveItemsToLocalStorage([]);
        setClienteSeleccionado(null);
        setClienteBusqueda("");
        setDescuentoValor(0);
        setCondicionVenta(0);
        setNotaFiscal(0);
        setNumeroFactura("");
        handleOpenFinalizarVentaModal();
        actualizarUltimaFactura(
          Number(facturaData[0].d_nro_secuencia) + 1,
          facturaData[0].d_codigo
        );
        Auditar(
          5,
          8,
          newSaleID,
          operadorActual ? parseInt(operadorActual) : 0,
          `Venta ID ${newSaleID} realizada por ${operador} en la sucursal ${sucursal} por un total de ${calcularTotal()}`
        );

        if (presupuestoSeleccionado) {
          const itemsEliminados = presupuestoOriginalItems.filter(
            (itemOriginal) =>
              !items.some((item) => item.id === itemOriginal.art_codigo)
          );

          if (itemsEliminados.length > 0) {
            await actualizarPresupuestoParcial(itemsEliminados);
          } else {
            await confirmarPresupuesto();
          }
        }

        if (pedidoSeleccionado) {
          const itemsEliminados = pedidoOriginalItems.filter(
            (itemOriginal) =>
              !items.some((item) => item.id === itemOriginal.art_codigo)
          );

          if (itemsEliminados.length > 0) {
            await actualizarPedidoParcial(itemsEliminados);
          } else {
            await confirmarPedido();
          }
        }
        toast({
          title: "Venta finalizada",
          description: "La venta se ha guardado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No se recibió un ID de venta válido");
      }
    } catch (error) {
      console.error("Error detallado al finalizar la venta:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error al finalizar la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cancelarVenta = async () => {
    setItems([]);
    saveItemsToLocalStorage([]);
    setClienteSeleccionado(null);
    setClienteBusqueda("");
    setDescuentoValor(0);
    setCondicionVenta(0);
    setNotaFiscal(0);
    setNumeroFactura("");
  };

  const getCreditColor = (credit: number) => {
    if (credit < 0) return "red.500";
    if (credit === 0) return "gray.500";
    return "green.500";
  };

  const actualizarMoneda = (n: number) => {
    const precioEnMonedaActual = n * tasasDeCambio[moneda];
    return precioEnMonedaActual;
  };

  const selectFirstRecommendation = (
    recommendations: any[] | undefined,
    setSelected: (item: any) => void,
    clearRecommendations: () => void,
    setSearchValue: (value: string) => void
  ) => {
    if (recommendations && recommendations.length > 0) {
      const firstItem = recommendations[0];
      setSelected(firstItem);
      clearRecommendations();
      setSearchValue(
        firstItem.nombre ||
          firstItem.cli_razon ||
          firstItem.ar_descripcion ||
          firstItem.op_nombre
      );
      return true;
    }
    return false;
  };

  //todo esto maneja el uso de enter para cambiar de input

  const handleEnterKey = (
    e: React.KeyboardEvent<HTMLElement>,
    nextRef: React.RefObject<HTMLElement>,
    selectFirst: () => boolean
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectFirst && !selectFirst()) {
        nextRef.current?.focus();
      }
    }
  };

  const selectFirstVendedor = () => {
    if (!recomedacionesVendedores || recomedacionesVendedores.length === 0)
      return false;
    const firstVendedor = recomedacionesVendedores[0];
    setVendedor(firstVendedor.op_nombre);
    setOperador(firstVendedor.op_codigo);
    setBuscarVendedor(firstVendedor.op_codigo);
    setRecomendacionesVendedores([]);
    return true;
  };

  const selectFirstCliente = () => {
    return selectFirstRecommendation(
      recomendacionesClientes,
      setClienteSeleccionado,
      () => setRecomendacionesClientes([]),
      setClienteBusqueda
    );
  };

  const selectFirstArticulo = () => {
    return selectFirstRecommendation(
      recomendaciones,
      setSelectedItem,
      () => setRecomendaciones([]),
      setArticuloBusqueda
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVentaFinalizada(null);
    setDetalleVentaFinalizada([]);
    setClienteInfo(null);
    setSucursalInfo(null);
    setVendedorInfo(null);
  };

  const handleOpenPresupuestoModal = () => {
    setIsPresupuestoModalOpen(true);
  };

  const handleClosePresupuestoModal = () => {
    setIsPresupuestoModalOpen(false);
  };

  const handleOpenPedidoModal = () => {
    setIsPedidoModalOpen(true);
  };

  const handleClosePedidoModal = () => {
    setIsPedidoModalOpen(false);
  };

  const handleOpenFinalizarVentaModal = () => {
    if (!clienteSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!sucursal) {
      toast({
        title: "Error",
        description: "Por favor, seleccione una sucursal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!deposito) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un depósito",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!vendedor) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un vendedor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, agregue al menos un artículo a la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsFinalizarVentaModalOpen(true);
  };

  const handleCloseFinalizarVentaModal = () => {
    setIsFinalizarVentaModalOpen(false);
    borrarDatosVentaModal();
  };

  const borrarDatosVentaModal = () => {
    setEntregaInicial(0);
    setCuotas(1);
    setFechaVencimiento(fecha);
    setMetodoPago(0);
    setMontoRecibido(0);
    setNumeroTimbrado("");
    setNumeroFactura("");
  };

  const confirmarPresupuesto = async () => {
    try {
      const codigo = presupuestoSeleccionado?.codigo;

      await axios.post(`${api_url}presupuestos/confirmarPresupuesto`, {
        id: codigo,
      });
    } catch (error) {
      console.error("Error al confirmar el presupuesto:", error);
    }
  };

  const confirmarPedido = async () => {
    try {
      const codigo = pedidoSeleccionado?.codigo;
      await axios.post(`${api_url}pedidos/confirmarPedido`, {
        id: codigo,
      });
    } catch (error) {
      console.error("Error al confirmar el pedido:", error);
    }
  };

  const handleSelectPedido = async (pedido: Pedidos) => {
    try {
      const response = await axios.get(
        `${api_url}pedidos/detalles/?cod=${pedido.codigo}`
      );
      const detalles: DetallePedidos[] = response.data.body;

      setPedidoSeleccionado(pedido);
      setPedidoOriginalItems(detalles);

      setClienteSeleccionado(
        clientes.find((c) => c.cli_codigo === pedido.codcliente) || null
      );
      setClienteBusqueda(pedido.cliente);
      setSucursal(pedido.codsucursal.toString());
      setDeposito(pedido.codsucursal.toString());
      setMoneda(pedido.moneda === "GUARANI" ? "PYG" : "USD");

      // Convertir el nombre del vendedor a su op_codigo

      const vendedor = vendedores.find((v) => v.op_nombre === pedido.vendedor);
      const vendedorId = vendedor ? vendedor.op_codigo : null;
      setVendedor(vendedorId ?? "");

      setOperador(pedido.operador);

      const newItems: Item[] = detalles.map((detalle) => ({
        id: detalle.art_codigo,
        nombre: detalle.descripcion,
        precioOriginal: detalle.precio,
        precioUnitario: detalle.precio,
        cantidad: detalle.cantidad,
        impuesto: detalle.iva,
        impuesto5: detalle.cinco / detalle.cantidad,
        impuesto10: detalle.diez / detalle.cantidad,
        exentas: detalle.exentas / detalle.cantidad,
        subtotal: detalle.precio * detalle.cantidad,
        descuentoIndividual: (detalle.descuento / detalle.precio) * 100,
        ar_editar_desc: detalle.ar_editar_desc,
      }));

      setItems(newItems);

      saveItemsToLocalStorage(newItems);

      setDescuentoTipo(pedido.descuento > 0 ? "valor" : "porcentaje");

      setDescuentoValor(pedido.descuento);

      handleClosePedidoModal();

      console.log("Pedido seleccionado", pedido);
      console.log("Detalles del pedido", detalles);
      console.log("items", newItems);

      toast({
        title: "Pedido cargado",
        description: `El pedido #${pedido.codigo} ha sido cargado exitosamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al cargar los detalles del pedido",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectPresupuesto = async (presupuesto: Presupuesto) => {
    try {
      const response = await axios.get(
        `${api_url}presupuestos/detalles/?cod=${presupuesto.codigo}`
      );
      const detalles: DetallePresupuesto[] = response.data.body;

      setPresupuestoSeleccionado(presupuesto);
      setPresupuestoOriginalItems(detalles);

      setClienteSeleccionado(
        clientes.find((c) => c.cli_codigo === presupuesto.codcliente) || null
      );
      setClienteBusqueda(presupuesto.cliente);
      setSucursal(presupuesto.codsucursal.toString());
      setDeposito(presupuesto.codsucursal.toString());
      setMoneda(presupuesto.moneda === "GUARANI" ? "PYG" : "USD");

      // Convertir el nombre del vendedor a su op_codigo
      const vendedor = vendedores.find(
        (v) => v.op_nombre === presupuesto.vendedor
      );
      const vendedorId = vendedor ? vendedor.op_codigo : null;
      setVendedor(vendedorId ?? "");

      setOperador(presupuesto.operador);

      const newItems: Item[] = detalles.map((detalle) => ({
        id: detalle.art_codigo,
        nombre: detalle.descripcion,
        precioOriginal: detalle.precio,
        precioUnitario: detalle.precio,
        cantidad: detalle.cantidad,
        impuesto: detalle.iva,
        impuesto5: detalle.cinco / detalle.cantidad,
        impuesto10: detalle.diez / detalle.cantidad,
        exentas: detalle.exentas / detalle.cantidad,
        subtotal: detalle.precio * detalle.cantidad,
        descuentoIndividual: (detalle.descuento / detalle.precio) * 100,
        ar_editar_desc: detalle.ar_editar_desc,
      }));

      setItems(newItems);

      saveItemsToLocalStorage(newItems);

      setDescuentoTipo(presupuesto.descuento > 0 ? "valor" : "porcentaje");
      setDescuentoValor(presupuesto.descuento);
      handleClosePresupuestoModal();

      toast({
        title: "Presupuesto cargado",
        description: `El presupuesto #${presupuesto.codigo} ha sido cargado exitosamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al cargar los detalles del presupuesto",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const actualizarPedidoParcial = async (itemsEliminados: any[]) => {
    if (!pedidoSeleccionado) {
      toast({
        title: "Error",
        description: "No hay un pedido seleccionado para actualizar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post(`${api_url}pedidos/actualizarParcial`, {
        codigo: pedidoSeleccionado.codigo,
        items: itemsEliminados.map((item) => ({
          art_codigo: item.art_codigo,
          cantidad: item.cantidad,
        })),
      });
      if (response.data.success) {
        toast({
          title: "Pedido actualizado",
          description: "El pedido ha sido actualizado con los items restantes",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(
          response.data.message || "Error al actualizar el pedido"
        );
      }
    } catch (error) {
      console.error("Error al actualizar el pedido parcialmente:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el pedido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const actualizarPresupuestoParcial = async (itemsEliminados: any[]) => {
    if (!presupuestoSeleccionado) {
      toast({
        title: "Error",
        description: "No hay un presupuesto seleccionado para actualizar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${api_url}presupuestos/actualizarParcial`,
        {
          codigo: presupuestoSeleccionado.codigo,
          items: itemsEliminados.map((item) => ({
            art_codigo: item.art_codigo,
            cantidad: item.cantidad,
          })),
        }
      );

      if (response.data.success) {
        toast({
          title: "Presupuesto actualizado",
          description:
            "El presupuesto ha sido actualizado con los items restantes",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(
          response.data.message || "Error al actualizar el presupuesto"
        );
      }
    } catch (error) {
      console.error("Error al actualizar el presupuesto parcialmente:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el presupuesto",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const vuelto = (monto: number) => {
    if (condicionVenta === 0) {
      const result = monto - calcularTotal();
      return result < 0 ? 0 : result;
    } else {
      const result = monto - entregaInicial;
      return result < 0 ? 0 : result;
    }
  };

  const faltante = (monto: number) => {
    if (condicionVenta === 0) {
      const result = calcularTotal() - monto;
      return result < 0 ? 0 : result;
    } else {
      const result = entregaInicial - monto;
      return result < 0 ? 0 : result;
    }
  };

  useEffect(() => {
    if (cuotas > 0 && calcularTotal() > entregaInicial && fechaVencimiento) {
      const saldoRestante = calcularTotal() - entregaInicial;
      const montoCuota = saldoRestante / cuotas;

      const nuevaCuotasList: Cuota[] = Array.from(
        { length: cuotas },
        (_, index) => {
          const fechaCuota = new Date(fechaVencimiento);
          fechaCuota.setMonth(fechaCuota.getMonth() + index);

          return {
            fecha: fechaCuota.toLocaleDateString("es-ES"),
            valor: parseFloat(montoCuota.toFixed(2)),
            saldo: parseFloat((saldoRestante - montoCuota * index).toFixed(2)),
          };
        }
      );

      setCuotasList(nuevaCuotasList);
    } else {
      setCuotasList([]);
    }
  }, [entregaInicial, cuotas, calcularTotal(), fechaVencimiento]);

  async function traerDetalleVentaId(ventaId: number) {
    try {
      const response = await axios.get(
        `${api_url}venta/getDetalleId/${ventaId}`
      );
      const detalleVentas = response.data.body;
      console.log("TraerDetalleID", detalleVentas); // Depuración

      for (const itemEditado of itemsEditados) {
        console.log("Item editado:", itemEditado);
        const detalleVenta: DetalleVentas | undefined = detalleVentas.find(
          (detalle: DetalleVentas) =>
            detalle.ar_codigo === itemEditado.ar_codigo
        );
        console.log("Detalle encontrado:", detalleVenta);
        if (
          detalleVenta &&
          detalleVenta.nombre_original !== itemEditado.nombre_editado
        ) {
          console.log("Insertando descripción:", itemEditado);
          await insertarDescripcion({
            deve_codigo: detalleVenta.detalle_venta_id,
            ar_descripcion: itemEditado.nombre_editado,
          });
        }
      }

      setDetalleVentas(detalleVentas);
    } catch (error) {
      console.error(error);
    }
  }

  async function insertarDescripcion(articulo: DescripcionEditada) {
    try {
      const response = await axios.post(`${api_url}venta/insertarDescripcion`, {
        deve_codigo: articulo.deve_codigo,
        ar_descripcion: articulo.ar_descripcion,
      });
      return response.data;
    } catch (error) {
      console.error("Error al insertar la descripción:", error);
      throw error;
    }
  }

  // if (loading) {
  //   return <Flex>Loading...</Flex>;
  // }

  // // Si no tiene permisos, puedes retornar null o un componente vacío
  // if (!tienePermisos) {
  //   return null;
  // }
  const ajustarFecha = (fecha: string) => {
    if (!fecha) return "";
    const [dia, mes, anio] = fecha.split("/");
    const nuevoDia = parseInt(dia) + 1;
    return `${nuevoDia.toString().padStart(2, "0")}/${mes}/${anio}`;
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace(/\s/g, "");
  };

  const totalDolares = (parseFloat((calcularTotal() / cotizacionDolar).toFixed(2)));

  const totalPesos = parseFloat((calcularTotal() / cotizacionPeso).toFixed(2));
  
  const totalReales = parseFloat((calcularTotal() / cotizacionReal).toFixed(2));

  return (
    <div>
      <ChakraProvider>
        <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
          <Box
            w="100%"
            h={"100%"}
            p={isMobile ? 2 : 4}
            bg="white"
            shadow="xl"
            rounded="lg"
            fontSize={"smaller"}
            mb={16}
            overflowY={"auto"}
          >
            <Flex
              bgGradient="linear(to-r, blue.500, blue.600)"
              color="white"
              p={isMobile ? 4 : 6}
              alignItems="center"
              rounded="lg"
            >
              <ShoppingCart size={24} className="mr-2" />
              <Heading size={isMobile ? "sm" : "md"}>Venta Balcon</Heading>
              {isMobile ? null : (
                <Flex ml="auto" gap={4}>
                  <Select
                    bg={"white"}
                    color={"black"}
                    value={consultaExterna}
                    onChange={(e) => {
                      setConsultaExterna(Number(e.target.value));
                    }}
                  >
                    <option value={0}>Pedidos</option>
                    <option value={1}>Presupuesto</option>
                  </Select>
                  <Button
                    leftIcon={<FileText />}
                    onClick={
                      consultaExterna === 0
                        ? handleOpenPedidoModal
                        : handleOpenPresupuestoModal
                    }
                    w={"200px"}
                  >
                    Consultar
                  </Button>
                </Flex>
              )}
            </Flex>
            <Flex flexDirection={"column"} w={"100%"}>
              <Box p={isMobile ? 2 : 4} w={"100%"}>
                <Flex
                  alignItems={isMobile ? undefined : "center"}
                  gap={4}
                  flexDir={isMobile ? "column" : "row"}
                  w={"100%"}
                >
                  <Grid
                    templateColumns={
                      isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)"
                    }
                    gap={3}
                    mb={4}
                  >
                    <Box>
                      <FormLabel>Sucursal</FormLabel>
                      <Select
                        placeholder="Seleccionar sucursal"
                        value={sucursal}
                        onChange={(e) => setSucursal(e.target.value)}
                      >
                        {sucursales.map((sucursal) => (
                          <option
                            key={sucursal.id}
                            value={sucursal.id.toString()}
                          >
                            {sucursal.descripcion}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <FormLabel>Depósito</FormLabel>
                      <Select
                        placeholder="Seleccionar depósito"
                        value={depositoId}
                        onChange={handleDepositoChange}
                      >
                        {depositos.map((deposito) => (
                          <option
                            key={deposito.dep_codigo}
                            value={deposito.dep_codigo.toString()}
                          >
                            {deposito.dep_descripcion}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <FormLabel>Fecha</FormLabel>
                      <Input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </Box>
                    <Flex gap={4}>
                      <Box flexGrow={1}>
                        <FormLabel>Moneda</FormLabel>
                        <Select
                          placeholder="Seleccionar moneda"
                          value={moneda}
                          onChange={(e) => setMoneda(e.target.value)}
                        >
                          <option value="USD">USD</option>
                          <option value="PYG">PYG</option>
                        </Select>
                      </Box>
                      <Box flexGrow={1}>
                        <FormLabel>Lista de Precios</FormLabel>
                        <Select
                          placeholder="Seleccionar..."
                          value={listaPrecio}
                          onChange={(e) => setListaPrecio(e.target.value)}
                        >
                          {listaPrecios.map(
                            (listaPrecio: {
                              lp_codigo: React.Key | null | undefined;
                              lp_descripcion:
                                | string
                                | number
                                | boolean
                                | React.ReactElement<
                                    any,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | React.ReactPortal
                                | null
                                | undefined;
                            }) => (
                              <option
                                key={listaPrecio.lp_codigo}
                                value={listaPrecio.lp_codigo?.toString()}
                              >
                                {listaPrecio.lp_descripcion}
                              </option>
                            )
                          )}
                        </Select>
                      </Box>
                    </Flex>
                    <Box position={"relative"}>
                      <FormLabel>Vendedor</FormLabel>
                      <Input
                        id="vendedor-search"
                        placeholder="Buscar vendedor por código"
                        value={buscarVendedor}
                        onChange={handleBusquedaVendedor}
                        onFocus={() => {
                          if (vendedor) {
                            setBuscarVendedor("");
                            setRecomendacionesVendedores([]);
                          }
                        }}
                        aria-autocomplete="list"
                        aria-controls="vendedor-recommendations"
                        ref={vendedorRef}
                        onKeyDown={(e) =>
                          handleEnterKey(e, clienteRef, selectFirstVendedor)
                        }
                      />
                      {vendedor && (
                        <Text mt={2} fontWeight="bold" color="green.500">
                          Vendedor seleccionado: {vendedor}
                        </Text>
                      )}
                      {recomedacionesVendedores.length === 0 &&
                        buscarVendedor.length > 0 &&
                        !vendedor && (
                          <Text color="red.500" mt={2}>
                            No se encontró vendedor con ese código
                          </Text>
                        )}
                      {recomedacionesVendedores.length > 0 && (
                        <Box
                          id="vendedor-recommendations"
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          zIndex={20}
                          bg="white"
                          boxShadow="md"
                          borderRadius="md"
                          mt={1}
                          className="recomendaciones-menu"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {recomedacionesVendedores.map((vendedor) => (
                            <Box
                              key={vendedor.op_codigo}
                              p={2}
                              _hover={{ bg: "gray.100" }}
                              cursor="pointer"
                              onClick={() => {
                                setBuscarVendedor(vendedor.op_codigo);
                                setVendedor(vendedor.op_nombre);
                                setOperador(vendedor.op_codigo);
                                setRecomendacionesVendedores([]);
                              }}
                            >
                              <Text fontWeight="bold">
                                {vendedor.op_nombre}
                              </Text>
                              <Text as="span" color="gray.500" fontSize="sm">
                                Código: {vendedor.op_codigo}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Box position="relative">
                      <FormLabel htmlFor="cliente-search">Cliente</FormLabel>
                      <Input
                        id="cliente-search"
                        placeholder="Buscar cliente por nombre o RUC"
                        value={clienteBusqueda}
                        onChange={handleBusquedaCliente}
                        aria-autocomplete="list"
                        aria-controls="cliente-recommendations"
                        ref={clienteRef}
                        onKeyDown={(e) =>
                          handleEnterKey(e, articuloRef, selectFirstCliente)
                        }
                      />
                      {clienteSeleccionado?.cli_acuerdo === 1 ? (
                        <Box
                          display={"flex"}
                          gap={2}
                          alignItems={"center"}
                          mt={2}
                        >
                          <Checkbox
                            isChecked={acuerdoCliente === 1}
                            value={acuerdoCliente}
                            onChange={() =>
                              setAcuerdoCliente(acuerdoCliente ? 0 : 1)
                            }
                          ></Checkbox>
                          <Text fontWeight="bold" color="red.500">
                            Cliente con acuerdo de crédito.
                          </Text>
                        </Box>
                      ) : null}
                      {recomendacionesClientes.length > 0 && (
                        <Box
                          id="cliente-recommendations"
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          zIndex={10}
                          bg="white"
                          boxShadow="md"
                          borderRadius="md"
                          mt={1}
                          className="recomendaciones-menu"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {recomendacionesClientes.map((cliente) => {
                            const credit =
                              Number(cliente.cli_limitecredito) || 0;
                            const creditColor = getCreditColor(credit);

                            return (
                              <Box
                                key={cliente.cli_codigo}
                                p={2}
                                _hover={{ bg: "gray.100" }}
                                cursor="pointer"
                                onClick={() => {
                                  setClienteBusqueda(cliente.cli_razon);
                                  setClienteSeleccionado(cliente);
                                  setRecomendacionesClientes([]);
                                }}
                              >
                                <Text fontWeight="bold">
                                  {cliente.cli_razon}
                                </Text>
                                <Text as="span" color="gray.500" fontSize="sm">
                                  RUC: {cliente.cli_ruc}
                                </Text>
                                <Text
                                  as="span"
                                  color={creditColor}
                                  fontSize="sm"
                                  ml={2}
                                >
                                  Línea de crédito: {formatCurrency(credit)}
                                </Text>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                    {isMobile ? (
                      <Flex gap={4}>
                        <Select
                          bg={"white"}
                          color={"black"}
                          value={consultaExterna}
                          onChange={(e) => {
                            setConsultaExterna(Number(e.target.value));
                          }}
                        >
                          <option value={0}>Pedidos</option>
                          <option value={1}>Presupuesto</option>
                        </Select>
                        <Button
                          leftIcon={<FileText />}
                          onClick={
                            consultaExterna === 0
                              ? handleOpenPedidoModal
                              : handleOpenPresupuestoModal
                          }
                          w={"200px"}
                        >
                          Consultar
                        </Button>
                      </Flex>
                    ) : null}
                  </Grid>
                  <Flex
                    position="relative"
                    flexDirection={isMobile ? "column" : "row"}
                    px={4}
                    gap={4}
                    border={"1px solid #E2E8F0"}
                    h={"120px"}
                    borderRadius={"md"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Box
                      position="absolute"
                      top="-10px"
                      left="20px"
                      bg="white"
                      px={2}
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.600"
                    >
                      Numero de la venta:
                    </Box>
                    <Heading>
                      {newSaleID
                        ? `Venta #${newSaleID + 1}`
                        : `Venta #${ultimaVentaId}`}
                    </Heading>
                  </Flex>
                  <Flex
                    position="relative"
                    flexDirection={isMobile ? "column" : "row"}
                    px={4}
                    mb={4}
                    gap={4}
                    border={"1px solid #E2E8F0"}
                    h={"120px"}
                    borderRadius={"md"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    flexGrow={1}
                    bg={"blue.100"}
                  >
                    <Box
                      position="absolute"
                      top="-10px"
                      left="20px"
                      bg="gray.50"
                      px={2}
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.600"
                    >
                      Cotizacion del día
                    </Box>
                    <Flex gap={4}>
                      <Box>
                        <FormLabel>USD:</FormLabel>
                        <Input
                          type="number"
                          value={cotizacionDolar}
                          width={"85px"}
                          bg={"white"}
                          fontWeight={"bold"}
                        />
                      </Box>
                      <Box>
                        <FormLabel>BRL:</FormLabel>
                        <Input
                          type="number"
                          value={cotizacionReal}
                          width={"85px"}
                          bg={"white"}
                          fontWeight={"bold"}
                        />
                      </Box>
                      <Box>
                        <FormLabel>ARS:</FormLabel>
                        <Input
                          type="number"
                          value={cotizacionPeso}
                          width={"85px"}
                          bg={"white"}
                          fontWeight={"bold"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  gap={4}
                  mb={6}
                  flexDirection={isMobile ? "column" : "row"}
                >
                  <Box position="relative" flexGrow={1}>
                    <Input
                      placeholder="Buscar artículo"
                      value={articuloBusqueda}
                      onChange={handleBusqueda}
                      ref={articuloRef}
                      onKeyDown={(e) =>
                        handleEnterKey(e, cantidadRef, selectFirstArticulo)
                      }
                    />
                    {recomendaciones.length > 0 && (
                      <Box
                        position={"absolute"}
                        top={"100%"}
                        left={0}
                        zIndex={1}
                        width={"100%"}
                        bg={"white"}
                        boxShadow={"md"}
                        borderRadius={"md"}
                        className="recomendaciones-menu"
                        maxHeight={"600px"}
                        overflowY={"auto"}
                      >
                        {recomendaciones.map((articulo) => (
                          <Box
                            key={articulo.ar_codigo}
                            p={2}
                            _hover={{ bg: "gray.100" }}
                            onClick={() => {
                              setArticuloBusqueda(articulo.ar_descripcion);
                              setSelectedItem(articulo);
                              setRecomendaciones([]);
                            }}
                          >
                            <Flex>
                              {articulo.ar_descripcion}
                              <Minus />
                              <Text
                                as="span"
                                color="gray.500"
                                fontSize={"14px"}
                              >
                                Codigo: {articulo.ar_codbarra}
                              </Text>
                              <Minus />
                              <Text as="span" color="red.500" fontSize={"14px"}>
                                Precio Contado:{" "}
                                {formatCurrency(moneda === 'PYG' ? articulo.ar_pvg : articulo.ar_pvd)}
                              </Text>
                              <Minus />
                              <Text as="span" color="red.500" fontSize={"14px"}>
                                Precio Credito:{" "}
                                {formatCurrency(moneda === 'PYG' ? articulo.ar_pvg : articulo.ar_pvdcredito)}
                              </Text>
                              <Minus />
                              <Text as="span" color="red.500" fontSize={"14px"}>
                                Precio Mostrador:{" "}
                                {formatCurrency(moneda === 'PYG' ? articulo.ar_pvg : articulo.ar_pvdmostrador)}
                              </Text>
                              <Minus />
                              <Text
                                as="span"
                                color="gray.500"
                                fontSize={"14px"}
                              >
                                Stock {articulo.al_cantidad}
                              </Text>
                              <Minus />
                              <Text
                                as="span"
                                color="gray.500"
                                fontSize={"14px"}
                              >
                                Vencimiento:{" "}
                                {articulo.al_vencimiento.substring(0, 10)}
                              </Text>
                              {/*que enter cambie los inputs, y agregar cierre de sesion resaltar color del articulo agregar mas recomendaciones*/}
                            </Flex>
                            {/*/condicionar vencimiento*/}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Flex gap={4}>
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={cantidad}
                      onChange={(e) => setCantidad(parseInt(e.target.value))}
                      width={"60px"}
                      min={1}
                      ref={cantidadRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarItem();
                          articuloRef.current?.focus();
                        }
                      }}
                    />
                    <Checkbox
                      isChecked={buscarSoloConStock}
                      onChange={handleStockCheckboxChange}
                    >
                      En stock
                    </Checkbox>
                    <Select
                      w={"80px"}
                      defaultValue={"0"}
                      color={"black"}
                      variant={"filled"}
                      onChange={(e) => {
                        setBonificacion(parseInt(e.target.value));
                      }}
                    >
                      <option value={"0"}>V</option>
                      <option value={"1"}>B</option>
                    </Select>
                    <Button
                      colorScheme="green"
                      onClick={agregarItem}
                      flexGrow={1}
                    >
                      +
                    </Button>
                  </Flex>
                </Flex>
                <Box overflowX={"auto"} height={"300px"} width={"100%"}>
                  <Table variant="striped" size={"sm"}>
                    <Thead position="sticky" top={0} bg="white" zIndex={0}>
                      <Tr>
                        <Th>Código</Th>
                        <Th>Nombre</Th>
                        <Th isNumeric>Precio Unitario</Th>
                        <Th isNumeric>Cantidad</Th>
                        <Th isNumeric>Descuento (%)</Th>
                        <Th isNumeric>Exentas</Th>
                        <Th isNumeric>5%</Th>
                        <Th isNumeric>10%</Th>
                        <Th isNumeric>Subtotal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {items.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.id}</Td>
                          <Td>
                            {item.ar_editar_desc === 0 ? (
                              item.nombre
                            ) : (
                              <Input
                                value={item.nombre}
                                type="text"
                                bg={"white"}
                                onChange={(e) => {
                                  actualizarDescripcionArticulo(
                                    index,
                                    e.target.value
                                  );
                                }}
                              ></Input>
                            )}
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              value={item.precioUnitario}
                              bg={"white"}
                              min={0}
                              step={1000}
                              w={32}
                              precision={2}
                              onChange={(valueString) =>
                                actualizarPrecioUnitario(
                                  index,
                                  parseFloat(valueString)
                                )
                              }
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              value={item.cantidad}
                              bg={"white"}
                              min={1}
                              max={1000}
                              w={20}
                              onChange={(valueString) =>
                                actualizarCantidadItem(
                                  index,
                                  parseInt(valueString)
                                )
                              }
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              value={item.descuentoIndividual}
                              bg={"white"}
                              min={0}
                              max={100}
                              w={20}
                              onChange={(valueString) =>
                                actualizarDescuentoIndividual(
                                  index,
                                  parseFloat(valueString)
                                )
                              }
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            {formatCurrency(
                              actualizarMoneda(item.exentas) *
                                item.cantidad *
                                (1 - item.descuentoIndividual / 100)
                            )}
                          </Td>
                          <Td isNumeric>
                            {formatCurrency(
                              actualizarMoneda(item.impuesto5) *
                                item.cantidad *
                                (1 - item.descuentoIndividual / 100)
                            )}
                          </Td>
                          <Td isNumeric>
                            {formatCurrency(
                              actualizarMoneda(item.impuesto10) *
                                item.cantidad *
                                (1 - item.descuentoIndividual / 100)
                            )}
                          </Td>
                          <Td isNumeric>
                            {formatCurrency(
                              item.subtotal *
                                (1 - item.descuentoIndividual / 100)
                            )}
                          </Td>
                          <Td>
                            <Button
                              size="xs"
                              colorScheme="red"
                              onClick={() => eliminarItem(index)}
                            >
                              x
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Divider borderWidth={"2px"} borderColor={"gray.600"} my={2} />
              </Box>
              <Flex
                w={"100%"}
                p={isMobile ? 2 : 4}
                rounded="lg"
                flexDirection={isMobile ? "column" : "row"}
                gap={4}
                flexGrow={1}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Flex gap={4} flexDirection={isMobile? 'column' : 'row'} >
                  <Flex
                    flexDirection={isMobile? 'column' : 'row'}
                    px={4}
                    gap={4}
                  ></Flex>
                  <Flex
                    gap={2}
                    flexDirection={'column'}
                    alignItems={"start"}
                    justifyContent={'start'}
                  >
                    <Text fontSize={isMobile? 'large' :  "xx-large"} fontWeight={"bold"}>
                    Total items: {items.length}
                  </Text>
                    <Text fontSize={isMobile? 'large' :  "x-large"} fontWeight={"semibold"}>
                      Descuento
                    </Text>
                    <Flex>
                      <Select
                        value={descuentoTipo}
                        onChange={(e) => {
                          setDescuentoTipo(
                            e.target.value as "porcentaje" | "valor"
                          );
                          setDescuentoValor(0);
                        }}
                        width={"150px"}
                      >
                        <option value="porcentaje">Porcentaje</option>
                        <option value="monto">Monto</option>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Descuento"
                        value={descuentoValor}
                        onChange={(e) =>
                          setDescuentoValor(parseInt(e.target.value))
                        }
                        width={"90px"}
                        ml={2}
                      />
                    </Flex>
                  </Flex>

                  <Box pt={2}>
                    <Text fontSize={isMobile? 'large' :  "x-large"} fontWeight="bold">
                      Total Exentas: {formatCurrency(calcularTotalExcentas())}
                    </Text>
                    <Divider
                      borderWidth={"2px"}
                      borderColor={"blue.500"}
                      my={1}
                    />
                    <Text fontSize={isMobile? 'large' :  "x-large"} fontWeight="bold">
                      Total IVA 5%: {formatCurrency(calcularTotal5())}
                    </Text>
                    <Divider
                      borderWidth={"2px"}
                      borderColor={"blue.500"}
                      my={1}
                    />
                    <Text fontSize={isMobile? 'large' :  "x-large"} fontWeight="bold">
                      Total IVA 10%: {formatCurrency(calcularTotal10())}
                    </Text>
                    <Divider
                      borderWidth={"2px"}
                      borderColor={"blue.500"}
                      my={1}
                    />
                    <Text fontSize={isMobile? 'large' :  "x-large"} fontWeight="bold">
                      Total Impuestos:{" "}
                      {formatCurrency(calcularTotalImpuestos())}
                    </Text>
                  </Box>
                </Flex>
                <Flex
                  flexDir={'column'}
                  gap={4}
                >
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  flexDir={isMobile? 'column' : 'row'}
                  textAlign={"center"}
                  mt={isMobile ? 2 : 0}
                  gap={8}
                >
                  {" "}
                  <Text fontSize={isMobile? 'large' : 'xx-large'} fontWeight="bold">
                    Subtotal:{" "}
                    {formatCurrency(
                      items.reduce((acc, item) => acc + item.subtotal, 0)
                    )}
                  </Text>
                  <Text fontSize={isMobile? 'large' : 'xx-large'} fontWeight="bold">
                    Descuento General:{" "}
                    {descuentoTipo === "porcentaje"
                      ? `${descuentoValor}%`
                      : formatCurrency(descuentoValor * tasasDeCambio[moneda])}
                  </Text>
                  <Text fontSize={isMobile? 'large' : 'xx-large'} fontWeight="bold">
                    Total Neto: {formatCurrency(calcularTotal())}
                  </Text>
                </Box>
                <Flex
                  position="relative"
                  flexDirection={isMobile ? "column" : "row"}
                  px={4}
                  gap={4}
                  border={"1px solid #E2E8F0"}
                  h={"120px"}
                  borderRadius={"md"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  flexGrow={1}
                  bg={'green.800'}
                >
                  <Box
                    position="absolute"
                    top="-10px"
                    left="20px"
                    bg="gray.50"
                    px={2}
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.600"
                  >
                  </Box>
                  <Flex
                    gap={4}
                    justifyContent={'space-between'}
                  >
                    <Box>
                      <FormLabel color={'white'} fontWeight={'bold'} fontSize={'large'}> 
                        Total USD:
                      </FormLabel>
                      <Input type="text" value={formatNumber(totalDolares)}  h='48px' bg={'white'} fontSize={'x-large'} fontWeight={'bold'}/>
                    </Box>
                    <Box>
                      <FormLabel color={'white'} fontWeight={'bold'} fontSize={'large'}>
                        Total BRL:
                      </FormLabel>
                      <Input type="text" value={formatNumber(totalReales)}  bg={'white'} h='48px' fontSize={'x-large'} fontWeight={'bold'}/>
                    </Box>
                    <Box>
                      <FormLabel color={'white'} fontWeight={'bold'} fontSize={'large'}>
                        Total ARS:
                      </FormLabel>
                      <Input type="text" value={formatNumber(totalPesos)}  bg={'white'}  h='48px' fontSize={'x-large'} fontWeight={'bold'}/>
                    </Box>
                  </Flex>
                </Flex>
                </Flex>
                <Box display={'flex'} flexDir={'column'}  textAlign={"right"} mt={isMobile ? 2 : 0}>

                  <Flex gap={4} flexDir={isMobile? 'row' : 'column'} justifyContent={'center'} alignItems={'center'}>
                    <Button
                      colorScheme="red"

                      width={'full'}
                      onClick={cancelarVenta}
                    >
                      Cancelar Venta
                    </Button>
                    <Button
                      colorScheme="blue"
                      width={isMobile ? "full" : "auto"}
                      onClick={handleOpenFinalizarVentaModal}
                    >
                      Finalizar Venta
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Box>
          <VentaModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            ventaId={newSaleID}
          />
          <Modal
            isOpen={isPresupuestoModalOpen}
            onClose={handleClosePresupuestoModal}
            size="full"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Consulta de Presupuestos</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <ConsultaPresupuestos
                  onSelectPresupuesto={handleSelectPresupuesto}
                  onClose={handleClosePresupuestoModal}
                  isModal={true}
                  clienteSeleccionado={clienteSeleccionado}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
          <Modal
            isOpen={isPedidoModalOpen}
            onClose={handleClosePedidoModal}
            size="full"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Consulta de Pedidos</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <ConsultaPedidos
                  onSelectPedido={handleSelectPedido}
                  onClose={handleClosePedidoModal}
                  isModal={true}
                  clienteSeleccionado={clienteSeleccionado}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
          <Modal
            isOpen={isFinalizarVentaModalOpen}
            onClose={handleCloseFinalizarVentaModal}
            size={isMobile ? "sm" : "5xl"}
            isCentered={true}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Finalizar Venta</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box
                  display={"grid"}
                  gridTemplateRows={"repeat(3. 1fr)"}
                  gap={4}
                >
                  <GridItem
                    w={isMobile ? "21rem" : "100%"}
                    h={isMobile ? "auto" : "20"}
                    bg="blue.500"
                    borderRadius={"md"}
                    p={isMobile ? 0 : 2}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={isMobile ? "space-between" : "space-around"}
                  >
                    <Box
                      display={"flex"}
                      flexDirection={isMobile ? "column" : "row"}
                      justifyContent={"center"}
                      p={2}
                      borderRadius={"md"}
                    >
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        <strong>RUC.:</strong>
                      </Text>
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        {clienteSeleccionado?.cli_ruc}
                      </Text>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={isMobile ? "column" : "row"}
                      justifyContent={"center"}
                      p={2}
                      borderRadius={"md"}
                    >
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        <strong>Cliente:</strong>
                      </Text>
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        {clienteSeleccionado?.cli_razon}
                      </Text>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={isMobile ? "column" : "row"}
                      justifyContent={"center"}
                      p={2}
                      borderRadius={"md"}
                    >
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        <strong>Vendedor:</strong>
                      </Text>
                      <Text
                        color={"white"}
                        fontSize={isMobile ? "small" : "large"}
                      >
                        {vendedor}
                      </Text>
                    </Box>
                  </GridItem>
                  <GridItem
                    w={isMobile ? "21rem" : "100%"}
                    h={isMobile ? "60" : "80"}
                    bg="gray.50"
                    borderRadius={"md"}
                    display={"flex"}
                    flexDir={"column"}
                    p={2}
                    px={8}
                    rowGap={4}
                    overflowY={isMobile ? "auto" : "hidden"}
                  >
                    <Flex
                      gap={isMobile ? 4 : 12}
                      flexDirection={isMobile ? "column" : "row"}
                    >
                      <Box>
                        <Text fontWeight={"semibold"} mb={2}>
                          Condición de Venta
                        </Text>
                        <Flex flexDir={isMobile ? "row" : "column"} gap={2}>
                          <Button
                            variant={condicionVenta === 0 ? "solid" : "outline"}
                            bg={
                              condicionVenta === 0 ? "green.500" : "transparent"
                            }
                            color={condicionVenta === 0 ? "white" : "green.500"}
                            borderColor="green.500"
                            _hover={{
                              bg:
                                condicionVenta === 0 ? "green.600" : "green.50",
                            }}
                            onClick={() => setCondicionVenta(0)}
                            width={isMobile ? "full" : "120px"}
                          >
                            Contado
                          </Button>
                          <Button
                            variant={condicionVenta === 1 ? "solid" : "outline"}
                            bg={
                              condicionVenta === 1 ? "green.500" : "transparent"
                            }
                            color={condicionVenta === 1 ? "white" : "green.500"}
                            borderColor="green.500"
                            _hover={{
                              bg:
                                condicionVenta === 1 ? "green.600" : "green.50",
                            }}
                            onClick={() => setCondicionVenta(1)}
                            width={isMobile ? "full" : "120px"}
                            isDisabled={
                              !clienteSeleccionado ||
                              clienteSeleccionado.cli_limitecredito <= 0
                            }
                          >
                            Crédito
                          </Button>
                        </Flex>
                      </Box>
                      <Box>
                        <Box
                          textAlign={"center"}
                          mb={2}
                          display={"flex"}
                          flexDir={"column"}
                          justifyContent={"space-between"}
                          alignItems={isMobile ? "flex-start" : "center"}
                        >
                          <FormLabel>Entrega Inicial</FormLabel>
                          <Input
                            isDisabled={condicionVenta === 0}
                            type="number"
                            placeholder="Gs."
                            value={entregaInicial}
                            onChange={(e) =>
                              setEntregaInicial(Number(e.target.value))
                            }
                            width={isMobile ? "full" : "240px"}
                            bg={"white"}
                          />
                        </Box>
                        <Box display={"flex"} alignItems={"center"}>
                          <FormLabel>Cdad. de cuotas:</FormLabel>
                          <Input
                            isDisabled={condicionVenta === 0}
                            type="number"
                            placeholder="Numero de cuotas"
                            value={cuotas}
                            onChange={(e) => setCuotas(Number(e.target.value))}
                            width={isMobile ? "40px" : "60px"}
                            bg={"white"}
                          />
                        </Box>
                        <Box>
                          <FormLabel>Fecha de Vencimiento</FormLabel>
                          <Input
                            isDisabled={condicionVenta === 0}
                            type="date"
                            value={fechaVencimiento}
                            onChange={(e) =>
                              setFechaVencimiento(e.target.value)
                            }
                            width={isMobile ? "full" : "240px"}
                            bg={"white"}
                          />
                        </Box>
                      </Box>
                      <Box
                        height={isMobile ? "auto" : "150px"}
                        overflow={"auto"}
                        w={isMobile ? "100%" : "90%"}
                      >
                        <Table
                          variant={"striped"}
                          colorScheme="blue"
                          size={isMobile ? "sm" : "md"}
                        >
                          <Thead>
                            <Tr>
                              <Th>Fecha</Th>
                              <Th>Valor</Th>
                              <Th>Saldo</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {cuotasList.map((cuota, index) => (
                              <Tr key={index}>
                                <Td>{ajustarFecha(cuota.fecha)}</Td>
                                <Td>{formatCurrency(cuota.valor)}</Td>
                                <Td>{formatCurrency(cuota.saldo)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Flex>
                    <Box
                      display={"flex"}
                      flexDirection={isMobile ? "column" : "row"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      bg={"white"}
                      p={2}
                      borderRadius={"md"}
                      gap={isMobile ? 2 : 6}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={isMobile ? "row" : "column"}
                        gap={2}
                        width={isMobile ? "full" : "auto"}
                      >
                        <Text>
                          <strong>Límite de crédito:</strong>{" "}
                        </Text>
                        <Text
                          color={getCreditColor(
                            clienteSeleccionado?.cli_limitecredito || 0
                          )}
                        >
                          {formatCurrency(
                            clienteSeleccionado?.cli_limitecredito || 0
                          )}
                        </Text>
                      </Box>
                      <Box
                        display={"flex"}
                        flexDirection={isMobile ? "row" : "column"}
                        gap={2}
                        width={isMobile ? "full" : "auto"}
                      >
                        <FormLabel>Utilizado:</FormLabel>
                        <Input
                          isDisabled={condicionVenta === 0}
                          type="number"
                          placeholder="Gs."
                          value={creditoUtilizado}
                          onChange={(e) =>
                            setCreditoUtilizado(Number(e.target.value))
                          }
                          width={isMobile ? "full" : "240px"}
                          bg={"white"}
                        />
                      </Box>
                      <Box
                        display={"flex"}
                        flexDirection={isMobile ? "row" : "column"}
                        gap={2}
                        width={isMobile ? "full" : "auto"}
                      >
                        <Text>
                          <strong>Saldo restante:</strong>{" "}
                        </Text>
                        <Text>
                          {formatCurrency(
                            (clienteSeleccionado?.cli_limitecredito ?? 0) -
                              creditoUtilizado
                          )}
                        </Text>
                      </Box>
                    </Box>
                  </GridItem>
                  <GridItem
                    w={isMobile ? "21rem" : "100%"}
                    h="40"
                    bg="gray.50"
                    borderRadius={"md"}
                    p={2}
                    px={8}
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignContent={"center"}
                  >
                    <Flex
                      flexDir={isMobile ? "column" : "row"}
                      overflowY={isMobile ? "auto" : "hidden"}
                      gap={isMobile ? 0 : 8}
                    >
                      <Box>
                        <Text fontWeight="semibold" mb={2}>
                          Nota Fiscal
                        </Text>
                        <Flex
                          flexDirection={isMobile ? "row" : "column"}
                          gap={2}
                        >
                          <Button
                            variant={notaFiscal === 0 ? "solid" : "outline"}
                            bg={notaFiscal === 0 ? "green.500" : "transparent"}
                            color={notaFiscal === 0 ? "white" : "green.500"}
                            borderColor="green.500"
                            _hover={{
                              bg: notaFiscal === 0 ? "green.600" : "green.50",
                            }}
                            onClick={() => setNotaFiscal(0)}
                            width={isMobile ? "full" : "120px"}
                          >
                            Factura
                          </Button>
                          <Button
                            variant={notaFiscal === 1 ? "solid" : "outline"}
                            bg={notaFiscal === 1 ? "green.500" : "transparent"}
                            color={notaFiscal === 1 ? "white" : "green.500"}
                            borderColor="green.500"
                            _hover={{
                              bg: notaFiscal === 1 ? "green.600" : "green.50",
                            }}
                            onClick={() => setNotaFiscal(1)}
                            width={isMobile ? "full" : "120px"}
                          >
                            Nota Comun
                          </Button>
                        </Flex>
                      </Box>

                      {notaFiscal === 1 ? (
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          justifyContent={"center"}
                          pt={5}
                        >
                          <Box
                            textAlign={"center"}
                            mb={2}
                            display={"flex"}
                            alignItems={"center"}
                          >
                            <FormLabel>Nro. de Registro:</FormLabel>
                            <Text
                              size={"xl"}
                              fontWeight={"bold"}
                              textAlign={"center"}
                            >
                              {" "}
                              {ultimaVentaId}{" "}
                            </Text>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          justifyContent={"center"}
                          pt={5}
                        >
                          <Box
                            textAlign={"center"}
                            mb={2}
                            display={"flex"}
                            alignItems={"center"}
                          >
                            <FormLabel>Nro. de timbrado</FormLabel>
                            <Text
                              size={"xl"}
                              fontWeight={"bold"}
                              textAlign={"center"}
                            >
                              {" "}
                              {facturaData[0]?.d_nrotimbrado}{" "}
                            </Text>
                          </Box>

                          <Box
                            textAlign={"center"}
                            mb={2}
                            display={"flex"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                          >
                            <FormLabel>Nro. de Factura</FormLabel>
                            <InputGroup>
                              <InputLeftAddon>001 001</InputLeftAddon>
                              <Input
                                isDisabled={notaFiscal === 1}
                                type="text"
                                placeholder={
                                  facturaData[0]?.d_nro_secuencia + 1
                                }
                                value={numeroFactura}
                                onChange={(e) =>
                                  setNumeroFactura(e.target.value)
                                }
                                width={isMobile ? "full" : "180px"}
                                bg={"white"}
                              />
                            </InputGroup>
                          </Box>
                        </Box>
                      )}
                      <Box
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                      >
                        <FormLabel>Metodos de pago</FormLabel>
                        <Select
                          bg={"white"}
                          placeholder="Seleccionar metodo de pago"
                          value={metodoPago}
                          onChange={(e) =>
                            setMetodoPago(Number(e.target.value))
                          }
                        >
                          {metodosPago.map((metodo) => (
                            <option
                              key={metodo.me_codigo}
                              value={metodo.me_codigo}
                            >
                              {metodo.me_descripcion}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    </Flex>
                  </GridItem>

                  <GridItem
                    w="100%"
                    h={
                      cobrarEnBalconParsed.valor === "0"
                        ? "0"
                        : isMobile
                        ? "auto"
                        : "40"
                    }
                    bg="blue.600"
                    borderRadius={"md"}
                    p={2}
                    px={4}
                  >
                    <Flex
                      gap={isMobile ? 2 : 4}
                      display={
                        cobrarEnBalconParsed.valor === "0" ? "none" : "flex"
                      }
                      justifyContent={"space-between"}
                      flexDir={isMobile ? "column" : "row"}
                    >
                      <Flex
                        flexDir={isMobile ? "row" : "column"}
                        justifyContent={isMobile ? "space-between" : "center"}
                        alignItems={"flex-end"}
                      >
                        <FormLabel color={"white"}>
                          <strong>
                            {condicionVenta === 1
                              ? "Total Entrega Inicial:"
                              : "Total Neto:"}
                          </strong>
                        </FormLabel>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "x-large" : "xxx-large"}
                        >
                          {formatCurrency(
                            condicionVenta === 1
                              ? entregaInicial
                              : calcularTotal()
                          )}
                        </Text>
                      </Flex>
                      <Flex
                        flexDir={isMobile ? "row" : "column"}
                        justifyContent={isMobile ? "space-between" : "center"}
                        alignItems={"flex-end"}
                      >
                        <FormLabel color={"white"} pb={isMobile ? 0 : 6}>
                          <strong>Recibido:</strong>
                        </FormLabel>
                        <Input
                          height={isMobile ? "40px" : "60px"}
                          type="number"
                          placeholder="Gs."
                          value={montoRecibido}
                          onChange={(e) =>
                            setMontoRecibido(Number(e.target.value))
                          }
                          width={isMobile ? "full" : "240px"}
                          bg={"white"}
                          fontSize={isMobile ? "x-large" : "xxx-large"}
                        />
                      </Flex>
                      <Flex
                        flexDir={isMobile ? "row" : "column"}
                        justifyContent={isMobile ? "space-between" : "center"}
                        alignItems={"flex-end"}
                      >
                        <FormLabel color={"white"}>
                          <strong>Faltante:</strong>
                        </FormLabel>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "x-large" : "xxx-large"}
                        >
                          {formatCurrency(faltante(montoRecibido))}
                        </Text>
                      </Flex>
                      <Flex
                        flexDir={isMobile ? "row" : "column"}
                        justifyContent={isMobile ? "space-between" : "center"}
                        alignItems={"flex-end"}
                      >
                        <FormLabel color={"white"}>
                          <strong>Vuelto:</strong>
                        </FormLabel>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "x-large" : "xxx-large"}
                        >
                          {formatCurrency(vuelto(montoRecibido))}
                        </Text>
                      </Flex>
                    </Flex>
                  </GridItem>
                </Box>
                <Flex justify="flex-end" mt={4}>
                  <Button
                    colorScheme="red"
                    onClick={handleCloseFinalizarVentaModal}
                  >
                    Cancelar
                  </Button>
                  <Button colorScheme="blue" ml={4} onClick={finalizarVenta}>
                    Finalizar
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      </ChakraProvider>
    </div>
  );
}
