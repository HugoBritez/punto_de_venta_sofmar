import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  Input,
  useToast,
  Button,
  Flex,
  useMediaQuery,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  FormLabel,
  Select,
  Textarea,
  Switch,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { api_url } from "@/utils";
import {
  HandCoins,
  X,
  Search,
  Trash,
  Printer,
  Filter,
  PenBox,
  FileInput,
} from "lucide-react";
import { useAuth } from "@/shared/services/AuthContext";
import Auditar from "@/shared/services/AuditoriaHook";
import { debounce } from "lodash";
import {
  Vendedor,
  Cliente,
  Moneda,
  Sucursal,
  ArticulosDirecta,
} from "@/shared/types/shared_interfaces";
import FloatingCard from "@/shared/modules/FloatingCard";
import UltimaVenta from "./ultimaVenta";
import { useFacturacionElectronicaStore } from "@/stores/facturacionElectronicaStore";
import { useFacturaSendTesting } from "@/shared/hooks/useFacturaSendTesting";
import { FacturaSendResponse } from "@/shared/types/factura_electronica/types";
import ConfirmationModal from "@/shared/modules/ConfirmModal";
import ModeloFacturaNuevo from "./../facturacion/ModeloFacturaNuevo";
import ModeloNotaComun from "./../facturacion/ModeloNotaComun";
import { createRoot } from "react-dom/client";
import { useFacturaSend } from "@/shared/hooks/useFacturaSend";
import { useTipoImpresionFacturaStore } from "@/stores/tipoImpresionFacturaStore";
import ModeloFacturaReport from "../facturacion/ModeloFacturaReport";
import { ClienteViewModel } from "@/models/viewmodels/ClienteViewModel";
import { VentaViewModel } from "@/models/viewmodels/Ventas/VentaViewModel";

interface DetalleVenta {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  descripcion_editada?: string;
  cantidad: number;
  precio: number;
  precio_number: number;
  descuento: number;
  descuento_number: number;
  exentas: number;
  exentas_number: number;
  cinco: number;
  cinco_number: number;
  diez: number;
  diez_number: number;
  lote: string;
  vencimiento: string;
  largo: string;
  ancho: string;
  altura: string;
  mt2: string;
  unidad_medida: number;
}

interface ConsultaDeVentasProps {
  clienteSeleccionado?: ClienteViewModel | null;
  onSelectVenta?: (venta: VentaViewModel, detalleVenta: DetalleVenta[]) => void;
  onCloseVenta?: () => void;
  isModal?: boolean;
}

