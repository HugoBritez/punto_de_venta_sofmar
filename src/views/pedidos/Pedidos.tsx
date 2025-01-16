import React, { useEffect, useRef, useState } from "react";
import { Minus, ShoppingCart, WalletCards } from "lucide-react";
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
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  Stack,
  Textarea,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "@/services/AuthContext";
import { api_url } from "@/utils";
import { debounce } from "lodash";
import VentaModal from "../ventas/imprimirVenta";
import Auditar from "@/services/AuditoriaHook";
import ResumenVentas from "../ventas/ResumenVentas";

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
}

type ModalType = "venta" | "resumen" | "observaciones" | null;

const tasasDeCambio: { [key: string]: number } = {
  USD: 0.00013,
  PYG: 1,
};

interface ItemEditado {
  ar_codigo: number;
  nombre_editado: string;
}

const saveItemsToLocalStorage = (items: any[]) => {
  localStorage.setItem("cartItems", JSON.stringify(items));
};

const loadItemsFromLocalStorage = (): any[] => {
  const savedItems = localStorage.getItem("cartItems");
  return savedItems ? JSON.parse(savedItems) : [];
};

export default function Pedidos() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
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
      editarDescripcion?: number;
    }[]
  >(loadItemsFromLocalStorage());
  const [selectedItem, setSelectedItem] = useState<
    (typeof articulos)[0] | null
  >(null);
  const [condicionVenta, setCondicionVenta] = useState(0);
  const [isMobile] = useMediaQuery("(max-width: 48em)");
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
  const [newPedidoId, setNewPedidoId] = useState<number | null>(null);
  const [, setError] = useState<string | null>(null);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [entregaInicial, setEntregaInicial] = useState(0);
  const [cuotas, setCuotas] = useState(1);
  const [buscarSoloConStock, setBuscarSoloConStock] = useState(true);
  const toast = useToast();
  const { auth } = useAuth();
  const vendedorRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const articuloRef = useRef<HTMLInputElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setPedidoFinalizado] = useState<any>(null);
  const [, setDetallePedidoFinalizado] = useState<any[]>([]);
  const [, setClienteInfo] = useState<any>(null);
  const [, setSucursalInfo] = useState<any>(null);
  const [, setVendedorInfo] = useState<any>(null);
  const [isFinalizarVentaModalOpen, setIsFinalizarVentaModalOpen] =
    useState(false);

  const operadorActual = localStorage.getItem("user_id");
  const [itemsEditados, setItemsEditados] = useState<ItemEditado[]>([]);
  const [listaPrecios, setListaPrecios] = useState<any[0]>([]);
  const [listaPrecio, setListaPrecio] = useState("");
  const [obs, setObs] = useState("");
  const [tipo, setTipo] = useState(0);
  const [zona, setZona] = useState(0);
  const [acuerdoCliente, setAcuerdoCliente] = useState(1);
  const [consignacion, setConsignacion] = useState(0);
  const [bonificacion, setBonificacion] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const operadorMovimiento = Number(
    localStorage.getItem("operador_movimiento")
  );

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
        const response = await axios.get(
          operadorMovimiento === 1
            ? `${api_url}clientes?vendedor=${operadorActual}`
            : `${api_url}clientes`
        );
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

    fetchListasPrecios();
    fetchSucursales();
    fetchDepositos();
    fetchClientes();
    fetchVendedores();
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
        editarDescripcion: selectedItem.ar_editar_desc,
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
        setVendedor(filteredVendedores[0].op_codigo);
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

  const pedidoData = {
    pedido: {
      p_nropedido: "",
      p_cliente: clienteSeleccionado?.cli_codigo,
      p_operador: operadorActual,
      p_deposito: parseInt(deposito),
      p_moneda: moneda === "PYG" ? 1 : 0,
      p_fecha: fecha,
      p_credito: condicionVenta,
      p_sucursal: parseInt(sucursal),
      p_descuento:
        descuentoTipo === "porcentaje"
          ? items.reduce((acc, item) => acc + item.subtotal, 0) *
            (descuentoValor / 100)
          : descuentoValor,
      p_vendedor: (() => {
        const normalize = (str: string) =>
          typeof str === "string" ? str.toLowerCase().trim() : "";
        const vendedor = vendedores.find(
          (v) => normalize(v.op_nombre) === normalize(operador)
        );
        return vendedor ? vendedor.op_codigo : 1;
      })(),
      p_obs: obs,
      p_estado: 1,
      p_area: 5,
      p_tipo_estado: 1,
      p_imprimir: 0,
      p_interno: "",
      p_tipo: tipo, // 0 = normal 1 = por telefono 2 = por fb
      p_entrega: entregaInicial,
      p_cantcuotas: cuotas,
      p_consignacion: consignacion,
      p_autorizar_a_contado: 0,
      p_zona: zona, //'0=ShoW R; 1=Encomienda; 2=Regional',
      p_acuerdo: 0, //
      p_longitud: "",
      p_latitud: "",
    },
    detalle_pedido: items.map((item) => {
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
        dp_articulo: item.id,
        dp_descipcion_art: item.nombre,
        dp_cantidad: item.cantidad,
        dp_precio: bonificacion === 1 ? 0 : item.precioUnitario,
        dp_descuento: itemDescuento,
        dp_exentas: deve_exentas,
        dp_cinco: deve_cinco,
        dp_diez: deve_diez,
        dp_lote: "",
        dp_vencimiento: "0001-01-01",
        dp_vendedor: operadorActual,
        dp_codigolote: 0,
        dp_facturado: 0,
        dp_porcomision: 0,
        dp_actorizado: 0,
        dp_habilitar: 1,
        dp_bonif: bonificacion,
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
        dp_articulo: item.id,
        dp_descipcion_art: item.nombre,
        dp_cantidad: item.cantidad,
        dp_precio: item.precioUnitario,
        dp_descuento: itemDescuento,
        dp_exentas: deve_exentas,
        dp_cinco: deve_cinco,
        dp_diez: deve_diez,
        dp_lote: "",
        dp_vencimiento: "",
        dp_vendedor: operadorActual,
        dp_codigolote: 0,
        dp_facturado: 0,
        dp_porcomision: 0,
        dp_actorizado: 0,
        dp_habilitar: 1,
        dp_bonif: 0,
      };
    }),
  };

  const finalizarPedido = async () => {
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
        description: "Por favor, ingrese la cantidad de cuotas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${api_url}pedidos/agregar-pedido`,
        pedidoData,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const newPedidoId = response.data.body;
        setNewPedidoId(response.data.body);
        console.log(newPedidoId);

        setPedidoFinalizado(localVentaData.venta);
        setDetallePedidoFinalizado(localVentaData.detalle_ventas);
        setClienteInfo(clienteSeleccionado);
        setSucursalInfo(sucursales.find((s) => s.id.toString() === sucursal));
        setVendedorInfo(vendedores.find((v) => v.op_codigo === operador));
        setItems([]);
        saveItemsToLocalStorage([]); // Limpiar el localStorage
        setClienteSeleccionado(null);
        setClienteBusqueda("");
        setDescuentoValor(0);
        setCondicionVenta(0);
        setNumeroFactura("");
        Auditar(
          65,
          8,
          newPedidoId,
          operadorActual ? parseInt(operadorActual) : 0,
          `Pedido ID ${newPedidoId} realizado por ${operador} en la sucursal ${sucursal} por un total de ${calcularTotal()}`
        );

        toast({
          title: "Pedido finalizado",
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
    setPedidoFinalizado(null);
    setDetallePedidoFinalizado([]);
    setClienteInfo(null);
    setSucursalInfo(null);
    setVendedorInfo(null);
  };

  const handleOpenFinalizarVentaModal = () => {
    setIsFinalizarVentaModalOpen(true);
  };

  const handleCloseFinalizarVentaModal = () => {
    setIsFinalizarVentaModalOpen(false);
    borrarDatosVentaModal();
  };

  const borrarDatosVentaModal = () => {
    setEntregaInicial(0);
    setCuotas(1);
    setNumeroFactura("");
  };

  useEffect(() => {
    console.log("estado del acuerdo con el cliente", acuerdoCliente);
  }, [acuerdoCliente, clienteSeleccionado]);

  const handleOpenOtherModal = (modalType: ModalType) => {
    setActiveModal(modalType);
  };

  const handleCloseOtherModal = () => {
    setActiveModal(null);
  };

  return (
    <div>
      <ChakraProvider>
      <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2} shadow="xl" rounded="lg" overflowY={'auto'}>
        <Box >
          <Box
            w="100%"
            h={"100%"}
            p={isMobile ? 2 : 4}
            bg="white"
            fontSize={"smaller"}
            mb={16}
            rounded={"lg"}
          >
            <Flex
              bgGradient="linear(to-r, blue.500, blue.600)"
              color="white"
              p={isMobile ? 4 : 6}
              alignItems="center"
              rounded="lg"
            >
              <ShoppingCart size={24} className="mr-2" />
              <Heading size={isMobile ? "sm" : "md"}>Registrar Pedido</Heading>
            </Flex>
            <Flex flexDirection={isMobile ? "column" : "row"}>
              <Box p={isMobile ? 2 : 4}>
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
                  <Flex align={"end"} fill={"row"} justify={"space-between"}>
                    <Box>
                      <FormLabel>Fecha</FormLabel>
                      <Input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </Box>
                    <Button
                      colorScheme="blue"
                      size="md"
                      ml={2}
                      onClick={() => handleOpenOtherModal("resumen")}
                      width={"100%"}
                      variant={"outline"}
                    >
                      <WalletCards />
                      Consultar Ventas
                    </Button>
                  </Flex>
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
                            <Text fontWeight="bold">{vendedor.op_nombre}</Text>
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
                          const credit = Number(cliente.cli_limitecredito) || 0;
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
                              <Text fontWeight="bold">{cliente.cli_razon}</Text>
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
                </Grid>
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
                <Box
                  overflowX={"auto"}
                  height={"300px"}
                  width={isMobile ? "100%" : "1400px"}
                >
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
                            {item.editarDescripcion === 0 ? (
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
              </Box>
              <Flex
                p={isMobile ? 2 : 4}
                rounded="lg"
                flexDirection={"column"}
                gap={4}
              >
                <Flex
                  justifyContent={"space-between"}
                  gap={4}
                  flexDir={"column"}
                >
                  <Box p={2}>
                    <RadioGroup
                      colorScheme="green"
                      defaultValue="0"
                      onChange={(value) => setZona(Number(value))}
                    >
                      <Stack spacing={[1, 5]} direction={"row"}>
                        <Radio value="0">Show Room</Radio>
                        <Radio value="1">Encomienda</Radio>
                        <Radio value="2">N. Nacional</Radio>
                      </Stack>
                    </RadioGroup>
                  </Box>
                  <Box p={2}>
                    <RadioGroup
                      colorScheme="blue"
                      defaultValue="0"
                      onChange={(value) => setTipo(Number(value))}
                    >
                      <Stack spacing={[1, 5]} direction={"row"}>
                        <Radio value="0">Vendedor</Radio>
                        <Radio value="1">Telefono</Radio>
                        <Radio value="2">Facebook</Radio>
                      </Stack>
                    </RadioGroup>
                  </Box>
                </Flex>

                <Flex
                  gap={2}
                  flexDirection={isMobile ? "row" : "column"}
                  alignItems={"center"}
                >
                  <Text fontSize="md" fontWeight={"semibold"}>
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
                  <Text fontSize="sm" fontWeight="bold">
                    Total Exentas: {formatCurrency(calcularTotalExcentas())}
                  </Text>
                  <Divider
                    borderWidth={"2px"}
                    borderColor={"blue.500"}
                    my={1}
                  />
                  <Text fontSize="sm" fontWeight="bold">
                    Total IVA 5%: {formatCurrency(calcularTotal5())}
                  </Text>
                  <Divider
                    borderWidth={"2px"}
                    borderColor={"blue.500"}
                    my={1}
                  />
                  <Text fontSize="sm" fontWeight="bold">
                    Total IVA 10%: {formatCurrency(calcularTotal10())}
                  </Text>
                  <Divider
                    borderWidth={"2px"}
                    borderColor={"blue.500"}
                    my={1}
                  />
                  <Text fontSize="md" fontWeight="bold">
                    Total Impuestos: {formatCurrency(calcularTotalImpuestos())}
                  </Text>
                </Box>
                <Box textAlign={"right"} mt={isMobile ? 2 : 0}>
                  <Text fontSize="lg" fontWeight="bold">
                    Subtotal:{" "}
                    {formatCurrency(
                      items.reduce((acc, item) => acc + item.subtotal, 0)
                    )}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    Descuento General:{" "}
                    {descuentoTipo === "porcentaje"
                      ? `${descuentoValor}%`
                      : formatCurrency(descuentoValor * tasasDeCambio[moneda])}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    Total Neto: {formatCurrency(calcularTotal())}
                  </Text>
                  <Flex gap={4}>
                    <Button
                      colorScheme="red"
                      mt={4}
                      width={isMobile ? "full" : "auto"}
                      onClick={cancelarVenta}
                    >
                      Cancelar Pedido
                    </Button>
                    <Button
                      colorScheme="blue"
                      mt={4}
                      width={isMobile ? "full" : "auto"}
                      onClick={handleOpenFinalizarVentaModal}
                    >
                      Guardar Pedido
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Box>
        </Box>
        </Box>
        <VentaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          ventaId={newPedidoId}
        />
        <Modal
          isOpen={isFinalizarVentaModalOpen}
          onClose={handleCloseFinalizarVentaModal}
          size={isMobile ? "sm" : "5xl"}
          isCentered={true}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Finalizar Pedido</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box display={"grid"} gridTemplateRows={"repeat(3. 1fr)"} gap={4}>
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
                  h={isMobile ? "80" : "auto"}
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
                            bg: condicionVenta === 0 ? "green.600" : "green.50",
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
                            bg: condicionVenta === 1 ? "green.600" : "green.50",
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
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      gap={4}
                    >
                      <Box
                        textAlign={"center"}
                        mb={2}
                        display={"flex"}
                        flexDir={"row"}
                        justifyContent={"space-between"}
                        alignItems={isMobile ? "flex-start" : "center"}
                      >
                        <FormLabel>Entrega Inicial</FormLabel>
                        <Input
                          fontWeight={"bold"}
                          fontSize={"large"}
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
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        flexDir={"row-reverse"}
                      >
                        <Checkbox
                          value={consignacion}
                          onChange={() => setConsignacion(consignacion ? 0 : 1)}
                          fontWeight={"bold"}
                        >
                          A consignación
                        </Checkbox>
                      </Box>
                    </Box>
                  </Flex>
                </GridItem>
                <GridItem
                  w={isMobile ? "21rem" : "100%"}
                  h={isMobile ? "auto" : "20"}
                  bg="gray.50"
                  borderRadius={"md"}
                  p={2}
                  px={8}
                  display={"flex"}
                  alignContent={"center"}
                  flexDir={"column"}
                >
                  <Flex
                    gap={4}
                    justifyContent={"space-around"}
                    alignItems={"center"}
                    height={"100%"}
                  >
                    <Box>
                      <Text fontWeight={"bold"}>Limite de crédito:</Text>
                      <Text
                        color={getCreditColor(
                          clienteSeleccionado?.cli_limitecredito || 0
                        )}
                        fontWeight={"bold"}
                      >
                        {formatCurrency(
                          clienteSeleccionado?.cli_limitecredito || 0
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight={"bold"}>Saldo a pagar:</Text>
                      <Text fontWeight={"bold"} color={"red.500"}>
                        {formatCurrency(entregaInicial)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight={"bold"}>Saldo restante:</Text>
                      <Text fontWeight={"bold"} color={"gray.500"}>
                        {formatCurrency(
                          (clienteSeleccionado?.cli_limitecredito ?? 0) -
                            entregaInicial
                        )}
                      </Text>
                    </Box>
                  </Flex>
                </GridItem>

                <GridItem
                  w={isMobile ? "21rem" : "100%"}
                  h={isMobile ? "auto" : "40"}
                  bg="gray.50"
                  borderRadius={"md"}
                  p={2}
                  px={8}
                  display={"flex"}
                  alignContent={"center"}
                  flexDir={"column"}
                >
                  <Text mb="8px" fontWeight={"bold"}>
                    Observaciones del pedido:
                  </Text>
                  <Textarea
                    bg={"white"}
                    borderRadius={"md"}
                    value={obs}
                    onChange={(e) => {
                      setObs(e.target.value);
                    }}
                    placeholder="Escriba aqui sus observaciones..."
                    size="sm"
                  />
                </GridItem>
                <GridItem
                  w={isMobile ? "21rem" : "100%"}
                  h={isMobile ? "auto" : "40"}
                  bg="blue.600"
                  borderRadius={"md"}
                  p={2}
                  px={8}
                  display={"flex"}
                  alignContent={"center"}
                  flexDir={"column"}
                >
                  <Flex justifyContent={"space-around"} h={"100%"} gap={2}>
                    <Box
                      display={"flex"}
                      flexDir={"column"}
                      w={"50%"}
                      p={2}
                      justifyContent={"center"}
                      alignItems={"center"}
                      gap={8}
                    >
                      <Flex gap={4}>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          <strong>Total factura:</strong>
                        </Text>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          {formatCurrency(calcularTotal())}
                        </Text>
                      </Flex>
                      <Flex gap={4}>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          <strong>Desc. p/ factura:</strong>
                        </Text>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          {formatCurrency(calcularTotal())}
                        </Text>
                      </Flex>
                    </Box>
                    <Box
                      w={"50%"}
                      p={2}
                      display={"flex"}
                      flexDir={"column"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      gap={8}
                    >
                      <Flex gap={4}>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          <strong>Total desc. p/ Items:</strong>
                        </Text>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          {formatCurrency(calcularTotal())}
                        </Text>
                      </Flex>
                      <Flex gap={4}>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "large" : "xx-large"}
                        >
                          <strong>Total a pagar:</strong>
                        </Text>
                        <Text
                          color={"white"}
                          fontSize={isMobile ? "small" : "xx-large"}
                        >
                          {formatCurrency(calcularTotal())}
                        </Text>
                      </Flex>
                    </Box>
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
                <Button colorScheme="blue" ml={4} onClick={finalizarPedido}>
                  Finalizar
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={activeModal === "resumen"}
          onClose={handleCloseOtherModal}
          size="full"
          isCentered={true}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              <ResumenVentas clienteSeleccionado={clienteSeleccionado} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
}
