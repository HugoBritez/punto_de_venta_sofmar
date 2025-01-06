import {
  Articulo,
  Categoria,
  Ciudad,
  Cliente,
  Configuraciones,
  Deposito,
  Marca,
  Moneda,
  Seccion,
  Subcategoria,
  Sucursal,
  Vendedor,
} from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  EyeIcon,
  EyeOff,
  FileChartColumnIncreasing,
} from "lucide-react";
import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ResumenItem {
  ar_codbarra: string;
  ar_descripcion: string;
  pcosto: string;
  precio: string;
  cantidad: string;
  exentas: string;
  cinco: string;
  diez: string;
  Utilidad_sobre_PrecioCosto_UltimaCompra_Venta: string;
  Utilidad_sobre_PrecioCosto_UltimaCompra_costo: string;
  subtotal: string;
  iva_total: string;
  boni: number;
  Utilidad_sobre_PrecioCosto_AVG_Ventail: string;
  PrecioCostoAVG: string;
  ve_fecha: string;
  ve_hora: string;
  ve_sucursal: number;
  ve_deposito: number;
  ve_cliente: number;
  ve_operador: number;
  deve_articulo: number;
  ar_servicio: number;
  ar_marca: number;
  ar_subcategoria: number;
  cli_ciudad: number;
  deve_talle: string;
  ar_dvl: number;
  ve_moneda: number;
  ve_credito: number;
  ve_estado: number;
  Codigo_Proveedor: string;
  ve_vendedor: number;
  ve_descuento: string;
  ve_total: string;
  ma_descripcion: string;
  ca_descripcion: string;
  desc_Proveedor: string;
  dep_descripcion: string;
  ciu_descripcion: string;
  ve_codigo: number;
  montonc: string;
  deve_descuento: string;
  cli_razon: string;
  op_nombre: string;
  ve_factura: {
    type: string;
    data: number[];
  };
  descripcion: string;
  desc_articulo: string;
  lote: string;
  vence: string;
  r_abre: string;
  r_color: string;
  r_nro: string;
  d_seccion: string;
  al_talle: number;
  sc_descripcion: string;
  deve_codigo: number;
  cantidadParaCosto: string;
}