export default function ResumenVentas({
  clienteSeleccionado,
  onSelectVenta,
  onCloseVenta,
  isModal = false,
}: ConsultaDeVentasProps) {
  const [ventas, setVentas] = useState<VentaViewModel[]>([]);
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(
    null
  );
  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [saleID, setSaleID] = useState<number | null>(null);
  const { auth } = useAuth();
  const [obsAnulacion, setObsAnulacion] = useState<string>("");
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const DEBOUNCE_DELAY = 300;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionadoFiltro, setClienteSeleccionadoFiltro] =
    useState<Cliente | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorSeleccionadoFiltro, setVendedorSeleccionadoFiltro] =
    useState<Vendedor | null>(null);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedaSeleccionadaFiltro, setMonedaSeleccionadaFiltro] =
    useState<Moneda | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionadaFiltro, setSucursalSeleccionadaFiltro] =
    useState<Sucursal | null>(null);
  const [articulos, setArticulos] = useState<ArticulosDirecta[]>([]);
  const [articuloSeleccionadoFiltro, setArticuloSeleccionadoFiltro] =
    useState<ArticulosDirecta | null>(null);
  const [factura, setFactura] = useState<string>("");
  const [estadoVenta, setEstadoVenta] = useState<number>(3);
  const [venta, setVenta] = useState<string>("");
  const [isVisibleArticulo, setIsVisibleArticulo] = useState(false);
  const [isVisibleCliente, setIsVisibleCliente] = useState(false);
  const [isVisibleVendedor, setIsVisibleVendedor] = useState(false);
  const [incluirRemisiones, setIncluirRemisiones] = useState(false);
  const [listarFacturasSinCDC, setListarFacturasSinCDC] = useState(false);

  const [busquedaArticulo, setBusquedaArticulo] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaVendedor, setBusquedaVendedor] = useState("");

  const [ventaSeleccionadaInterna, setVentaSeleccionadaInterna] =
    useState<VentaViewModel | null>(null);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { usaFacturaElectronica, fetchUsaFacturaElectronica } =
    useFacturacionElectronicaStore();

  const { verificarEstadoFactura } = useFacturaSendTesting();

  const { enviarFacturas, cancelarFactura, inutilizarFactura } = useFacturaSend();

  const [confirmarReenvio, setConfirmarReenvio] = useState(false);
  const mensajeConfirmacionReenvio = useRef<string>("");

  const { tipoImpresion, fetchTipoImpresion } = useTipoImpresionFacturaStore();
  const [ tipoImpresionFactura, setTipoImpresionFactura] = useState<number | null>(null);

  function determinarTipoDeImpresionFactura(){
    if (
      tipoImpresion ===
        "thisform.imprimirventa1.imprimir_factura_elect_report" ||
      tipoImpresion ===
        "thisform.imprimirventa1.imprimirlegal_report_31"
    ) {
      setTipoImpresionFactura(1); //impresion hoja grande
      console.log("impresion hoja grande");
    } else if (
      tipoImpresion ===
      "thisform.imprimirventa1.imprimir_factura_ticket_electronica"
    ) {
      setTipoImpresionFactura(2); // impresion tipo ticket
      console.log("impresion tipo ticket");
    }
    else {
      setTipoImpresionFactura(null);
    }
  }

  const setColor = (estado: string | number) => {
    if (estado === 0) {
      return "bg-pink-200";
    }
    return "bg-white";
  };

  const fetchArticulosDirecta = async (busqueda: string) => {
    try {
      const response = await axios.get(`${api_url}articulos/directa`, {
        params: {
          busqueda,
        },
      });
      setArticulos(response.data.body);
    } catch (error) {}
  };

  const fetchSucursales = async () => {
    const response = await axios.get(`${api_url}sucursales/listar`);
    setSucursales(response.data.body);
    setSucursalSeleccionadaFiltro(response.data.body[0]);
  };

  const fetchClientes = async (busqueda: string) => {
    const response = await axios.get(`${api_url}clientes/get-clientes`, {
      params: {
        buscar: busqueda,
      },
    });
    setClientes(response.data.body);
    setClienteSeleccionadoFiltro(response.data.body[0]);
  };

  const fetchVendedores = async (busqueda: string) => {
    const response = await axios.get(`${api_url}usuarios/vendedores`, {
      params: {
        buscar: busqueda,
      },
    });
    setVendedores(response.data.body);
    setVendedorSeleccionadoFiltro(response.data.body[0]);
  };

  const fetchMonedas = async () => {
    const response = await axios.get(`${api_url}monedas/`);
    setMonedas(response.data.body);
    setMonedaSeleccionadaFiltro(response.data.body[0]);
  };

  const {
    isOpen: isAdvertenciaModalOpen,
    onOpen: handleOpenAdvertenciaModal,
    onClose: handleCLoseAdvertenciaModal,
  } = useDisclosure();

  const debouncedEstadoChange = useCallback(
    debounce((value: string) => {
      setEstadoVenta(Number(value));
    }, DEBOUNCE_DELAY),
    []
  );

  useEffect(() => {
    fetchSucursales();
    fetchMonedas();
    fetchVentas(1, false);
  }, []);

  useEffect(() => {
    fetchTipoImpresion();
    console.log('tipo impresion', tipoImpresion)
  }, [sucursalSeleccionadaFiltro]);

  useEffect(() => {
    determinarTipoDeImpresionFactura();
  }, [tipoImpresion]);

  useEffect(() => {
    fetchUsaFacturaElectronica(Number(sucursalSeleccionadaFiltro?.id));
    console.log('usa factura electronica', usaFacturaElectronica)
  }, [sucursalSeleccionadaFiltro]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchVentas(nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const fetchVentas = async (pageNum = 1, append = false) => {
    setIsLoadingMore(pageNum > 1);
    setIsLoading(pageNum === 1);
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        sucursal: sucursalSeleccionadaFiltro?.id,
        cliente: clienteSeleccionado
          ? clienteSeleccionado.cli_codigo
          : clienteSeleccionadoFiltro?.cli_codigo,
        vendedor: vendedorSeleccionadoFiltro?.id,
        articulo: articuloSeleccionadoFiltro?.id,
        moneda: monedaSeleccionadaFiltro?.mo_codigo,
        factura: factura,
        venta: venta,
        estadoVenta,
        incluirRemisiones,
        listarFacturasSinCDC,
        page: pageNum,
        itemsPorPagina: 50,
      });

      const newVentas = response.data.body;
      setHasMore(newVentas.length === 20);

      if (append) {
        setVentas((prev) => [...prev, ...newVentas]);
      } else {
        setVentas(newVentas);
        setPage(1);
      }
      console.log(newVentas);
    } catch (error) {
      toast({
        title: "Error al cargar las ventas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchDetalleVenta = async (codigo: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api_url}venta/detalles?cod=${codigo}`
      );
      setDetalleVenta(response.data.body);
      setSaleID(codigo);
    } catch (error) {
      toast({
        title: "Error al cargar el detalle de la venta",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const anularVenta = async (metodo: number) => {
    try {
      const response = await axios.post(`${api_url}venta/anular-venta`, {
        codigo: ventaSeleccionada ?? ventaSeleccionadaInterna?.codigo,
        userId: auth?.userId,
        metodo: metodo,
        obs: obsAnulacion,
      });
      console.log(response.data);
      toast({
        title: "Venta anulada",
        description: "La venta ha sido anulada exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchVentas();

      if (ventaSeleccionadaInterna?.ve_cdc && metodo === 1 && ventaSeleccionadaInterna?.tipo_documento === 1 && usaFacturaElectronica)  {
        const responseCancelacion = await cancelarFactura(
          {
            cdc: ventaSeleccionadaInterna?.ve_cdc,
            motivo: obsAnulacion,
          }
        );
        console.log(responseCancelacion);

        const responseInutilizacion = await inutilizarFactura({
          tipoDocumento: ventaSeleccionadaInterna?.tipo_documento,
          establecimiento: ventaSeleccionadaInterna?.establecimiento,
          punto: ventaSeleccionadaInterna?.punto_emision,
          desde: Number(ventaSeleccionadaInterna?.numero_factura),
          hasta: Number(ventaSeleccionadaInterna?.numero_factura),
          motivo: obsAnulacion,
        });
        console.log(responseInutilizacion);
      }
      Auditar(
        5,
        3,
        ventaSeleccionada,
        Number(auth?.userId),
        `Venta Nro. ${ventaSeleccionada} anulada por ${auth?.userName}`
      );
    } catch (error: any) {
      toast({
        title: "Error al anular la venta",
        description:
          error.response?.data?.body || "Intentelo de nuevo mas tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectVenta = (venta: VentaViewModel) => {
    setVentaSeleccionadaInterna(venta);
    fetchDetalleVenta(venta.codigo);
    if (onSelectVenta) {
      onSelectVenta(venta, detalleVenta);
    }
    if (onCloseVenta) {
      onCloseVenta;
    }
  };

  const handleFechaDesdeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFechaDesde(e.target.value);
    },
    []
  );

  const handleFechaHastaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFechaHasta(e.target.value);
    },
    []
  );

  const handleBuscarArticulo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaArticulo(e.target.value);
    setIsVisibleArticulo(true);
    fetchArticulosDirecta(e.target.value);
  };

  const handleSelectArticulo = (articulo: ArticulosDirecta) => {
    setArticuloSeleccionadoFiltro(articulo);
    setBusquedaArticulo(articulo.descripcion); // Actualizar el texto de búsqueda
    setIsVisibleArticulo(false);
  };

  const handleBuscarCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsVisibleCliente(true);
    fetchClientes(e.target.value);
    setBusquedaCliente(e.target.value);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSeleccionadoFiltro(cliente);
    setIsVisibleCliente(false);
    setBusquedaCliente(cliente.cli_razon);
  };

  const handleBuscarVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsVisibleVendedor(true);
    fetchVendedores(e.target.value);
    setBusquedaVendedor(e.target.value);
  };

  const handleSelectVendedor = (vendedor: Vendedor) => {
    setVendedorSeleccionadoFiltro(vendedor);
    setIsVisibleVendedor(false);
    setBusquedaVendedor(vendedor.op_nombre);
  };

  const [isImprimirModalOpen, setIsImprimirModalOpen] = useState(false);

  // Función para formatear moneda (requerida por UltimaVenta)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para manejar el click en el botón de imprimir
  const handleImprimirClick = () => {
    if (ventaSeleccionadaInterna) {
      setIsImprimirModalOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Debe seleccionar una venta para imprimir",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function actualizarCdcVenta(ventaId: number, cdc: string, qr: string) {
    try {
      console.log("Intentando actualizar CDC con:", { ventaId, cdc, qr });
      const response = await axios.post(`${api_url}venta/actualizar-cdc`, {
        codigo: ventaId,
        cdc: cdc,
        qr: qr,
      });
      console.log("Respuesta de actualizar CDC:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error detallado al actualizar CDC:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error; // Re-lanzamos el error para que sea manejado por el catch superior
    }
  }

  const handleConfirmarReenvio = async (cdc: string) => {
    if (!ventaSeleccionadaInterna) {
      toast({
        title: "Error",
        description: "Debe seleccionar una venta para reenviar la factura",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    if (cdc === "") {
      setConfirmarReenvio(true);
    } else {
      const response = await verificarEstadoFactura(cdc);
      console.log(response);
      if (response.result != null) {
        mensajeConfirmacionReenvio.current =
          "(La FE ya fue enviada previamente)";
      } else {
        mensajeConfirmacionReenvio.current = "";
      }
      setConfirmarReenvio(true);
    }
  };

  const handleReenviarFacturaElectronica = async (cdc: string) => {
    if (!ventaSeleccionadaInterna) {
      toast({
        title: "Error",
        description: "Debe seleccionar una venta para reenviar la factura",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const dataFactura: FacturaSendResponse = {
      tipoDocumento: 1,
      establecimiento: ventaSeleccionadaInterna?.establecimiento || 0,
      punto: ventaSeleccionadaInterna?.punto_emision || 0,
      numero: ventaSeleccionadaInterna?.numero_factura || 0,
      observacion: "",
      fecha: new Date().toISOString().split(".")[0],
      tipoEmision: 1,
      tipoTransaccion: 1,
      tipoImpuesto: 1,
      cdc: cdc || ventaSeleccionadaInterna?.ve_cdc || "",
      moneda:
        ventaSeleccionadaInterna?.moneda_id === 1
          ? "PYG"
          : ventaSeleccionadaInterna?.moneda_id === 2
          ? "USD"
          : ventaSeleccionadaInterna?.moneda_id === 3
          ? "BRL"
          : ventaSeleccionadaInterna?.moneda_id === 4
          ? "ARS"
          : "PYG",
      cambio: 0,
      cliente: {
        contribuyente:
          ventaSeleccionadaInterna?.tipo_documento === 1 ||
          ventaSeleccionadaInterna?.tipo_documento === 18
            ? true
            : false,
        ruc:
          ventaSeleccionadaInterna?.tipo_documento === 1
            ? ventaSeleccionadaInterna?.cliente_ruc
            : null,
        razonSocial: ventaSeleccionadaInterna?.cliente,
        nombreFantasia: ventaSeleccionadaInterna?.cliente_descripcion,
        tipoOperacion:
          ventaSeleccionadaInterna?.tipo_documento === 1
            ? 1
            : ventaSeleccionadaInterna?.tipo_documento === 18
            ? 3
            : 2,
        numeroCasa: "001",
        departamento: ventaSeleccionadaInterna?.departamento_id || 1,
        departamentoDescripcion:
          ventaSeleccionadaInterna?.departamento_descripcion || "",
        distrito: ventaSeleccionadaInterna?.distrito_id || 1,
        distritoDescripcion:
          ventaSeleccionadaInterna?.distrito_descripcion || "",
        direccion: ventaSeleccionadaInterna?.cliente_direccion || "",
        ciudad:
          ventaSeleccionadaInterna?.ciudad_id === 2
            ? 1
            : ventaSeleccionadaInterna?.ciudad_id || 1,
        ciudadDescripcion: ventaSeleccionadaInterna?.ciudad_descripcion || "",
        pais: "PRY",
        paisDescripcion: "Paraguay",
        tipoContribuyente: 1,
        documentoTipo: ventaSeleccionadaInterna?.tipo_documento,
        telefono: ventaSeleccionadaInterna?.cliente_telefono || "",
        celular: "595" + ventaSeleccionadaInterna?.cliente_telefono || "",
        email: ventaSeleccionadaInterna?.cliente_email?.trim() || "",
        codigo: "000" + ventaSeleccionadaInterna?.cliente_codigo_interno, //quitar el 000 para produccion
      },
      usuario: {
        documentoTipo: 1,
        documentoNumero: ventaSeleccionadaInterna?.operador_documento || "",
        nombre: ventaSeleccionadaInterna?.operador_nombre || "",
        cargo: "Vendedor",
      },
      factura: {
        presencia: 1,
      },
      condicion: {
        tipo: ventaSeleccionadaInterna?.condicion === "Crédito" ? 2 : 1,
        entregas:
          ventaSeleccionadaInterna?.condicion === "Contado"
            ? [
                {
                  tipo: 1, // Efectivo
                  monto: ventaSeleccionadaInterna?.total.toString(),
                  moneda:
                    ventaSeleccionadaInterna?.moneda_id === 1
                      ? "PYG"
                      : ventaSeleccionadaInterna?.moneda_id === 2
                      ? "USD"
                      : ventaSeleccionadaInterna?.moneda_id === 3
                      ? "BRL"
                      : ventaSeleccionadaInterna?.moneda_id === 4
                      ? "ARS"
                      : "PYG",
                  monedaDescripcion:
                    ventaSeleccionadaInterna?.moneda || "Guaraníes",
                  cambio: 0.0,
                },
              ]
            : [],
        credito:
          ventaSeleccionadaInterna?.condicion === "Crédito"
            ? {
                tipo: 1, // Plazo
                plazo: `${ventaSeleccionadaInterna?.cant_cuotas || 1} cuotas`,
                cuotas: ventaSeleccionadaInterna?.cant_cuotas || 1,
                montoEntrega: ventaSeleccionadaInterna?.entrega_inicial || 0,
                infoCuotas: Array.from(
                  { length: ventaSeleccionadaInterna?.cant_cuotas || 1 },
                  (_) => {
                    return {
                      moneda:
                        ventaSeleccionadaInterna?.moneda_id === 1
                          ? "PYG"
                          : ventaSeleccionadaInterna?.moneda_id === 2
                          ? "USD"
                          : ventaSeleccionadaInterna?.moneda_id === 3
                          ? "BRL"
                          : ventaSeleccionadaInterna?.moneda_id === 4
                          ? "ARS"
                          : "PYG",
                      monto: 0,
                      vencimiento: "",
                    };
                  }
                ),
              }
            : null,
      },
      items: detalleVenta.map((item) => {
        let ivaTipo = 1; // Por defecto, Gravado IVA
        let ivaBase = 100;
        let ivaPorcentaje = 10;
        let IVa5 = 0;
        let IVa10 = 0;
        let vartotal = 0;
        let VGravada = 0;
        let vporc = 0;
        if (item.cinco_number > 0 && item.exentas_number > 0) {
          IVa5 = Math.round((item.cinco_number / 21) * 100) / 100;
          vartotal = item.cinco_number + item.exentas_number - IVa5;
          ivaTipo = 4;
          ivaPorcentaje = 5;
          VGravada = Math.round((item.cinco_number / 1.05) * 100) / 100;
          vporc = (VGravada * 100) / vartotal;
          ivaBase = parseFloat(vporc.toFixed(8));
        } else if (item.diez_number > 0 && item.exentas_number > 0) {
          IVa10 = Math.round((item.diez_number / 11) * 100) / 100;
          vartotal = item.diez_number + item.exentas_number - IVa10;
          ivaTipo = 4;
          ivaPorcentaje = 10;
          VGravada = Math.round((item.diez_number / 1.1) * 100) / 100;
          vporc = (VGravada * 100) / vartotal;
          ivaBase = parseFloat(vporc.toFixed(8));
        } else if (item.cinco_number > 0) {
          ivaTipo = 1;
          ivaPorcentaje = 5;
          ivaBase = 100;
        } else if (item.diez_number > 0) {
          ivaTipo = 1;
          ivaPorcentaje = 10;
          ivaBase = 100;
        } else if (item.cinco_number === 0 && item.diez_number === 0 && item.exentas_number > 0) {
          ivaTipo = 3; // Exento
          ivaPorcentaje = 0;
          ivaBase = 0;
        }

        return {
          codigo: item.art_codigo,
          descripcion: item.descripcion,
          observacion: "",
          unidadMedida: item.unidad_medida || 77, // Unidad
          cantidad: item.cantidad,
          precioUnitario: item.precio_number,
          cambio: 0.0,
          ivaTipo: ivaTipo,
          ivaBase: ivaBase,
          iva: ivaPorcentaje,
          lote: item.lote || "",
          vencimiento: item.vencimiento || "",
        };
      }),
    };

    try {
      const responseFactura = await enviarFacturas([dataFactura]);
      console.log("Respuesta completa:", responseFactura);

      if (responseFactura.success === true) {
        console.log("Respuesta completa:", responseFactura);

        // Verificar si existe deList y tiene elementos
        if (
          responseFactura.result &&
          responseFactura.result.deList &&
          responseFactura.result.deList.length > 0 &&
          responseFactura.result.deList[0].cdc &&
          responseFactura.result.deList[0].qr &&
          responseFactura.result.deList[0].qr !== ""
        ) {
          console.log(
            "CDC a actualizar:",
            responseFactura.result.deList[0].cdc
          );
          console.log("QR a actualizar:", responseFactura.result.deList[0].qr);
          console.log("Código de venta:", ventaSeleccionadaInterna?.codigo);

          try {
            await actualizarCdcVenta(
              ventaSeleccionadaInterna?.codigo || 0,
              responseFactura.result.deList[0].cdc,
              responseFactura.result.deList[0].qr
            );
            console.log("CDC actualizado exitosamente");
          } catch (errorCdc) {
            console.error("Error específico al actualizar CDC:", errorCdc);
            toast({
              title: "Error al actualizar CDC",
              description:
                "La factura se envió pero hubo un error al actualizar el CDC",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
          }
        } else {
          console.warn(
            "No se encontró información de CDC/QR en la respuesta:",
            responseFactura
          );
          toast({
            title: "Advertencia",
            description:
              "La factura se envió pero no se recibió información de CDC/QR para actualizar",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
        toast({
          title: "Factura reenviada",
          description: "La factura ha sido reenviada exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        mensajeConfirmacionReenvio.current = "";
      } else {
        toast({
          title: "Error al reenviar la factura",
          description: "Por favor, intenta de nuevo más tarde",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error al reenviar la factura",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

    const reImprimirFacturaFiscalReportComponente = (ventaId: number, accion: "print" | "download" | "b64") => {
      const facturaDiv = document.createElement("div");
      facturaDiv.style.display = "none";
      document.body.appendChild(facturaDiv);

      const root = createRoot(facturaDiv);
      root.render(
        <ModeloFacturaReport
          id_venta={ventaId}
          monto_entregado={0}
          monto_recibido={0}
          vuelto={0}
          onImprimir={true}
          accion={accion}
        />
      );
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(facturaDiv);
      }, 2000);
    };


  const reImprimirFacturaFiscalComponente = (ventaId: number, accion: "print" | "download" | "b64") => {
    const facturaDiv = document.createElement("div");
    facturaDiv.style.display = "none";
    document.body.appendChild(facturaDiv);

    const root = createRoot(facturaDiv);
    root.render(
      <ModeloFacturaNuevo
        id_venta={ventaId}
        monto_entregado={ 0}
        monto_recibido={ 0}
        vuelto={0}
        onImprimir={true}
        accion={accion}
      />
    );
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(facturaDiv);
    }, 2000);
  };

  const reImprimirNotaComunComponente = (ventaId: number, accion: "print" | "download" | "b64") => {
    const notaDiv = document.createElement("div");
    notaDiv.style.display = "none";
    document.body.appendChild(notaDiv);

    const root = createRoot(notaDiv);
    root.render(<ModeloNotaComun id_venta={ventaId} onImprimir={true} accion={accion} />);
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(notaDiv);
    }, 2000);
  };

  return (
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack
        spacing={2}
        align="stretch"
        borderRadius={"md"}
        boxShadow={"sm"}
        h={"100vh"}
        overflowY={"auto"}
      >
        <button
          className={
            isModal ? "absolute top-[100px] right-12" : "absolute top-6 right-6"
          }
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Filter size={32} color="white" />
        </button>
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <HandCoins size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Consulta de Ventas</Heading>
        </Flex>

        <div
          className={` flex-col gap-2 border border-gray-300 rounded-md p-2 bg-blue-200 ${
            mostrarFiltros ? "flex" : "hidden"
          }`}
        >
          <Flex flexDir={isMobile ? "column" : "row"} gap={2}>
            <div>
              <Input
                type="date"
                value={fechaDesde}
                onChange={handleFechaDesdeChange}
                bg={"white"}
              />
            </div>
            <div>
              <Input
                type="date"
                value={fechaHasta}
                onChange={handleFechaHastaChange}
                bg={"white"}
              />
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 items-start "
                  : "flex flex-row gap-2 items-center"
              }
            >
              <p className="font-bold">Sucursal:</p>
              <Select bg={"white"}>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.descripcion}
                  </option>
                ))}
              </Select>
            </div>

            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 items-start "
                  : "flex flex-row gap-2 items-center "
              }
            >
              <input
                type="text"
                placeholder="Buscar por Nro. de factura"
                className={
                  isMobile
                    ? "bg-white p-2 rounded-md w-full"
                    : "bg-white p-2 rounded-md"
                }
                value={factura}
                onChange={(e) => setFactura(e.target.value)}
              />
            </div>
            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 items-start w-full "
                  : "flex flex-row gap-2 items-center "
              }
            >
              <input
                type="text"
                placeholder="Buscar por Nro. de venta"
                className={
                  isMobile
                    ? "bg-white p-2 rounded-md w-full"
                    : "bg-white p-2 rounded-md"
                }
                value={venta}
                onChange={(e) => setVenta(e.target.value)}
              />
            </div>
            <Flex
              flexDir={isMobile ? "column" : "row"}
              alignItems={isMobile ? "start" : "center"}
              justify={"flex-end"}
            >
              <FormLabel overflowWrap="normal">Filtrar por moneda:</FormLabel>
              <Select
                w={isMobile ? "100%" : "200px"}
                value={monedaSeleccionadaFiltro?.mo_codigo?.toString()}
                onChange={(e) => {
                  const selectedMoneda = monedas.find(m => m.mo_codigo.toString() === e.target.value);
                  setMonedaSeleccionadaFiltro(selectedMoneda || null);
                }}
                bg={"white"}
              >
                {monedas.map((moneda) => (
                  <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                    {moneda.mo_descripcion}
                  </option>
                ))}
              </Select>
            </Flex>
            <Flex
              flexDir={isMobile ? "column" : "row"}
              alignItems={isMobile ? "start" : "center"}
              justify={"flex-end"}
            >
              <FormLabel overflowWrap="normal">Filtrar por estado:</FormLabel>
              <Select
                w={isMobile ? "100%" : "200px"}
                value={estadoVenta}
                onChange={(e) => debouncedEstadoChange(e.target.value)}
                bg={"white"}
              >
                <option value="0">Pendiente</option>
                <option value="1">Cobrado</option>
                <option value="2">Anulado</option>
                <option value="3">Todos</option>
              </Select>
            </Flex>
            <div>
              <div className="flex flex-row gap-2 items-center">
                <p>Incluir remisiones</p>
                <Switch
                  onChange={(e) => setIncluirRemisiones(e.target.checked)}
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <p>List. Fact. sin CDC</p>
                <Switch
                  onChange={(e) => setListarFacturasSinCDC(e.target.checked)}
                />
              </div>
            </div>

            <button
              className="bg-blue-500 text-white p-2 rounded-md flex flex-row gap-2 items-center"
              onClick={() => fetchVentas(1, false)}
            >
              Procesar
              <Search />
            </button>
            {isModal && (
              <button
                className="bg-white text-green-600 font-bold border border-green-600 p-2 rounded-md flex flex-row gap-2 items-center"
                onClick={() => fetchVentas(1, false)}
                disabled={!ventaSeleccionadaInterna}
              >
                Editar venta
                <PenBox />
              </button>
            )}
          </Flex>
          <Flex gap={2} flexDir={isMobile ? "column" : "row"}>
            <div className="flex flex-row gap-2 items-center relative flex-1">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar por articulo"
                  className="bg-white p-2 rounded-md w-full pr-8" // Añadimos padding-right
                  value={busquedaArticulo}
                  onChange={handleBuscarArticulo}
                />
                {(articuloSeleccionadoFiltro || busquedaArticulo) && (
                  <button
                    onClick={() => {
                      setBusquedaArticulo("");
                      setArticuloSeleccionadoFiltro(null);
                      setIsVisibleArticulo(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />{" "}
                  </button>
                )}
              </div>
              <FloatingCard
                isVisible={isVisibleArticulo}
                items={articulos}
                onClose={() => setIsVisibleArticulo(false)}
                onSelect={handleSelectArticulo}
                className="absolute top-10 left-0 right-0 z-50"
                renderItem={(item) => (
                  <p>
                    {item.cod_barra} -{item.descripcion}
                  </p>
                )}
              />
            </div>
            <div className="flex flex-row gap-2 items-center relative flex-1">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar por cliente"
                  className="bg-white p-2 rounded-md w-full pr-8" // Añadimos padding-right
                  value={busquedaCliente}
                  onChange={handleBuscarCliente}
                />
                {(clienteSeleccionadoFiltro || busquedaCliente) && (
                  <button
                    onClick={() => {
                      setBusquedaCliente("");
                      setClienteSeleccionadoFiltro(null);
                      setIsVisibleCliente(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />{" "}
                  </button>
                )}
              </div>
              <FloatingCard
                isVisible={isVisibleCliente}
                items={clientes}
                onClose={() => setIsVisibleCliente(false)}
                onSelect={handleSelectCliente}
                className="absolute top-0 left-0 right-0 z-50"
                renderItem={(item) => <p>{item.cli_razon}</p>}
              />
            </div>
            <div className="flex flex-row gap-2 items-center relative flex-1">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar por vendedor"
                  className="bg-white p-2 rounded-md w-full pr-8"
                  value={busquedaVendedor}
                  onChange={handleBuscarVendedor}
                />
                {(vendedorSeleccionadoFiltro || busquedaVendedor) && (
                  <button
                    onClick={() => {
                      setBusquedaVendedor("");
                      setVendedorSeleccionadoFiltro(null);
                      setIsVisibleVendedor(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />{" "}
                    {/* Asegúrate de importar X de lucide-react */}
                  </button>
                )}
              </div>
              <FloatingCard
                isVisible={isVisibleVendedor}
                items={vendedores}
                onClose={() => setIsVisibleVendedor(false)}
                onSelect={handleSelectVendedor}
                className="absolute top-0 left-0 right-0 z-50"
                renderItem={(item) => <p>{item.op_nombre}</p>}
              />
            </div>
          </Flex>
        </div>
        <div
          className={
            isMobile
              ? "flex flex-col gap-2  w-full h-[100%] overflow-x-auto overflow-y-auto "
              : "flex flex-row gap-2  w-full h-full overflow-x-auto overflow-y-auto"
          }
        >
          <div
            className={
              isMobile
                ? "flex flex-col border border-gray-300 rounded-md bg-white w-full min-h-[80%]"
                : "flex flex-col border border-gray-300 rounded-md bg-white w-[80%]"
            }
          >
            <div
              className={
                isMobile ? "w-full h-[80%]" : "w-full h-[calc(100%-50px)]"
              }
            >
              <div
                className={
                  isMobile
                    ? "w-full h-2/3 overflow-x-auto overflow-y-auto mb-8"
                    : "w-full h-[70%] overflow-x-auto overflow-y-auto"
                }
              >
                <table className="min-w-[2100px] max-w-[2800px]">
                  <thead className="bg-gray-200">
                    <tr className="[&>*]:p-2 ">
                      <th className="border border-gray-300">Cod. Venta</th>
                      <th className="border border-gray-300">Cod. Cliente</th>
                      <th className="border border-gray-300">Cliente</th>
                      <th className="border border-gray-300">Fecha/Hora</th>
                      <th className="border border-gray-300">Nro. Factura</th>
                      <th className="border border-gray-300">Total</th>
                      <th className="border border-gray-300">Saldo</th>
                      <th className="border border-gray-300">Descuento</th>
                      <th className="border border-gray-300">Vencimiento</th>
                      <th className="border border-gray-300">Operador</th>
                      <th className="border border-gray-300">Vendedor</th>
                      <th className="border border-gray-300">Cond.</th>
                      <th className="border border-gray-300">Terminal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr
                        key={venta.codigo}
                        className={`border border-gray-300 [&>td]:border [&>td]:border-gray-300 [&>td]:px-2 cursor-pointer hover:bg-gray-100 ${
                          ventaSeleccionada === venta.codigo
                            ? "bg-blue-200 hover:bg-blue-300"
                            : setColor(venta.estado)
                        }`}
                        onClick={() => {
                          setVentaSeleccionada(venta.codigo);
                          handleSelectVenta(venta);
                        }}
                      >
                        <td>{venta.codigo}</td>
                        <td>{venta.codcliente}</td>
                        <td>{venta.cliente}</td>
                        <td className="text-center">{venta.fecha}</td>
                        <td className="text-center">{venta.factura}</td>
                        <td className="text-right">{venta.total}</td>
                        <td className="text-right">{venta.saldo}</td>
                        <td className="text-right">{venta.descuento}</td>
                        <td className="text-center">{venta.vencimiento}</td>
                        <td className="text-left">{venta.operador_nombre}</td>
                        <td className="text-left">{venta.vendedor}</td>
                        <td>{venta.condicion}</td>
                        <td>{venta.terminal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className={
                  isMobile
                    ? "w-full h-[50%] overflow-x-auto overflow-y-auto"
                    : "w-full h-[30%] overflow-x-auto overflow-y-auto"
                }
              >
                <table className="min-w-[2100px] max-w-[2800px]">
                  <thead className="bg-gray-200">
                    <tr className=" [&>th]:border [&>th]:border-gray-300 [&>th]:px-2">
                      <th>Cod. articulo</th>
                      <th>Cod. Barra</th>
                      <th>Descripcion</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Descuento</th>
                      <th>Exentas</th>
                      <th>5%</th>
                      <th>10%</th>
                      <th>Lote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleVenta.map((detalle) => (
                      <tr className=" [&>td]:border [&>td]:border-gray-300 [&>td]:px-2">
                        <td>{detalle.art_codigo}</td>
                        <td>{detalle.codbarra}</td>
                        <td>{detalle.descripcion}</td>
                        <td className="text-center">{detalle.cantidad}</td>
                        <td className="text-right">{detalle.precio}</td>
                        <td className="text-right">{detalle.descuento}</td>
                        <td className="text-right">{detalle.exentas}</td>
                        <td className="text-right">{detalle.cinco}</td>
                        <td className="text-right">{detalle.diez}</td>
                        <td>{detalle.lote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div
            className={
              isMobile
                ? "flex flex-col border border-gray-300 rounded-md bg-white w-full p-2 gap-2"
                : "flex flex-col border border-gray-300 rounded-md bg-white w-[20%] p-2 gap-2"
            }
          >
            <div className=" grid grid-cols-2 gap-2 p-2">
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-white border border-gray-300 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Nota interna</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-pink-200 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Anulados</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-violet-200 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Nota legal</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-lime-200 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Devoluciones</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-cyan-200 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Modificados</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="p-3 bg-gray-200 rounded-md items-center" />
                <p className="text-gray-500 font-bold">Remisiones</p>
              </div>
            </div>
            <div className="p-2">
              <p className="text-gray-500 font-bold">Obs.:</p>
              <textarea
                name=""
                id=""
                className="w-full h-[100px] border border-gray-300 rounded-md p-2"
                placeholder="Sin observaciones"
                value={
                  ventaSeleccionadaInterna?.obs_anulacion === ""
                    ? ventaSeleccionadaInterna?.obs
                    : ventaSeleccionadaInterna?.obs_anulacion
                }
              />
            </div>
            <div className="border border-gray-300 rounded-md bg-white p-2 flex flex-col gap-2">
              <button
                className="bg-blue-400 text-white p-2 rounded-md flex flex-row gap-2 items-center justify-center w-full"
                onClick={() =>
                {
                  if (tipoImpresionFactura === 1) {
                    isMobile ?
                      reImprimirFacturaFiscalReportComponente(
                        ventaSeleccionadaInterna?.codigo || 0,
                        "download"
                      )
                    :
                      reImprimirFacturaFiscalReportComponente(
                      ventaSeleccionadaInterna?.codigo || 0,
                      "print"
                    );
                  } else if (tipoImpresionFactura === 2) {
                    isMobile?
                      reImprimirFacturaFiscalComponente(
                        ventaSeleccionadaInterna?.codigo || 0,
                        "download"
                      )
                    :
                      reImprimirFacturaFiscalComponente(
                        ventaSeleccionadaInterna?.codigo || 0,
                        "print"
                      );
                  } else {
                    toast({
                      title: "Atencion",
                      description:
                        "Su configuracion de impresion de factura no es valida para el sistema web, por favor reimprima desde el sistema de escritorio.",
                      status: "info",
                      duration: 6000,
                      isClosable: true,
                    });
                  }
                }}
              >
                <p className="font-bold">Reimprimir Factura Fiscal</p>
                <Printer />
              </button>
              <button
                className="bg-teal-600 text-white p-2 rounded-md flex flex-row gap-2 items-center justify-center w-full"
                onClick={() =>
                  isMobile ?
                    reImprimirNotaComunComponente(
                      ventaSeleccionadaInterna?.codigo || 0,
                      "download"
                    )
                  :
                    reImprimirNotaComunComponente(
                      ventaSeleccionadaInterna?.codigo || 0,
                      "print"
                    )
                }
              >
                <p className="font-bold">Reimprimir Nota comun</p>
                <Printer />
              </button>
            </div>
            {usaFacturaElectronica === 1 && (
              <>
                <div className="border border-gray-300 rounded-md bg-white p-2">
                  <button
                    className="bg-orange-400 text-white p-2 rounded-md flex flex-row gap-2 items-center justify-center w-full"
                    onClick={() =>
                      handleConfirmarReenvio(
                        ventaSeleccionadaInterna?.ve_cdc || ""
                      )
                    }
                  >
                    <p className="font-bold">Reenviar Factura Electronica</p>
                    <FileInput />
                  </button>
                </div>
                <ConfirmationModal
                  isOpen={confirmarReenvio}
                  onClose={() => setConfirmarReenvio(false)}
                  onConfirm={() =>
                    handleReenviarFacturaElectronica(
                      ventaSeleccionadaInterna?.ve_cdc || ""
                    )
                  }
                  title="Reenviar Factura Electronica"
                  message={`¿Está seguro de querer reenviar la factura electronica? ${mensajeConfirmacionReenvio.current}`}
                  type="simple"
                  icon="warning"
                />
              </>
            )}
            <div className="rounded-md bg-blue-200 w-full h-[calc(100%-100px)] grid grid-cols-2 gap-2 p-2">
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Total Exentas</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.exentas_total || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Descuentos:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.descuento_total || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Total IVA 5%:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.iva5_total || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Subtotal:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.sub_total || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Total IVA 10%:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.iva10_total || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-800 font-bold">Total articulos:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.total_articulos || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <p className="text-gray-800 font-bold">Total Neto:</p>
                <div className="bg-white p-2 rounded-md">
                  <p className=" font-bold text-right">
                    {ventaSeleccionadaInterna?.total || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 w-full">
              <button
                className="bg-blue-500 text-white p-2 rounded-md flex flex-row gap-2 items-center w-full"
                onClick={handleImprimirClick}
              >
                Imprimir
                <Printer />
              </button>
              <button
                className="bg-red-500 text-white p-2 rounded-md flex flex-row gap-2 items-center w-full"
                onClick={() => {
                  handleOpenAdvertenciaModal();
                }}
              >
                Anular venta
                <Trash />
              </button>
            </div>
          </div>
        </div>
      </VStack>
      <Modal
        isOpen={isAdvertenciaModalOpen}
        onClose={handleCLoseAdvertenciaModal}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccione metodo de anulación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormLabel>
              Ingrese el motivo de la anulación de la venta:
            </FormLabel>
            <Textarea
              value={obsAnulacion}
              onChange={(e) => setObsAnulacion(e.target.value)}
              placeholder="Motivo de la anulación"
              variant={"filled"}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                anularVenta(1);
                handleCLoseAdvertenciaModal();
              }}
              isDisabled={
                !!ventaSeleccionada &&
                ventas.find((v) => v.codigo === ventaSeleccionada)?.factura ===
                  ""
              }
            >
              Anular factura completa
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                handleCLoseAdvertenciaModal();
                anularVenta(0);
              }}
            >
              Anular venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UltimaVenta
        isOpen={isImprimirModalOpen}
        onClose={() => setIsImprimirModalOpen(false)}
        venta={ventaSeleccionadaInterna}
        detalleVentas={detalleVenta}
        formatCurrency={formatCurrency}
        clienteInfo={clienteSeleccionadoFiltro}
        sucursalInfo={sucursalSeleccionadaFiltro}
        vendedorInfo={vendedorSeleccionadoFiltro}
        newSaleID={saleID}
      />
    </Box>
  );
}