const InformeVentas = () => {
  const [horaDesde, setHoraHasta] = useState<string>("");
  const [horaHasta, setHoraDesde] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [fechaHasta, setFechaHasta] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(true);

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState<
    number[] | null
  >([]);

  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [depositosSeleccionados, setDepositosSeleccionados] = useState<
    number[] | null
  >([]);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);
  const [clienteSeleccionados, setClienteSeleccionados] = useState<
    number[] | null
  >([]);

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedoresSeleccionados, setVendedoresSeleccionados] = useState<
    number[] | null
  >([]);

  const [vendedoresFiltrados, setVendedoresFiltrados] = useState(vendedores);

  const [tipoArticulo, setTipoArticulo] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[] | null
  >([]);

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<
    number[] | null
  >([]);

  const [marca, setMarca] = useState<Marca[]>([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<
    number[] | null
  >([]);

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesSeleccionadas, setCiudadesSeleccionadas] = useState<
    number[] | null
  >([]);

  const [condiciones, setCondiciones] = useState<number | null>(2);

  const [situaciones, setSituaciones] = useState<number | null>(1);

  const [tipoMovimiento, setTipoMovimiento] = useState<number | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    number[] | null
  >([]);

  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedasSeleccionada, setMonedasSeleccionada] = useState<number | null>(
    1
  );

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<
    number[]
  >([]);

  const [nroVenta, setNroVenta] = useState<string>("");

  const [
    calculoDesdeInicioParaCostoPromedio,
    setCalculoDesdeInicioParaCostoPromedio,
  ] = useState<number>(0);
  const [ncAplicadoAFechaDeVentas, setNcAplicadoAFechaDeVentas] =
    useState<number>(1);
  const [deducirDescuentoSobreVenta, setDeducirDescuentoSobreVenta] =
    useState<number>(1);
  const [soloResumen, setSoloResumen] = useState<number>(0);

  const [ordenAsc, setOrdenAsc] = useState<boolean>(true);
  const [infDesgIVA, setInfDesgIVA] = useState<boolean>(false);
  const [desglosadoXFactura, setDesglosadoXFactura] = useState<boolean>(false);
  const [totalesDeProd, setTotalesDeProd] = useState<boolean>(true);
  const [agruparXPeriodo, setAgruparXPeriodo] = useState<boolean>(false);
  const [totalizarArt, setTotalizarArt] = useState<boolean>(false);
  const [informeBonif, setInformeBonif] = useState<boolean>(false);
  const [mostrarCheckBox, setMostrarCheckBox] = useState<boolean>(false);
  const [resumen, setResumen] = useState<ResumenItem[]>([]);
  const [tipoValorizacion, setTipoValorizacion] = useState<number | null>(2);

  const [ventasNC, setVentasNC] = useState<ResumenItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [cambiarBusqueda, setCambiarBusqueda] = useState<boolean>(false);

  const [configuracionesEmpresa, setConfiguracionesEmpresa] = useState<Configuraciones[]>([]);

  const fechaCompletaActual = new Date()
    .toLocaleString("es-PY", {
      timeZone: "America/Asuncion",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/\//g, "-")
    .replace(",", "")
    .slice(0, 16);

  function toggleMostrarCheckBox() {
    setMostrarCheckBox(!mostrarCheckBox);
  }

  function toggleFiltros() {
    setMostrarFiltros(!mostrarFiltros);
  }

  const {
    onOpen: onClienteModalOpen,
    onClose: onClienteModalClose,
    isOpen: isClienteModalOpen,
  } = useDisclosure();

  const {
    onOpen: onVendedorModalOpen,
    onClose: onVendedorModalClose,
    isOpen: isVendedorModalOpen,
  } = useDisclosure();

  const {
    onOpen: onArticuloModalOpen,
    onClose: onArticuloModalClose,
    isOpen: isArticuloModalOpen,
  } = useDisclosure();

  const {
    onOpen: onSucursalModalOpen,
    onClose: onSucursalModalClose,
    isOpen: isSucursalModalOpen,
  } = useDisclosure();

  const {
    onOpen: onDepositoModalOpen,
    onClose: onDepositoModalClose,
    isOpen: isDepositoModalOpen,
  } = useDisclosure();

  const {
    onOpen: onCategoriaModalOpen,
    onClose: onCategoriaModalClose,
    isOpen: isCategoriaModalOpen,
  } = useDisclosure();

  const {
    onOpen: onSubcategoriaModalOpen,
    onClose: onSubcategoriaModalClose,
    isOpen: isSubcategoriaModalOpen,
  } = useDisclosure();

  const {
    onOpen: onMarcaModalOpen,
    onClose: onMarcaModalClose,
    isOpen: isMarcaModalOpen,
  } = useDisclosure();

  const {
    onOpen: onCiudadModalOpen,
    onClose: onCiudadModalClose,
    isOpen: isCiudadModalOpen,
  } = useDisclosure();

  const {
    onOpen: onSeccionModalOpen,
    onClose: onSeccionModalClose,
    isOpen: isSeccionModalOpen,
  } = useDisclosure();

  const {
    onOpen: onMonedaModalOpen,
    onClose: onMonedaModalClose,
    isOpen: isMonedaModalOpen,
  } = useDisclosure();

  const {
    onOpen: onPdfModalOpen,
    onClose: onPdfModalClose,
    isOpen: isPdfModalOpen,
  } = useDisclosure();

  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursales(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepositos = async () => {
    try {
      const response = await axios.get(`${api_url}depositos/`);
      setDepositos(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${api_url}categorias/`);
      setCategorias(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const response = await axios.get(`${api_url}subcategorias/`);
      setSubcategorias(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${api_url}marcas/`);
      setMarca(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCiudades = async () => {
    try {
      const response = await axios.get(`${api_url}ciudades/`);
      setCiudades(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSecciones = async () => {
    try {
      const response = await axios.get(`${api_url}secciones/`);
      setSecciones(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${api_url}monedas/`);
      setMonedas(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${api_url}clientes/`);
      setClientes(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVendedores = async () => {
    try {
      const response = await axios.get(`${api_url}usuarios/`);
      setVendedores(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConfiguraciones = async () => {
    try{
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguracionesEmpresa(response.data.body);
    } catch (error) {
      console.error(error);
    }
  }

  const buscarArticulos = async (busqueda: string) => {
    if (busqueda.trim() === "" || busqueda.length === 0) {
      setArticulos([]);
      return;
    }
    try {
      const queryParams = new URLSearchParams({
        buscar: busqueda,
        id_deposito: "0",
      });

      const response = await axios.get(
        `${api_url}articulos/directa?${queryParams}`
      );
      if (response.data.body.length > 0) {
        setArticulos(response.data.body);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
    fetchCategorias();
    fetchSubcategorias();
    fetchMarcas();
    fetchCiudades();
    fetchSecciones();
    fetchMonedas();
    fetchClientes();
    fetchVendedores();
    fetchConfiguraciones();
  }, []);


  const nombreEmpresa = configuracionesEmpresa[0]?.valor || "N/A";
  const rucEmpresa = configuracionesEmpresa[30]?.valor || "N/A";

  const filtrarClientesPorNombre = (nombre: string) => {
    if (nombre.trim() === "") {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter((cliente) =>
        cliente.cli_razon.toLowerCase().includes(nombre.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    }
  };

  const filtrarVendedorPorNombre = (nombre: string) => {
    if (nombre.trim() === "") {
      setVendedoresFiltrados(vendedores);
    } else {
      const filtrados = vendedores.filter((vendedor) =>
        vendedor.op_nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      setVendedoresFiltrados(filtrados);
    }
  };

  const toggleVendedorSeleccionado = (vendedorId: number) => {
    setVendedoresSeleccionados((prevSeleccionados) => {
      if (prevSeleccionados === null) {
        return [vendedorId];
      }
      if (prevSeleccionados.includes(vendedorId)) {
        return prevSeleccionados.filter((id) => id !== vendedorId);
      } else {
        return [...prevSeleccionados, vendedorId];
      }
    });
  };

  const toggleClienteSeleccionado = (clienteId: number) => {
    setClienteSeleccionados((prevSeleccionados) => {
      if (prevSeleccionados === null) {
        return [clienteId];
      }
      if (prevSeleccionados.includes(clienteId)) {
        return prevSeleccionados.filter((id) => id !== clienteId);
      } else {
        return [...prevSeleccionados, clienteId];
      }
    });
  };

  const fetchReporteDeVentas = async () => {
    const filtrosResumen = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      hora_desde: horaDesde,
      hora_hasta: horaHasta,
      tipo_valorizacion: tipoValorizacion,
      sucursales: sucursalesSeleccionadas,
      depositos: depositosSeleccionados,
      marcas: marcasSeleccionadas,
      categorias: categoriasSeleccionadas,
      subcategorias: subcategoriasSeleccionadas,
      moneda: monedasSeleccionada,
      ciudades: ciudadesSeleccionadas,
      secciones: seccionesSeleccionadas,
      articulos: articulosSeleccionados,
      clientes: clienteSeleccionados,
      vendedores: vendedoresSeleccionados,
      orden: ordenAsc ? 1 : null,
      infDesgIVA: infDesgIVA ? 1 : null,
      desglosadoXFactura: desglosadoXFactura ? 1 : null,
      totalesDeProd: totalesDeProd ? 1 : null,
      agruparXPeriodo: agruparXPeriodo ? 1 : null,
      totalizarArt: totalizarArt ? 1 : null,
      condiciones: condiciones === 2 ? null : condiciones,
      situaciones: situaciones === 2 ? null : situaciones,
      buscar_codigo: nroVenta,
      agrupar_fecha: agruparXPeriodo ? 1 : null,
      totalizar_grid: totalizarArt ? 1 : null,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${api_url}venta/resumen`,
        filtrosResumen
      );
      setResumen(response.data.body);
      console.log(response.data.body);

      const resumenFiltrado = response.data.body
        .filter((item: ResumenItem) => parseFloat(item.montonc) !== 0)
        .reduce((unique: ResumenItem[], item: ResumenItem) => {
          return unique.some((entry) => entry.ve_codigo === item.ve_codigo)
            ? unique
            : [...unique, item];
        }, []);

      setVentasNC(resumenFiltrado);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarDecimales = (valor: string) => {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) return valor;
    return Math.floor(valorNumerico).toString();
  };

  const formatearNumero = (valor: string) => {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) return valor;
    return Math.floor(valorNumerico).toLocaleString();
  };

  const totalVentas = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const veTotalNumerico = parseFloat(item.subtotal);
        if (!isNaN(veTotalNumerico)) {
          return total + veTotalNumerico;
        }
      }
      return total;
    }, 0);
  };

  const totalNeto = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const subtotalNumerico = parseFloat(item.subtotal);
        if (!isNaN(subtotalNumerico)) {
          return total + subtotalNumerico;
        }
      }
      return total;
    }, 0);
  };

  const totalCostos = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const pcostoNumerico = parseFloat(item.pcosto);
        const cantidadNumerica = parseFloat(item.cantidadParaCosto);
        if (!isNaN(pcostoNumerico) && !isNaN(cantidadNumerica)) {
          return total + pcostoNumerico * cantidadNumerica;
        }
      }
      return total;
    }, 0);
  };

  const utilidadEnMonto = () => {
    return totalNeto() - totalCostos();
  };

  const totalDescuentoFacturas = () => {
    return resumen.reduce((total, item) => {
      const descuentoNumerico = parseFloat(item.ve_descuento);
      if (!isNaN(descuentoNumerico)) {
        return total + descuentoNumerico;
      }
      return total;
    }, 0);
  };

  const totalDescuentoItems = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const descuentoNumerico = parseFloat(item.deve_descuento);
        if (!isNaN(descuentoNumerico)) {
          return total + descuentoNumerico;
        }
      }
      return total;
    }, 0);
  };

  const utilidadPorcentajeBruto = () => {
    return ((totalVentas() - totalCostos()) / totalVentas()) * 100;
  };

  const utilidadPorcentajeNeto = () => {
    return (
      ((totalNetoReal() -
        totalCostos() -
        totalDescuentoFacturas() -
        totalDescuentoItems()) /
        totalNetoReal()) *
      100
    );
  };

  const totalMontoNc = () => {
    return ventasNC.reduce((total, item) => {
      const montoNcNumerico = parseFloat(item.montonc);
      if (!isNaN(montoNcNumerico)) {
        return total + montoNcNumerico;
      }
      return total;
    }, 0);
  };

  const totalNetoReal = () => {
    return totalNeto() - totalMontoNc();
  };
  const totalUnidadesVendidas = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const cantidadNumerica = parseFloat(item.cantidad);
        if (!isNaN(cantidadNumerica)) {
          return total + cantidadNumerica;
        }
      }
      return total;
    }, 0);
  };

  const totalCincos = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const cincoNumerico = parseFloat(item.cinco);
        if (!isNaN(cincoNumerico)) {
          return total + cincoNumerico;
        }
      }
      return total;
    }, 0);
  };

  const totalDiez = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const diezNumerico = parseFloat(item.diez);
        if (!isNaN(diezNumerico)) {
          return total + diezNumerico;
        }
      }
      return total;
    }, 0);
  };

  const totalExentas = () => {
    return resumen.reduce((total, item) => {
      if (item.ve_estado === 1) {
        const exentasNumerico = parseFloat(item.exentas);
        if (!isNaN(exentasNumerico)) {
          return total + exentasNumerico;
        }
      }
      return total;
    }, 0);
  };

  const colorClase = (margenString: string): string => {
    const margen = Number(margenString);
    if (margen < 0) return "bg-red-200";
    if (margen < 20) return "bg-gray-200";
    if (margen <= 70) return "bg-white";
    return "bg-yellow-200";
  };

  const generarPDF = async () => {
    const elemento = document.getElementById("reporte");
    if (!elemento) return;

    // Generar el canvas a partir del elemento
    const canvas = await html2canvas(elemento, {
      scrollX: 0,
      scrollY: 0,
      windowWidth: elemento.scrollWidth,
      windowHeight: elemento.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");

    // Dimensiones del PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Dimensiones del canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    let yOffset = 0; // Posición vertical para empezar a recortar
    const marginTop = 8; // Margen superior para las páginas adicionales
    const marginBottom = 24; // Margen inferior
    let pageNumber = 1; // Número de página inicial

    while (yOffset < canvasHeight) {
      // Crear un canvas temporal para la sección de la página actual
      const pageCanvas = document.createElement("canvas");
      // Ajustar el tamaño de la página con margen inferior
      const pageHeight = Math.min(
        canvasHeight - yOffset,
        (canvasWidth * (pdfHeight - marginTop - marginBottom)) / pdfWidth
      );

      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) {
        console.error("No se pudo obtener el contexto 2D del canvas.");
        return;
      }

      context.drawImage(
        canvas,
        0,
        yOffset,
        canvasWidth,
        pageHeight, // Parte del canvas original
        0,
        0,
        canvasWidth,
        pageHeight // Dibujo en el nuevo canvas
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageHeightScaled = (pageHeight * pdfWidth) / canvasWidth;

      if (yOffset > 0) {
        pdf.addPage();
      }

      // Dibujar líneas y cuadros
      pdf.setDrawColor(145, 158, 181);
      pdf.setLineWidth(0.3);
      pdf.rect(5, marginTop - 5, pdfWidth - 10, 48); // Cuadro principal
      pdf.line(5, marginTop + 2, pdfWidth - 5, marginTop + 2); // Línea debajo de la cabecera
      pdf.line(5, marginTop + 38, pdfWidth - 5, marginTop + 38); // Línea debajo de la información adicional

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.text(`Empresa: ${nombreEmpresa}`, 15, marginTop);
      pdf.text(`RUC: ${rucEmpresa}`, pdfWidth / 2, marginTop);
      pdf.text(`${fechaCompletaActual} - ${localStorage.getItem('user_name')}`, pdfWidth - 40, marginTop);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE DE VENTAS Y UTILIDADES', pdfWidth / 2, marginTop + 8, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.text(`Fecha desde: ${fechaDesde}`, 10, marginTop + 12);
      pdf.text(`Fecha hasta: ${fechaHasta}`, 10, marginTop + 16);
      pdf.text(`Hora: ${horaDesde}-${horaHasta}`, 10, marginTop + 20);
      pdf.text(`Sucursales: ${sucursalesSeleccionadas &&
        sucursalesSeleccionadas.length > 0
        ? sucursalesSeleccionadas.map((suc) => suc).join(", ")
        : "Ninguna en especifico"}`, 10, marginTop + 24);
      pdf.text(`Depositos: ${depositosSeleccionados && depositosSeleccionados.length > 0
        ? depositosSeleccionados.map((dep) => dep).join(", ")
        : "Ninguno en especifico"}`, 10, marginTop + 28);

      pdf.text(`Clientes: ${clienteSeleccionados && clienteSeleccionados.length > 0
        ? clienteSeleccionados.map((cli) => cli).join(", ")
        : "Ninguno en especifico"}`, 10, marginTop + 32);

      pdf.text(`Vendedores: ${vendedoresSeleccionados && vendedoresSeleccionados.length > 0
        ? vendedoresSeleccionados.map((ven) => ven).join(", ")
        : "Ninguno en especifico"}`, 10, marginTop + 36);


      pdf.text(`Situaciones: ${situaciones === 2 ? "Todas" : situaciones === 1 ? "Activos" : "Anulados"}`, (pdfWidth / 2)-15, marginTop + 12);
      pdf.text(`Tipo de movimiento: ${tipoMovimiento === 1
        ? "Solo ventas"
        : "Ventas y devoluciones"}`, (pdfWidth / 2)-15, marginTop + 16);
      pdf.text(`Tipo de articulo: ${tipoArticulo === 1 ? "Servicios" : "Mercaderias"}`, (pdfWidth / 2)-15, marginTop + 20);
      pdf.text(`Categoria: ${categoriasSeleccionadas && categoriasSeleccionadas.length > 0
        ? categoriasSeleccionadas.map((cat) => cat).join(", ")
        : "Ninguna en especifico"}`, (pdfWidth / 2)-15, marginTop + 24);
      pdf.text(`Subcategoria: ${subcategoriasSeleccionadas && subcategoriasSeleccionadas.length > 0
        ? subcategoriasSeleccionadas.map((sub) => sub).join(", ")
        : "Ninguna en especifico"}`, (pdfWidth / 2)-15, marginTop + 28);

      pdf.text(`Marca: ${marcasSeleccionadas && marcasSeleccionadas.length > 0
        ? marcasSeleccionadas.map((mar) => mar).join(", ")
        : "Ninguna en especifico"}`, (pdfWidth / 2)-15, marginTop + 32);


      pdf.text(`Ciudades: ${ciudadesSeleccionadas && ciudadesSeleccionadas.length > 0
        ? ciudadesSeleccionadas.map((ciu) => ciu).join(", ")
        : "Ninguna en especifico"}`, pdfWidth -60, marginTop + 12);
      
      pdf.text(`Seciones: ${seccionesSeleccionadas && seccionesSeleccionadas.length > 0
        ? seccionesSeleccionadas.map((sec) => sec).join(", ")
        : "Ninguna en especifico"}`, pdfWidth -60, marginTop + 16);

      pdf.text(`Tipo de factura: ${condiciones === 2 ? "Todas" : condiciones === 1 ? "Credito" : "Contado"}`, pdfWidth -60, marginTop + 20);
      pdf.text(`Tipo de valorizacion: ${tipoValorizacion === 2 ? "Costo promedio" : tipoValorizacion ===1 ? 'Ultimo costo' : 'Costo real' }`, pdfWidth -60, marginTop + 24);
      pdf.text(`Moneda: ${monedasSeleccionada === 1 ? "Guarani" : "Dolar"}`, pdfWidth -60, marginTop + 28);
      pdf.text(`Articulos: ${articulosSeleccionados && articulosSeleccionados.length > 0
        ? articulosSeleccionados.map((art) => art).join(", ")
        : "Ninguno en especifico"}`, pdfWidth -60, marginTop + 32);

        pdf.setFont("helvetica", "bold");
        pdf.text(
          `Total de registros: ${resumen.length}`,
          pdfWidth - 40,
          marginTop + 42
        );
        pdf.text(`Página: ${pageNumber}`, 10, marginTop + 42);
        pageNumber++;

      // Agregar la imagen de la página
      pdf.addImage(
        pageImgData,
        "PNG",
        0,
        marginTop + 44,
        pdfWidth,
        pageHeightScaled - marginBottom
      );

      yOffset += pageHeight;
    }

    pdf.save(`reporte_ventas_${fechaCompletaActual}.pdf`);
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      h={"100vh"}
      p={2}
    >
      <Box
        bg={"white"}
        p={2}
        borderRadius={8}
        boxShadow={"md"}
        w={"100%"}
        h={"100%"}
      >
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <FileChartColumnIncreasing size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Informe de Ventas</Heading>
          {mostrarFiltros ? (
            <EyeOff size={24} className="ml-auto" onClick={toggleFiltros} />
          ) : (
            <EyeIcon size={24} className="ml-auto" onClick={toggleFiltros} />
          )}
        </Flex>
        {mostrarFiltros && (
          <Box display={"flex"} flexDirection={"column"} gap={2} py={2}>
            <Flex gap={2} flexDir={isMobile ? "column" : "row"}>
              <Box>
                <FormLabel>Fecha:</FormLabel>
                <Flex gap={2}>
                  <Input
                    type={"date"}
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                  <Input
                    type={"date"}
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </Flex>
              </Box>
              <Box>
                <FormLabel>Hora:</FormLabel>
                <Flex gap={2}>
                  <Input
                    type={"time"}
                    value={horaDesde}
                    onChange={(e) => setHoraDesde(e.target.value)}
                  />
                  <Input
                    type={"time"}
                    value={horaHasta}
                    onChange={(e) => setHoraHasta(e.target.value)}
                  />
                </Flex>
              </Box>
              <Box>
                <FormLabel>Sucursales:</FormLabel>
                <Input
                  placeholder="Seleccione una sucursal..."
                  onClick={onSucursalModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Depositos:</FormLabel>
                <Input
                  placeholder="Seleccione un deposito..."
                  onClick={onDepositoModalOpen}
                />
              </Box>
              <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                <FormLabel>Clientes:</FormLabel>
                <Input
                  placeholder={"Buscar cliente..."}
                  type="text"
                  onClick={onClienteModalOpen}
                />
              </Box>
              <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                <FormLabel>Vendedores:</FormLabel>
                <Input
                  placeholder={"Buscar vendedor..."}
                  type="text"
                  onClick={onVendedorModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Situaciones:</FormLabel>
                <Select
                  onChange={(e) => setSituaciones(+e.target.value)}
                  value={situaciones ?? ""}
                >
                  <option value={2}>Todas</option>
                  <option value={1}>Activos</option>
                  <option value={0}>Anulados</option>
                </Select>
              </Box>
              <Box>
                <FormLabel>Tipos de movimiento:</FormLabel>
                <Select
                  onChange={(e) => setTipoMovimiento(+e.target.value)}
                  value={tipoMovimiento ?? ""}
                >
                  <option value={1}>Solo ventas</option>
                </Select>
              </Box>
            </Flex>
            <Flex gap={2} flexDir={isMobile ? "column" : "row"}>
              <Box>
                <FormLabel>Tipo de articulo:</FormLabel>
                <Select
                  onChange={(e) => setTipoArticulo(+e.target.value)}
                  value={tipoArticulo ?? ""}
                >
                  <option value={1}>Mercaderias</option>
                  <option value={2}>Servicios</option>
                </Select>
              </Box>
              <Box>
                <FormLabel>Categoria:</FormLabel>
                <Input
                  placeholder="Seleccione una categoria..."
                  onClick={onCategoriaModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Subcategoria:</FormLabel>
                <Input
                  placeholder="Seleccione una subcategoria"
                  onClick={onSubcategoriaModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Marca:</FormLabel>
                <Input
                  placeholder="Seleccione una marca"
                  onClick={onMarcaModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Ciudades:</FormLabel>
                <Input
                  placeholder="Seleccione una ciudad"
                  onClick={onCiudadModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Tipo de fact.:</FormLabel>
                <Select
                  onChange={(e) => setCondiciones(+e.target.value)}
                  value={condiciones ?? ""}
                >
                  <option value={2}>Todas</option>
                  <option value={0}>Contado</option>
                  <option value={1}>Crédito</option>
                </Select>
              </Box>
              <Box>
                <FormLabel>Secciones:</FormLabel>
                <Input
                  placeholder="Seleccione una seccion"
                  onClick={onSeccionModalOpen}
                />
              </Box>
              <Box>
                <FormLabel>Moneda:</FormLabel>
                <Input
                  placeholder="Seleccione una moneda"
                  onClick={onMonedaModalOpen}
                />
              </Box>
              <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                <FormLabel>Tipo de costeo:</FormLabel>
                <Select
                  onChange={(e) => setTipoValorizacion(+e.target.value)}
                  value={tipoValorizacion ?? ""}
                >
                  <option value={0}>Precio de costo real</option>
                  <option value={2}>Precio de costo promedio</option>
                  <option value={1}>Ultimo costo</option>
                </Select>
              </Box>
            </Flex>

            <Flex
              gap={2}
              border={"1px solid #ccc"}
              p={2}
              borderRadius={8}
              flexDir={isMobile ? "column" : "column"}
            >
              <Flex
                gap={2}
                direction={isMobile ? "column" : "row"}
                flexGrow={1}
              >
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  w={isMobile ? "100%" : "30%"}
                >
                  <FormLabel>Articulos:</FormLabel>
                  <Input
                    placeholder={"Buscar articulo..."}
                    type="text"
                    onClick={onArticuloModalOpen}
                  />
                </Box>
                <Flex gap={4} flexDir={isMobile ? "column" : "row"}>
                  <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                    <FormLabel>Buscar Nro. Venta:</FormLabel>
                    <Flex gap={2} flexDir={isMobile ? "column" : "row"}>
                      <Input
                        placeholder={"Buscar Venta..."}
                        type="text"
                        value={nroVenta}
                        onChange={(e) => setNroVenta(e.target.value)}
                      />
                      <Button
                        colorScheme={"blue"}
                        p={2}
                        w={isMobile ? "full" : "200px"}
                        onClick={() => setCambiarBusqueda(!cambiarBusqueda)}
                      >
                        {cambiarBusqueda ? "Nro. de factura" : "Nro. de venta"}
                      </Button>
                    </Flex>
                  </Box>
                  <Box
                    display={isMobile ? "grid" : "flex"}
                    flexGrow={isMobile ? 1 : 0}
                    gridTemplateColumns={"1fr 1fr"}
                    gap={2}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Checkbox
                      isChecked={calculoDesdeInicioParaCostoPromedio === 1}
                      onChange={() =>
                        setCalculoDesdeInicioParaCostoPromedio(
                          calculoDesdeInicioParaCostoPromedio === 1 ? 0 : 1
                        )
                      }
                    >
                      <Text fontSize={isMobile ? "xs" : "lg"}>
                        Apl. Calculo desde inicio p/C.P
                      </Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={ncAplicadoAFechaDeVentas === 1}
                      onChange={() =>
                        setNcAplicadoAFechaDeVentas(
                          ncAplicadoAFechaDeVentas === 1 ? 0 : 1
                        )
                      }
                    >
                      <Text fontSize={isMobile ? "xs" : "lg"}>
                        NC Aplicado a la fecha de Ventas
                      </Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={deducirDescuentoSobreVenta === 1}
                      onChange={() =>
                        setDeducirDescuentoSobreVenta(
                          deducirDescuentoSobreVenta === 1 ? 0 : 1
                        )
                      }
                    >
                      <Text fontSize={isMobile ? "xs" : "lg"}>
                        Deducir desc. S/Venta
                      </Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={soloResumen === 1}
                      onChange={() => setSoloResumen(soloResumen === 1 ? 0 : 1)}
                    >
                      <Text fontSize={isMobile ? "xs" : "lg"}>
                        Solo Resumen
                      </Text>
                    </Checkbox>
                  </Box>
                </Flex>
              </Flex>
              {isMobile ? (
                <Box>
                  <Button
                    bg={"white"}
                    color={"black"}
                    onClick={toggleMostrarCheckBox}
                  >
                    {mostrarCheckBox ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  {mostrarCheckBox && (
                    <Box
                      display={isMobile ? "grid" : "flex"}
                      gridTemplateColumns={
                        isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)"
                      }
                      gap={4}
                      bg={"green.600"}
                      w={"100%"}
                      borderRadius={"md"}
                      p={2}
                      justifyContent={"space-around"}
                    >
                      <Checkbox
                        isChecked={ordenAsc}
                        onChange={() => setOrdenAsc(!ordenAsc)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Orden Asc.
                      </Checkbox>
                      <Checkbox
                        isChecked={infDesgIVA}
                        onChange={() => setInfDesgIVA(!infDesgIVA)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Inf. Desg./IVA
                      </Checkbox>
                      <Checkbox
                        isChecked={desglosadoXFactura}
                        onChange={() =>
                          setDesglosadoXFactura(!desglosadoXFactura)
                        }
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Desglosado x Factura
                      </Checkbox>
                      <Checkbox
                        isChecked={totalesDeProd}
                        onChange={() => setTotalesDeProd(!totalesDeProd)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Totales de Prod.
                      </Checkbox>
                      <Checkbox
                        isChecked={agruparXPeriodo}
                        onChange={() => setAgruparXPeriodo(!agruparXPeriodo)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Agrupar x periodo
                      </Checkbox>
                      <Checkbox
                        isChecked={totalizarArt}
                        onChange={() => setTotalizarArt(!totalizarArt)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Totalizar Art.
                      </Checkbox>
                      <Checkbox
                        isChecked={informeBonif}
                        onChange={() => setInformeBonif(!informeBonif)}
                        color={"white"}
                        fontWeight={"bold"}
                      >
                        Informe Bonif.
                      </Checkbox>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  display={isMobile ? "grid" : "flex"}
                  gridTemplateColumns={
                    isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)"
                  }
                  gap={4}
                  bg={"green.600"}
                  w={"100%"}
                  borderRadius={"md"}
                  p={2}
                  justifyContent={"space-around"}
                >
                  <Checkbox
                    isChecked={ordenAsc}
                    onChange={() => setOrdenAsc(!ordenAsc)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Orden Asc.
                  </Checkbox>
                  <Checkbox
                    isChecked={infDesgIVA}
                    onChange={() => setInfDesgIVA(!infDesgIVA)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Inf. Desg./IVA
                  </Checkbox>
                  <Checkbox
                    isChecked={desglosadoXFactura}
                    onChange={() => setDesglosadoXFactura(!desglosadoXFactura)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Desglosado x Factura
                  </Checkbox>
                  <Checkbox
                    isChecked={totalesDeProd}
                    onChange={() => setTotalesDeProd(!totalesDeProd)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Totales de Prod.
                  </Checkbox>
                  <Checkbox
                    isChecked={agruparXPeriodo}
                    onChange={() => setAgruparXPeriodo(!agruparXPeriodo)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Agrupar x periodo
                  </Checkbox>
                  <Checkbox
                    isChecked={totalizarArt}
                    onChange={() => setTotalizarArt(!totalizarArt)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Totalizar Art.
                  </Checkbox>
                  <Checkbox
                    isChecked={informeBonif}
                    onChange={() => setInformeBonif(!informeBonif)}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Informe Bonif.
                  </Checkbox>
                </Box>
              )}
            </Flex>
          </Box>
        )}
        <Flex
          border={"1px solid #ccc"}
          px={2}
          mt={2}
          borderRadius={8}
          overflowY={"auto"}
          flexDir={"column"}
          flex={1}
          overflowX={"auto"}
          h={isMobile ? "80%" : mostrarFiltros ? "40%" : "70%"}
        >
          {loading ? (
            <Flex justifyContent="center" alignItems="center" height="200px">
              <Spinner size="xl" />
            </Flex>
          ) : (
            <table
              className={`${isMobile ? "w-[1920px]" : "w-full"
                } table-auto border-collapse border border-gray-300`}
            >
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 p-2 w-1/12">
                    F. Venta
                  </th>
                  <th className="border border-gray-300 p-2 w-[200px]">
                    Cod. Barra
                  </th>
                  <th className="border border-gray-300 p-2 w-auto">
                    Descripcion
                  </th>
                  <th className="border border-gray-300 p-1">P. Costo</th>
                  <th className="border border-gray-300 p-1">P. de Venta</th>
                  <th className="border border-gray-300 p-1">Unid. Vendida</th>
                  <th className="border border-gray-300 p-1">Exentas</th>
                  <th className="border border-gray-300 p-1">IVA 5%</th>
                  <th className="border border-gray-300 p-1">IVA 10%</th>
                  <th className="border border-gray-300 p-1">
                    % Util. s/Venta
                  </th>
                  <th className="border border-gray-300 p-1">Sub-Total</th>
                  <th className="border border-gray-300 p-1">V/B</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((item, index) => (
                  <tr
                    key={index}
                    className={colorClase(
                      item.Utilidad_sobre_PrecioCosto_UltimaCompra_Venta
                    )}
                  >
                    <td className="border border-gray-300 p-0 text-md font-medium text-gray-700">
                      {item.ve_fecha}
                    </td>
                    <td className="border border-gray-300 p-0 text-md text-gray-700">
                      {item.ar_codbarra}
                    </td>
                    <td className="border border-gray-300 p-0 text-md text-gray-700">
                      {item.ar_descripcion}
                    </td>
                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.pcosto)}
                    </td>
                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.precio)}
                    </td>
                    <td className="border border-gray-300 p-0 text-center text-md text-gray-700">
                      {eliminarDecimales(item.cantidad)}
                    </td>

                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.exentas)}
                    </td>
                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.cinco)}
                    </td>
                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.diez)}
                    </td>
                    <td className="border border-gray-300 p-0 text-center text-md text-gray-700">
                      {eliminarDecimales(
                        item.Utilidad_sobre_PrecioCosto_UltimaCompra_Venta
                      )}
                    </td>
                    <td className="border border-gray-300 p-0 text-right text-md text-gray-700">
                      {formatearNumero(item.subtotal)}
                    </td>
                    <td className="border border-gray-300 p-0 text-center text-md text-gray-700">
                      {item.boni === 1 ? "B" : "V"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-200 sticky bottom-0 z-10">
                <tr>
                  <td colSpan={5} className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2 font-bold">
                    Total: {formatearNumero(totalUnidadesVendidas().toString())}
                  </td>
                  <td className="border font-bold border-gray-300 p-2">
                    Total: {formatearNumero(totalExentas().toString())}
                  </td>
                  <td className="border font-bold border-gray-300 p-2">
                    Total: {formatearNumero(totalCincos().toString())}
                  </td>
                  <td className="border font-bold border-gray-300 p-2">
                    Total: {formatearNumero(totalDiez().toString())}
                  </td>
                  <td className="border font-bold border-gray-300 p-2"></td>
                  <td className="border font-bold border-gray-300 p-2">
                    Total: {formatearNumero(totalVentas().toString())}
                  </td>
                  <td className="border font-bold border-gray-300 p-2"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </Flex>

        <Flex
          border={"1px solid #ccc"}
          p={2}
          borderRadius={8}
          mt={2}
          flexDir={isMobile ? "column" : "row"}
        >
          <Box
            bg={"green.600"}
            px={4}
            py={2}
            borderRadius={4}
            w={isMobile ? "100%" : "80%"}
            color={"white"}
            display={isMobile ? "flex" : "grid"}
            flexDir={"column"}
            gridTemplateColumns={"repeat(5, 1fr)"}
            gap={2}
            h={isMobile ? "auto" : 40}
          >
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Neto Venta:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {deducirDescuentoSobreVenta === 1
                    ? formatearNumero(totalNetoReal().toString())
                    : formatearNumero(totalNeto().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Costos Directo:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {formatearNumero(totalCostos().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc. Factura:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {formatearNumero(totalDescuentoFacturas().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Margen en % S/V Bruta:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {utilidadPorcentajeNeto().toFixed(2)} %
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Neto NC. Desc./Conc.:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {formatearNumero(totalMontoNc().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Util. en Monto:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {formatearNumero(utilidadEnMonto().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc. Items:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {formatearNumero(totalDescuentoItems().toString())}
                </Text>
              </Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Margen en % S/V. Bruto:
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  {utilidadPorcentajeBruto().toFixed(2)} %
                </Text>
              </Box>
            </Flex>
            <Flex gap={2} alignItems={"center"} justifyContent={"flex-end"}>
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc.
              </Text>
              <Box bg={"white"} p={2} borderRadius={4} minW={"50%"}>
                <Text
                  fontSize={isMobile ? "sm" : "lg"}
                  color={"black"}
                  textAlign={"right"}
                >
                  0
                </Text>
              </Box>
            </Flex>
          </Box>
          <Box
            px={2}
            borderRadius={4}
            w={isMobile ? "100%" : "20%"}
            color={"white"}
          >
            <Box display={"flex"} flexDirection={"column"} gap={1}>
              <Text fontWeight={"bold"} fontSize={"sm"} color={"black"}>
                Obs:
              </Text>
              <Flex gap={4}>
                <Box p={3} borderRadius={"md"} bg={"gray.200"}></Box>
                <Text fontSize={"sm"} color={"black"}>
                  Indica utilidad S/V menor al 20%
                </Text>
              </Flex>
              <Flex gap={4}>
                <Box p={3} borderRadius={"md"} bg={"yellow.200"}></Box>
                <Text fontSize={"sm"} color={"black"}>
                  Indica utilidad S/V mayor al 70%
                </Text>
              </Flex>
              <Flex gap={4}>
                <Box p={3} borderRadius={"sm"} bg={"red.200"}></Box>
                <Text fontSize={"sm"} color={"black"}>
                  Indica utilidad S/V en pérdida
                </Text>
              </Flex>
              <Flex gap={4}>
                <Box p={3} borderRadius={"sm"} bg={"blue.200"}></Box>
                <Text fontSize={"sm"} color={"black"}>
                  Opción utilidad S/V positivo
                </Text>
              </Flex>
            </Box>
            <Flex gap={2} mt={2}>
              <Button colorScheme={"blue"} w={"50%"} onClick={onPdfModalOpen}>
                Generar PDF
              </Button>
              <Button
                colorScheme={"green"}
                w={"50%"}
                onClick={fetchReporteDeVentas}
              >
                Procesar
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Modal
        isOpen={isClienteModalOpen}
        onClose={onClienteModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Clientes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar cliente..."}
                type="text"
                onChange={(e) => filtrarClientesPorNombre(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {clientesFiltrados.map((cliente) => (
                <Box
                  key={cliente.cli_codigo}
                  p={2}
                  bg={
                    clienteSeleccionados?.includes(cliente.cli_codigo)
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() => toggleClienteSeleccionado(cliente.cli_codigo)}
                >
                  {cliente.cli_razon}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setClienteSeleccionados(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onClienteModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isVendedorModalOpen}
        onClose={onVendedorModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Vendedores</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar cliente..."}
                type="text"
                onChange={(e) => filtrarVendedorPorNombre(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {vendedoresFiltrados.map((vendedor) => (
                <Box
                  key={vendedor.id}
                  p={2}
                  bg={
                    vendedoresSeleccionados?.includes(
                      Number(vendedor.op_codigo)
                    )
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    toggleVendedorSeleccionado(Number(vendedor.op_codigo))
                  }
                >
                  {vendedor.op_nombre}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setVendedoresSeleccionados(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onVendedorModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isArticuloModalOpen}
        onClose={onArticuloModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Articulos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar articulo..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {articulos.map((articulo) => (
                <Box
                  key={articulo.al_codigo}
                  p={2}
                  bg={
                    articulosSeleccionados.includes(articulo.ar_codigo)
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setArticulosSeleccionados((prevSeleccionados) => {
                      if (prevSeleccionados.includes(articulo.al_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== articulo.ar_codigo
                        );
                      } else {
                        return [...prevSeleccionados, articulo.ar_codigo];
                      }
                    })
                  }
                >
                  {articulo.ar_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
        <ModalFooter display={"flex"} gap={4}>
          <Button
            colorScheme={"red"}
            onClick={() => setArticulosSeleccionados([])}
          >
            Cancelar
          </Button>
          <Button colorScheme={"green"} onClick={onArticuloModalClose}>
            Aceptar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={isSucursalModalOpen}
        onClose={onSucursalModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Sucursales</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar articulo..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {sucursales.map((sucursal) => (
                <Box
                  key={sucursal.id}
                  p={2}
                  bg={
                    sucursalesSeleccionadas?.includes(sucursal.id) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setSucursalesSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [sucursal.id];
                      }
                      if (prevSeleccionados.includes(sucursal.id)) {
                        return prevSeleccionados.filter(
                          (id) => id !== sucursal.id
                        );
                      } else {
                        return [...prevSeleccionados, sucursal.id];
                      }
                    })
                  }
                >
                  {sucursal.descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setSucursalesSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onSucursalModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDepositoModalOpen}
        onClose={onDepositoModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Depositos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar deposito..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {depositos.map((deposito) => (
                <Box
                  key={deposito.dep_codigo}
                  p={2}
                  bg={
                    depositosSeleccionados?.includes(deposito.dep_codigo) ??
                      false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setDepositosSeleccionados((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [deposito.dep_codigo];
                      }
                      if (prevSeleccionados.includes(deposito.dep_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== deposito.dep_codigo
                        );
                      } else {
                        return [...prevSeleccionados, deposito.dep_codigo];
                      }
                    })
                  }
                >
                  {deposito.dep_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setDepositosSeleccionados(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onDepositoModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isCategoriaModalOpen}
        onClose={onCategoriaModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Categorias</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar categoria..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {categorias.map((categoria) => (
                <Box
                  key={categoria.ca_codigo}
                  p={2}
                  bg={
                    categoriasSeleccionadas?.includes(categoria.ca_codigo) ??
                      false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setCategoriasSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [categoria.ca_codigo];
                      }
                      if (prevSeleccionados.includes(categoria.ca_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== categoria.ca_codigo
                        );
                      } else {
                        return [...prevSeleccionados, categoria.ca_codigo];
                      }
                    })
                  }
                >
                  {categoria.ca_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setCategoriasSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onCategoriaModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isSubcategoriaModalOpen}
        onClose={onSubcategoriaModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Subcategorias</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar subcategoria..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {subcategorias.map((subcategoria) => (
                <Box
                  key={subcategoria.sc_codigo}
                  p={2}
                  bg={
                    subcategoriasSeleccionadas?.includes(
                      subcategoria.sc_codigo
                    ) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setSubcategoriasSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [subcategoria.sc_codigo];
                      }
                      if (prevSeleccionados.includes(subcategoria.sc_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== subcategoria.sc_codigo
                        );
                      } else {
                        return [...prevSeleccionados, subcategoria.sc_codigo];
                      }
                    })
                  }
                >
                  {subcategoria.sc_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setSubcategoriasSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onSubcategoriaModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isMarcaModalOpen} onClose={onMarcaModalClose} size={"xl"}>
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Marcas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar marca..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {marca.map((marca) => (
                <Box
                  key={marca.ma_codigo}
                  p={2}
                  bg={
                    marcasSeleccionadas?.includes(marca.ma_codigo) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setMarcasSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [marca.ma_codigo];
                      }
                      if (prevSeleccionados.includes(marca.ma_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== marca.ma_codigo
                        );
                      } else {
                        return [...prevSeleccionados, marca.ma_codigo];
                      }
                    })
                  }
                >
                  {marca.ma_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setMarcasSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onMarcaModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isCiudadModalOpen}
        onClose={onCiudadModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Ciudades</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar ciudad..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {ciudades.map((ciudad) => (
                <Box
                  key={ciudad.ciu_codigo}
                  p={2}
                  bg={
                    ciudadesSeleccionadas?.includes(ciudad.ciu_codigo) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setCiudadesSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [ciudad.ciu_codigo];
                      }
                      if (prevSeleccionados.includes(ciudad.ciu_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== ciudad.ciu_codigo
                        );
                      } else {
                        return [...prevSeleccionados, ciudad.ciu_codigo];
                      }
                    })
                  }
                >
                  {ciudad.ciu_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setCiudadesSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onCiudadModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isSeccionModalOpen}
        onClose={onSeccionModalClose}
        size={"xl"}
      >
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>Buscar Secciones</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDirection={"column"} gap={2}>
              <Input
                placeholder={"Buscar seccion..."}
                type="text"
                onChange={(e) => buscarArticulos(e.target.value)}
              />
            </Box>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {secciones.map((seccion) => (
                <Box
                  key={seccion.s_codigo}
                  p={2}
                  bg={
                    seccionesSeleccionadas?.includes(seccion.s_codigo) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setSeccionesSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [seccion.s_codigo];
                      }
                      if (prevSeleccionados.includes(seccion.s_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== seccion.s_codigo
                        );
                      } else {
                        return [...prevSeleccionados, seccion.s_codigo];
                      }
                    })
                  }
                >
                  {seccion.s_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setSeccionesSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onSeccionModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isMonedaModalOpen}
        onClose={onMonedaModalClose}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccionar Monedas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              overflow={"auto"}
              h={"400px"}
              flexDir={"column"}
              gap={2}
              py={4}
            >
              {monedas.map((moneda) => (
                <Box
                  key={moneda.mo_codigo}
                  p={2}
                  bg={
                    monedasSeleccionada === moneda.mo_codigo
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() => setMonedasSeleccionada(moneda.mo_codigo)}
                >
                  {moneda.mo_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setMonedasSeleccionada(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onMonedaModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isPdfModalOpen} onClose={onPdfModalClose} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vista Previa informe de ventas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col gap-4 px-8 h-full mt-2 w-[full] mx-auto border border-gray-300 overflow-y-auto">
              <div className="flex flex-col w-full border border-gray-300 p-2">
                <div className="flex justify-between w-full">
                  <p className="text-md font-bold">RUC: 80026596-3</p>
                  <p className="text-md font-bold">Gaesa SA</p>
                  <div>
                    <p className="text-md font-bold">{fechaCompletaActual}</p>
                    <p className="text-md font-bold">
                      {localStorage.getItem("user_name")}
                    </p>
                  </div>
                </div>
                <Divider />
                <div className="py-2">
                  <h1 className="font-bold text-xl text-center">
                    Resumen de ventas y utilidades
                  </h1>
                  <div className="flex flex-row w-full justify-between my-2">
                    <div>
                      <p className="text-lg "><strong>Desde:</strong> {fechaDesde}</p>
                      <p className="text-lg "><strong>Hasta:</strong> {fechaHasta}</p>
                      <p className="text-lg">
                        <strong>Hora:</strong>{" "}
                        {horaDesde && horaHasta
                          ? `${horaDesde} - ${horaHasta}`
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg ">
                        <strong>Sucursales:</strong>{" "}
                        {sucursalesSeleccionadas &&
                          sucursalesSeleccionadas.length > 0
                          ? sucursalesSeleccionadas.map((suc) => suc).join(", ")
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Depositos:</strong>{" "}
                        {depositosSeleccionados &&
                          depositosSeleccionados.length > 0
                          ? depositosSeleccionados?.map((dep) => dep).join(", ")
                          : "Ninguna en especifico"}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <strong>Clientes:</strong>{" "}
                        {clienteSeleccionados && clienteSeleccionados.length > 0
                          ? clienteSeleccionados?.map((cli) => cli).join(", ")
                          : "Ninguno en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Vendedores:</strong>{" "}
                        {vendedoresSeleccionados &&
                          vendedoresSeleccionados.length > 0
                          ? vendedoresSeleccionados
                            ?.map((vend) => vend)
                            .join(", ")
                          : "Ninguno en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Situaciones:</strong>{" "}
                        {situaciones === 2
                          ? "Todas"
                          : situaciones === 1
                            ? "Activos"
                            : "Anuladas"}
                      </p>
                      <p className="text-lg ">
                        <strong>Tipo de movimiento:</strong>{" "}
                        {tipoMovimiento === 1
                          ? "Solo ventas"
                          : "Ventas y devoluciones"}
                      </p>
                      <p className="text-lg">
                        <strong>Tipo de articulo:</strong>{" "}
                        {tipoArticulo === 1 ? "Servicios" : "Mercaderias"}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <strong>Categorias:</strong>{" "}
                        {categoriasSeleccionadas &&
                          categoriasSeleccionadas.length > 0
                          ? categoriasSeleccionadas
                            ?.map((cat) => cat)
                            .join(", ")
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Subcategorias:</strong>{" "}
                        {subcategoriasSeleccionadas &&
                          subcategoriasSeleccionadas.length > 0
                          ? subcategoriasSeleccionadas
                            ?.map((sub) => sub)
                            .join(", ")
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Marcas:</strong>{" "}
                        {marcasSeleccionadas && marcasSeleccionadas.length > 0
                          ? marcasSeleccionadas?.map((mar) => mar).join(", ")
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Ciudades:</strong>{" "}
                        {ciudadesSeleccionadas &&
                          ciudadesSeleccionadas.length > 0
                          ? ciudadesSeleccionadas?.map((ciu) => ciu).join(", ")
                          : "Ninguna en especifico"}
                      </p>
                      <p className="text-lg">
                        <strong>Secciones:</strong>{" "}
                        {seccionesSeleccionadas &&
                          seccionesSeleccionadas.length > 0
                          ? seccionesSeleccionadas?.map((sec) => sec).join(", ")
                          : "Ninguna en especifico"}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg">
                        <strong>Tipo de fact.:</strong>{" "}
                        {condiciones === 2
                          ? "Todas"
                          : condiciones === 1
                            ? "Credito"
                            : "Contado"}
                      </p>
                      <p className="text-lg">
                        <strong>Moneda:</strong>{" "}
                        {monedasSeleccionada === 1 ? "Guaranies" : "Dolares"}
                      </p>
                      <p className="text-lg">
                        <strong>Tipo de costeo:</strong>{" "}
                        {tipoValorizacion === 2
                          ? "Costo promedio"
                          : tipoValorizacion === 1
                            ? "Ultimo costo"
                            : "Costo real"}
                      </p>
                      <p className="text-lg">
                        <strong>Articulos:</strong>{" "}
                        {articulosSeleccionados &&
                          articulosSeleccionados.length > 0
                          ? articulosSeleccionados?.map((art) => art).join(", ")
                          : "Ninguno en especifico"}
                      </p>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex flex-row justify-between py-2">
                    <p className="text-lg font-bold">Pagina 1</p>
                    <p className="text-lg font-bold">
                      Total de registros: {resumen.length}
                    </p>
                  </div>
                </div>
              </div>
              <div id="reporte" className="w-full px-10">
              <div >
                <table
                  className={`${isMobile ? "w-[1920px]" : "w-full"
                    } table-auto border-collapse border border-gray-300`}
                >
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="border border-gray-300 p-2 w-1/12">
                        F. Venta
                      </th>
                      <th className="border border-gray-300 p-2 w-[200px]">
                        Cod. Barra
                      </th>
                      <th className="border border-gray-300 p-2 w-auto">
                        Descripcion
                      </th>
                      <th className="border border-gray-300 p-1">P. Costo</th>
                      <th className="border border-gray-300 p-1">
                        P. de Venta
                      </th>
                      <th className="border border-gray-300 p-1">
                        Unid. Vendida
                      </th>
                      <th className="border border-gray-300 p-1">Exentas</th>
                      <th className="border border-gray-300 p-1">IVA 5%</th>
                      <th className="border border-gray-300 p-1">IVA 10%</th>
                      <th className="border border-gray-300 p-1">
                        % Util. s/Venta
                      </th>
                      <th className="border border-gray-300 p-1">Sub-Total</th>
                      <th className="border border-gray-300 p-1">V/B</th>
                    </tr>
                  </thead>
                  <tbody >
                    {resumen.map((item, index) => (
                      <tr
                        key={index}
                      >
                        <td className="border border-gray-300 p-0 text-lg font-medium text-gray-700">
                          {item.ve_fecha}
                        </td>
                        <td className="border border-gray-300 p-0 text-lg text-gray-700">
                          {item.ar_codbarra}
                        </td>
                        <td className="border border-gray-300 p-0 text-lg text-gray-700">
                          {item.ar_descripcion}
                        </td>
                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.pcosto)}
                        </td>
                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.precio)}
                        </td>
                        <td className="border border-gray-300 p-0 text-center text-lg text-gray-700">
                          {eliminarDecimales(item.cantidad)}
                        </td>

                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.exentas)}
                        </td>
                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.cinco)}
                        </td>
                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.diez)}
                        </td>
                        <td className="border border-gray-300 p-0 text-center text-lg text-gray-700">
                          {eliminarDecimales(
                            item.Utilidad_sobre_PrecioCosto_UltimaCompra_Venta
                          )}
                        </td>
                        <td className="border border-gray-300 p-0 text-right text-lg text-gray-700">
                          {formatearNumero(item.subtotal)}
                        </td>
                        <td className="border border-gray-300 p-0 text-center text-lg text-gray-700">
                          {item.boni === 1 ? "B" : "V"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-200 sticky bottom-0 z-10">
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 p-2"
                      ></td>
                      <td className="border border-gray-300 p-2 font-bold">
                        Total:{" "}
                        {formatearNumero(totalUnidadesVendidas().toString())}
                      </td>
                      <td className="border font-bold border-gray-300 p-2">
                        Total: {formatearNumero(totalExentas().toString())}
                      </td>
                      <td className="border font-bold border-gray-300 p-2">
                        Total: {formatearNumero(totalCincos().toString())}
                      </td>
                      <td className="border font-bold border-gray-300 p-2">
                        Total: {formatearNumero(totalDiez().toString())}
                      </td>
                      <td className="border font-bold border-gray-300 p-2"></td>
                      <td className="border font-bold border-gray-300 p-2">
                        Total: {formatearNumero(totalVentas().toString())}
                      </td>
                      <td className="border font-bold border-gray-300 p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="border border-gray-300 p-2">
                <h1 className="font-bold text-xl">Resumen:</h1>
                <div className="w-1/3 gap-4">
                  <p className="text-lg"><strong>Total ventas sin desc.:</strong> {formatearNumero(totalVentas().toString())}</p>
                  <div className="flex flex-row  justify-between mt-2">
                    <p className="text-lg"><strong>Total NC. Desc.:</strong> {formatearNumero(totalMontoNc().toString())}</p>
                    <p className="text-lg"><strong>Neto venta:</strong> {formatearNumero(totalNetoReal().toString())}</p>
                  </div>
                  <div className="flex flex-row  justify-between mt-2 mb-4">
                    <p className="text-lg"><strong>Total Desc.:</strong> {formatearNumero((totalDescuentoItems() + totalDescuentoFacturas()).toString())}</p>
                    <p className="text-lg"><strong>Costos directos:</strong> {formatearNumero(totalCostos().toString())}</p>
                  </div>
                  <div className="border border-black my-2"></div>
                  <div className="flex flex-row justify-between">
                    <p className="text-lg"><strong>Neto venta:</strong> {formatearNumero(totalNetoReal().toString())}</p>
                    <p className="text-lg"><strong>Utilidad en monto:</strong> {formatearNumero(utilidadEnMonto().toString())}</p>
                  </div>
                  <div className="flex flex-row  justify-between mt-2">
                    <p className="text-lg"><strong>Utilidad Bruta:</strong> {eliminarDecimales(utilidadPorcentajeBruto().toString())}%</p>
                    <p className="text-lg"><strong>Utilidad Neta: </strong> {eliminarDecimales(utilidadPorcentajeNeto().toString())}%</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button colorScheme={"red"} onClick={onPdfModalClose}>
              Cerrar
            </Button>
            <Button colorScheme={"green"} onClick={generarPDF}>Descargar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InformeVentas;
