import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  Input,
  useToast,
  InputGroup,
  InputLeftElement,
  Flex,
  useMediaQuery,
  Select,
  Divider,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormLabel,
  Checkbox,
  Textarea,
  CheckboxGroup,
  Stack,
  InputLeftAddon,
  Table,
  Tr,
  Th,
  Td,
  Tbody,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { HandCoins, Trash } from "lucide-react";
import { useAuth } from "@/shared/services/AuthContext";
import {
  Banco,
  CuentasBancarias,
  Factura,
  MetodosPago,
  Monedas,
  OperacionData,
  Sucursal,
  Tarjetas,
} from "@/shared/types/shared_interfaces";

interface Venta {
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
  ruc: string;
  direccion: string;
}

interface Caja {
  cd_codigo: number;
  cd_descripcion: string;
}

export default function CobrosDiarios() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [facturaFiltro, setFacturaFiltro] = useState("");
  const [facturaData, setFacturaData] = useState<Factura[]>([]);

  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(
    null
  );

  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const { auth } = useAuth();
  const [sucursal, setSucursal] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string | number>("");
  const [, setFiltroMetodo] = useState(1);

  const [montoRecibidoEfectivo, setMontoRecibidoEfectivo] = useState(0);
  const [montoRecibidoTarjeta, setMontoRecibidoTarjeta] = useState(0);
  const [montoRecibidoTransferencia, setMontoRecibidoTransferencia] =
    useState(0);

  const [numeroFactura, setNumeroFactura] = useState("");
  const [, setNumeroTimbrado] = useState("");
  const [numeroEstablecimiento, setNumeroEstablecimiento] = useState("");
  const [numeroEmision, setNumeroEmision] = useState("");
  const operadorActual = auth?.userId || "";
  const [tipoRecibo, setTipoRecibo] = useState(1);
  const [cajaId, setCajaId] = useState<number>(0);
  const [tipoMovimiento] = useState(2);
  const [codigoTarjeta] = useState(0);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState(false);

  const [bancos, setBancos] = useState<Banco[]>([]);
  const [bancoSeleccionado, setBancoSeleccionado] = useState<number>(1);

  const [metodosPago, setMetodosPago] = useState<MetodosPago[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(1);
  const [listaMetodosPago, setListaMetodosPago] = useState<OperacionData[]>([]);

  const [cuentasBancarias, setCuentasBancarias] = useState<CuentasBancarias[]>(
    []
  );
  const [cuentaBancariaSeleccionada, setCuentaBancariaSeleccionada] =
    useState<number>(0);

  const [tarjetas, setTarjetas] = useState<Tarjetas[]>([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<number>(0);

  const [monedas, setMonedas] = useState<Monedas[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<number>(0);

  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [numeroActualizacion, setNumeroActualizacion] = useState("");

  const [transferenciaObservacion, setTransferenciaObservacion] = useState("");
  const [numeroTransferencia, setNumeroTransferencia] = useState("");

  const [fechaVencimientoCheque, setFechaVencimientoCheque] = useState("");

  const [numeroCheque, setNumeroCheque] = useState("");

  const [importeDesdeCheque, setImporteDesdeCheque] = useState(0);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const determinarObservacion = (metodo: number) => {
    switch (metodo) {
      case 1:
        return "Cobro en Efectivo";
      case 2:
        return "Cobro en Cheque";
      case 3:
        return "Cobro con Tarjeta de Crédito";
      case 6:
        return "Cobro con Debito Automático";
      case 8:
        return "Cobro con Tarjeta de Débito";
      case 9:
        return `Transferencia  ${ventaSeleccionada?.cliente}/${
          bancos.find((banco) => banco.ba_codigo === bancoSeleccionado)
            ?.ba_descripcion
        }`;
      case 11:
        return "Cobro con billetera Zimple";
    }
  };

  const agregarMetodoPagoALaLista = () => {
    if (metodoPagoSeleccionado === 1) {
      if (montoRecibidoEfectivo === 0) {
        toast({
          title: "Error",
          description: "Debe ingresar un monto para el efectivo",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const nuevoMetodo: OperacionData = {
        ventaId: ventaSeleccionada?.codigo || 0,
        caja: cajaId,
        cuenta: 1,
        fecha: fecha,
        observacion: determinarObservacion(metodoPagoSeleccionado) || "",
        recibo: 0,
        documento: Number(ventaSeleccionada?.factura) || 0,
        operador: operadorActual,
        redondeo: 0,
        monto: montoRecibidoEfectivo,
        mora: 0,
        punitorio: 0,
        descuento: ventaSeleccionada?.descuento || 0,
        estado: 1,
        cod_retencion: 0,
        metodo: metodoPagoSeleccionado,
        tipomovimiento: tipoMovimiento,
        codigotarjeta: codigoTarjeta,
        banco: bancoSeleccionado,
        cuenta_bancaria: cuentaBancariaSeleccionada,
        tarjeta: tarjetaSeleccionada,
        moneda: monedaSeleccionada,
        nro_tarjeta: numeroTarjeta,
        nro_autorizacion: numeroActualizacion,
        titular: ventaSeleccionada?.codcliente,
        titularNombre: ventaSeleccionada?.cliente,
        nro_transferencia: numeroTransferencia,
        observacion_transferencia: transferenciaObservacion,
        vencimientoCheque: fechaVencimientoCheque,
        metodoNombre:
          metodosPago.find(
            (metodo) => metodo.me_codigo === metodoPagoSeleccionado
          )?.me_descripcion || "",
      };
      setListaMetodosPago([...listaMetodosPago, nuevoMetodo]);
      setMontoRecibidoEfectivo(0);
      onEfectivoModalClose();

    } else if ([3, 8].includes(metodoPagoSeleccionado)) {
      if (tarjetaSeleccionada === 0) {
        toast({
          title: "Error",
          description: "Debe seleccionar una tarjeta",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (!numeroTarjeta || !numeroActualizacion) {
        toast({
          title: "Error",
          description: "Debe completar los campos de la tarjeta",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const nuevoMetodo: OperacionData = {
        ventaId: ventaSeleccionada?.codigo || 0,
        caja: cajaId,
        cuenta: 1,
        fecha: fecha,
        observacion: determinarObservacion(metodoPagoSeleccionado) || "",
        recibo: 0,
        documento: Number(ventaSeleccionada?.factura) || 0,
        operador: operadorActual,
        redondeo: 0,
        monto: montoRecibidoTarjeta,
        mora: 0,
        punitorio: 0,
        descuento: ventaSeleccionada?.descuento || 0,
        estado: 1,
        cod_retencion: 0,
        metodo: metodoPagoSeleccionado,
        tipomovimiento: tipoMovimiento,
        codigotarjeta: codigoTarjeta,
        tipotarjeta:
          metodoPagoSeleccionado === 3
            ? 2
            : metodoPagoSeleccionado === 9
            ? 1
            : 0,
        banco: bancoSeleccionado,
        cuenta_bancaria: cuentaBancariaSeleccionada,
        tarjeta: tarjetaSeleccionada,
        moneda: monedaSeleccionada,
        nro_tarjeta: numeroTarjeta,
        nro_autorizacion: numeroActualizacion,
        titular: ventaSeleccionada?.codcliente,
        titularNombre: ventaSeleccionada?.cliente,
        nro_transferencia: numeroTransferencia,
        observacion_transferencia: transferenciaObservacion,
        vencimientoCheque: "",
        metodoNombre:
          metodosPago.find(
            (metodo) => metodo.me_codigo === metodoPagoSeleccionado
          )?.me_descripcion || "",
        bancoNombre:
          bancos.find((banco) => banco.ba_codigo === bancoSeleccionado)
            ?.ba_descripcion || "",
        tarjetaNombre:
          tarjetas.find((tarjeta) => tarjeta.t_codigo === tarjetaSeleccionada)
            ?.t_descripcion || "",
      };
      setListaMetodosPago([...listaMetodosPago, nuevoMetodo]);

      setNumeroTarjeta("");
      setNumeroActualizacion("");
      setMontoRecibidoTarjeta(0);
      onTarjetaModalClose();
    } else if ([6, 9].includes(metodoPagoSeleccionado)) {
      if (!numeroTransferencia) {
        toast({
          title: "Error",
          description: "Debe ingresar el número de transferencia",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const nuevoMetodo: OperacionData = {
        ventaId: ventaSeleccionada?.codigo || 0,
        caja: cajaId,
        cuenta: 1,
        fecha: fecha,
        observacion: determinarObservacion(metodoPagoSeleccionado) || "",
        recibo: 0,
        documento: Number(ventaSeleccionada?.factura) || 0,
        operador: operadorActual,
        redondeo: 0,
        monto: montoRecibidoTransferencia,
        mora: 0,
        punitorio: 0,
        descuento: ventaSeleccionada?.descuento || 0,
        estado: 1,
        cod_retencion: 0,
        metodo: metodoPagoSeleccionado,
        tipomovimiento: tipoMovimiento,
        codigotarjeta: codigoTarjeta,
        tipotarjeta:
          metodoPagoSeleccionado === 3
            ? 2
            : metodoPagoSeleccionado === 9
            ? 1
            : 0,
        banco: bancoSeleccionado,
        cuenta_bancaria: cuentaBancariaSeleccionada,
        tarjeta: tarjetaSeleccionada,
        moneda: monedaSeleccionada,
        nro_tarjeta: numeroTarjeta,
        nro_autorizacion: numeroActualizacion,
        titular: ventaSeleccionada?.codcliente,
        titularNombre: ventaSeleccionada?.cliente,
        nro_transferencia: numeroTransferencia,
        observacion_transferencia: transferenciaObservacion,
        vencimientoCheque: fechaVencimientoCheque,
        metodoNombre:
          metodosPago.find(
            (metodo) => metodo.me_codigo === metodoPagoSeleccionado
          )?.me_descripcion || "",
        bancoNombre:
          bancos.find((banco) => banco.ba_codigo === bancoSeleccionado)
            ?.ba_descripcion || "",
      };
      setListaMetodosPago([...listaMetodosPago, nuevoMetodo]);

      setNumeroTransferencia("");
      setTransferenciaObservacion("");
      setMontoRecibidoTransferencia(0);
      onTransferenciaModalClose();
    } else if (metodoPagoSeleccionado === 2) {
      if (!numeroCheque || !fechaVencimientoCheque || !importeDesdeCheque) {
        toast({
          title: "Error",
          description: "Debe completar los campos del cheque",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const nuevoMetodo: OperacionData = {
        ventaId: ventaSeleccionada?.codigo || 0,
        caja: cajaId,
        cuenta: 1,
        fecha: fecha,
        observacion: determinarObservacion(metodoPagoSeleccionado) || "",
        recibo: 0,
        documento: Number(ventaSeleccionada?.factura) || 0,
        operador: operadorActual,
        redondeo: 0,
        monto: importeDesdeCheque,
        mora: 0,
        punitorio: 0,
        descuento: ventaSeleccionada?.descuento || 0,
        estado: 1,
        cod_retencion: 0,
        metodo: metodoPagoSeleccionado,
        tipomovimiento: tipoMovimiento,
        codigotarjeta: codigoTarjeta,
        tipotarjeta: 0,
        banco: bancoSeleccionado,
        cuenta_bancaria: cuentaBancariaSeleccionada,
        tarjeta: tarjetaSeleccionada,
        moneda: monedaSeleccionada,
        nro_tarjeta: numeroTarjeta,
        numero_cheque: numeroCheque,
        nro_autorizacion: numeroActualizacion,
        titular: ventaSeleccionada?.codcliente,
        titularNombre: ventaSeleccionada?.cliente,
        nro_transferencia: numeroTransferencia,
        observacion_transferencia: transferenciaObservacion,
        vencimientoCheque: fechaVencimientoCheque,
        metodoNombre:
          metodosPago.find(
            (metodo) => metodo.me_codigo === metodoPagoSeleccionado
          )?.me_descripcion || "",
        bancoNombre:
          bancos.find((banco) => banco.ba_codigo === bancoSeleccionado)
            ?.ba_descripcion || "Hola",
      };
      setListaMetodosPago([...listaMetodosPago, nuevoMetodo]);

      setFechaVencimientoCheque("");
      setNumeroCheque("");
      setImporteDesdeCheque(0);

      onChequeModalClose();
    }
  };

  const borrarMetodoPago = (index: number) => {
    const newMetodos = listaMetodosPago.filter((_, i) => i !== index);
    setListaMetodosPago(newMetodos);
  };

  const totalmetodos = listaMetodosPago.reduce((acc, curr) => {
    if (curr.metodo !== 1) {
      return acc + curr.monto;
    }
    return acc;
  }, 0);

  const totalEfectivo = listaMetodosPago.reduce((acc, curr) => {
    if (curr.metodo === 1) {
      return acc + curr.monto;
    }
    return acc;
  }, 0);

  const totalRecibido = totalEfectivo + totalmetodos;

  const limpiarCamposCheque = () => {
    setFechaVencimientoCheque("");
    setNumeroCheque("");
    setImporteDesdeCheque(0);
  };

  const {
    isOpen: isCobroModalOpen,
    onOpen: onCobroModalOpen,
    onClose: onCobroModalClose,
  } = useDisclosure();

  const {
    isOpen: isTarjetaModalOpen,
    onOpen: onTarjetaModalOpen,
    onClose: onTarjetaModalClose,
  } = useDisclosure();

  const {
    isOpen: isTransferenciaModalOpen,
    onOpen: onTransferenciaModalOpen,
    onClose: onTransferenciaModalClose,
  } = useDisclosure();

  const {
    isOpen: isChequeModalOpen,
    onOpen: onChequeModalOpen,
    onClose: onChequeModalClose,
  } = useDisclosure();

  const {
    isOpen: isEfectivoModalOpen,
    onOpen: onEfectivoModalOpen,
    onClose: onEfectivoModalClose,
  } = useDisclosure();

  useEffect(() => {
    fetchVentas();
  }, [fecha]);

  useEffect(() => {
    fetchCajas();
    fetchSucursales();
    verificarCajaAbierta();
    fetchBancos();
    fetchCuentasBancarias();
    fetchTarjetas();
    fetchMonedas();
    fetchMetodosPago();
  }, []);

  const fetchMetodosPago = async () => {
    try {
      const response = await axios.get(`${api_url}venta/metodospago`);
      setMetodosPago(response.data.body);
      setMetodoPagoSeleccionado(response.data.body[0].me_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar los métodos de pago",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${api_url}monedas/`);
      console.log(response.data.body);
      setMonedas(response.data.body);
      setMonedaSeleccionada(response.data.body[0].mo_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar las monedas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchTarjetas = async () => {
    try {
      const response = await axios.get(`${api_url}bancos/tarjetas`);
      console.log("Estas son las tarjetas", response.data.body);
      setTarjetas(response.data.body);
      setTarjetaSeleccionada(response.data.body[0].t_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar las tarjetas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchCajas = async () => {
    try {
      const response = await axios.get(`${api_url}caja/traer-cajas`);
      console.log(response.data.body);
      setCajas(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar las cajas",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchBancos = async () => {
    try {
      const response = await axios.get(`${api_url}bancos/todos`);
      console.log("Estos son los bancos", response.data.body);
      setBancos(response.data.body);
      setBancoSeleccionado(response.data.body[0].ba_codigo);
      console.log("Banco seleccionado", response.data.body[0].ba_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar los bancos",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchCuentasBancarias = async () => {
    try {
      const response = await axios.get(`${api_url}bancos/cuentas`);
      console.log("Estas son las cuentas bancarias", response.data.body);
      setCuentasBancarias(response.data.body);
      setCuentaBancariaSeleccionada(response.data.body[0].cb_codigo);
    } catch (error) {
      toast({
        title: "Error al cargar las cuentas bancarias",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchVentas = async () => {
    setIsLoading(true);
    setVentas([]);
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        fecha_desde: fecha,
        fecha_hasta: fecha,
        sucursal: "",
        cliente: clienteFiltro,
        vendedor: vendedorFiltro,
        articulo: "",
        moneda: "",
        factura: facturaFiltro,
      });
      setVentas(response.data.body);
      console.log(response.data.body);
      console.log("Ventas");
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
    }
  };

  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursal(response.data.body);
      if (response.data.body.length > 0) {
        setSelectedSucursal(response.data.body[0].id.toString());
      }
    } catch (error) {
      toast({
        title: "Error al cargar las sucursales",
        description: "Por favor, intenta de nuevo más tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

  const insertarOperacion = async (operacionData: OperacionData) => {
    if (!operacionData.ventaId) {
      toast({
        title: "Error",
        description:
          "No se puede insertar la operación sin un ID de venta válido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post(
        `${api_url}caja/insertar-operacion`,
        operacionData,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error al insertar operación:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al insertar la operación.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function verificarCajaAbierta() {
    try {
      const response = await axios.get(
        `${api_url}caja/verificar/${operadorActual}`
      );
      console.log(response.data);
      if (
        response.data.body.length > 0 &&
        response.data.body[0].ca_fecha_cierre === null
      ) {
        setCajaId(response.data.body[0].ca_codigo);
        setCajaAbierta(true);
      } else {
        setCajaAbierta(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al intentar verificar si hay una caja abierta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-PY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredVentas = ventas.filter(
    (venta) =>
      venta.vendedor.toLowerCase().includes(vendedorFiltro.toLowerCase()) &&
      venta.cliente.toLowerCase().includes(clienteFiltro.toLowerCase()) &&
      venta.factura.toLowerCase().includes(facturaFiltro.toLowerCase())
  );

  const efectivorestante = (ventaSeleccionada?.total ?? 0) - totalmetodos;

  const vuelto = (monto: number, total: number) => {
    const result = monto - total;
    return result < 0 ? 0 : result;
  };

  const faltante = (monto: number, total: number) => {
    const result = total - monto;
    return result < 0 ? 0 : result;
  };

  const handleCobro = async () => {
    if (listaMetodosPago.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un método de pago",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (cajaAbierta === false) {
      toast({
        title: "Advertencia",
        description: "No existe una caja abierta actualmente.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    listaMetodosPago.forEach((metodo) => {
      insertarOperacion(metodo);
    });
    await actualizarUltimaFactura(
      Number(facturaData[0]?.d_nro_secuencia),
      Number(numeroFactura)
    );
    toast({
      title: "Venta cobrada",
      description: "La venta fue cobrada exitosamente",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCancelarCobro = () => {
    onCobroModalClose();
    setMontoRecibidoEfectivo(0);
    setFiltroMetodo(0);
  };

  const abrirModalMetodoPago = () => {
    switch (metodoPagoSeleccionado) {
      case 1:
        onEfectivoModalOpen();
        break;
      case 2:
        onChequeModalOpen();
        break;
      case 3:
      case 8:
        onTarjetaModalOpen();
        break;
      case 6:
      case 9:
        onTransferenciaModalOpen();
        break;
      // Añade más casos según sea necesario
    }
  };

  return (
    <Box bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <VStack
        spacing={4}
        align="stretch"
        bg={"white"}
        p={2}
        borderRadius={"md"}
        boxShadow={"sm"}
        h={"100%"}
      >
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <HandCoins size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Cobros caja diaria</Heading>
        </Flex>

        <Flex gap={4} flexDir={isMobile ? "column" : "row"}>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Select>
            <option value="1">Ventas contado</option>
            <option value="2">Ventas crédito</option>
          </Select>
          <Box>
            <Select
              value={selectedSucursal}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedSucursal(e.target.value)
              }
              placeholder="Seleccione una sucursal"
              width={"250px"}
            >
              {sucursal.map((suc: Sucursal) => (
                <option key={suc.id} value={suc.id.toString()}>
                  {suc.descripcion}
                </option>
              ))}
            </Select>
          </Box>

          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por vendedor"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filtrar por cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nº de factura"
              value={facturaFiltro}
              onChange={(e) => setFacturaFiltro(e.target.value)}
            />
          </InputGroup>
        </Flex>
        <Divider />
        <Flex gap={2} flexDir={"column"} p={2} flex={"1"} overflowY={"auto"}>
          <Flex borderRadius="md" flexDir="column" mt={2}>
            {/* Encabezados */}
            <Flex
              display={{ base: "none", md: "grid" }}
              gridTemplateColumns="5% 10% 10% 10% 10% 10% 10% 10% 10% 10% "
              p={4}
              bg="gray.100"
              borderRadius="md"
              gap={2}
            >
              {[
                "Código",
                "Fecha",
                "Razon Social",
                "Nro. Factura",
                "Nro. Timbrado",
                "Vendedor",
                "Moneda",
                "Saldo",
                "Descuento",
                "Subtotal",
              ].map((header, index) => (
                <Text
                  key={index}
                  fontWeight="bold"
                  color="gray"
                  textAlign="center"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {header}
                </Text>
              ))}
            </Flex>

            {/* Filas de datos */}
            <Flex flexDir="column" gap={1} p={1} overflowY={"auto"}>
              {filteredVentas
                .filter((venta) => venta.saldo != 0.0)
                .map((venta) => (
                  <Flex
                    key={filteredVentas.indexOf(venta)}
                    flexDir={{ base: "column", md: "row" }}
                    display="grid"
                    gridTemplateColumns={{
                      base: "1fr",
                      md: "5% 10% 10% 10% 10% 10% 10% 10% 10% 10%",
                    }}
                    p={4}
                    _hover={{ bg: "gray.50" }}
                    boxShadow="xs"
                    borderRadius="md"
                    cursor="pointer"
                    gap={2}
                    onClick={() => {
                      setVentaSeleccionada(venta);
                      onCobroModalOpen();
                      obtenerTimbrado();
                    }}
                  >
                    {[
                      venta.codigo,
                      venta.fecha,
                      venta.cliente,
                      venta.factura,
                      venta.codsucursal,
                      venta.vendedor,
                      venta.moneda,
                      venta.saldo,
                      venta.descuento,
                      venta.total,
                    ].map((col, index) => (
                      <Box
                        key={index}
                        display="flex"
                        flexDir={{ base: "row", md: "column" }}
                        justifyContent="space-between"
                        alignItems="center"
                        textAlign="center"
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        <Text
                          display={{ base: "block", md: "none" }}
                          fontWeight="bold"
                        >
                          {
                            [
                              "Código",
                              "Fecha",
                              "Razon Social",
                              "Nro. Factura",
                              "Nro. Timbrado",
                              "Vendedor",
                              "Moneda",
                              "Saldo",
                              "Descuento",
                              "Subtotal",
                            ][index]
                          }
                        </Text>
                        <Text>{col}</Text>
                      </Box>
                    ))}
                  </Flex>
                ))}
            </Flex>
          </Flex>
        </Flex>
      </VStack>
      <Modal
        isOpen={isCobroModalOpen}
        onClose={onCobroModalClose}
        isCentered={true}
        size={"5xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cobrar venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2} w={"100%"}>
              <Flex gap={4} w={"100%"}>
                <Flex flexDir={"column"} gap={4} flexGrow={1} w={"100%"}>
                  <Flex gap={2} flexGrow={1} w={"100%"}>
                    <Box flexGrow={1} w={"100%"}>
                      <FormLabel>Caja</FormLabel>
                      <Select flexGrow={1}>
                        {cajas.map((caja) => (
                          <option key={caja.cd_codigo} value={caja.cd_codigo}>
                            {caja.cd_descripcion}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box flexGrow={1} w={"100%"}>
                      <FormLabel>Método</FormLabel>
                      <Flex>
                        <Select
                          value={Number(metodoPagoSeleccionado)}
                          onChange={(e) => {
                            setMetodoPagoSeleccionado(Number(e.target.value));
                          }}
                          mr={2}
                        >
                          {metodosPago.map((metodo) => (
                            <option
                              key={metodo.me_codigo}
                              value={metodo.me_codigo}
                            >
                              {metodo.me_codigo}-{metodo.me_descripcion}
                            </option>
                          ))}
                        </Select>
                        <Button onClick={abrirModalMetodoPago}>Detalles</Button>
                      </Flex>
                    </Box>
                  </Flex>
                  <Textarea placeholder="Observaciones" />
                </Flex>

                <Flex
                  flexDir={"column"}
                  justifyContent={"center"}
                  pl={8}
                  bg={"gray.50"}
                  p={2}
                  borderRadius={"md"}
                  w={"30%"}
                >
                  <CheckboxGroup
                    onChange={(value) => setTipoRecibo(Number(value))}
                  >
                    <Stack spacing={2}>
                      <Checkbox value="1">Recibo Interno</Checkbox>
                      <Checkbox value="2">Recibo en Ticket</Checkbox>
                      <Checkbox value="3">Recibo Fiscal</Checkbox>
                      <Checkbox value="4">Factura Fiscal</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </Flex>
              </Flex>
              {tipoRecibo === 4 && (
                <Flex flexDir={"column"}>
                  <Heading size={"md"}>Datos de factura</Heading>
                  <Flex>
                    <FormLabel>Razón Social:</FormLabel>
                    <Text>{ventaSeleccionada?.cliente}</Text>
                  </Flex>
                  <Flex>
                    <FormLabel>RUC:</FormLabel>
                    <Text>{ventaSeleccionada?.ruc}</Text>
                  </Flex>
                  <Flex>
                    <FormLabel>Direccion:</FormLabel>
                    <Text>{ventaSeleccionada?.direccion}</Text>
                  </Flex>
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    pt={5}
                    w={"100%"}
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
                        <InputLeftAddon>
                          {numeroEmision} {numeroEstablecimiento}
                        </InputLeftAddon>
                        <Input
                          type="text"
                          placeholder={facturaData[0]?.d_nro_secuencia + 1}
                          value={numeroFactura}
                          onChange={(e) => setNumeroFactura(e.target.value)}
                          width={isMobile ? "full" : "180px"}
                          bg={"white"}
                        />
                      </InputGroup>
                    </Box>
                  </Box>
                </Flex>
              )}
              <Flex>
                <Table>
                  <Tr>
                    <Th>Método</Th>
                    <Th>Monto</Th>
                    <Th>Titular</Th>
                    <Th>Banco/Teléfono</Th>
                    <Th>Vencimiento</Th>
                    <Th>Nro. Cheq./Tarj.</Th>
                    <Th>Nro. Aut.</Th>
                    <Th>Tarjeta</Th>
                    <Th></Th>
                  </Tr>
                  <Tbody>
                    {listaMetodosPago.map((metodo, index) => (
                      <Tr
                        key={index}
                        onClick={() =>
                          setSelectedRow(selectedRow === index ? null : index)
                        }
                        position="relative"
                        cursor="pointer"
                      >
                        <Td>{metodo.metodoNombre}</Td>
                        <Td>{metodo.monto}</Td>
                        <Td>{metodo.titularNombre}</Td>
                        <Td>{metodo.bancoNombre}</Td>
                        <Td>{metodo.vencimientoCheque}</Td>
                        <Td>
                          {metodo.nro_tarjeta ||
                            metodo.nro_transferencia ||
                            metodo.numero_cheque}
                        </Td>
                        <Td>{metodo.nro_autorizacion}</Td>
                        <Td>{metodo.tarjetaNombre}</Td>
                        <Td width="0" padding="0" position="relative">
                          <Box
                            bg="red.500"
                            color="white"
                            borderRadius="md"
                            p={2}
                            position="absolute"
                            right="0"
                            top="50%"
                            transform={`translateY(-50%) translateX(${
                              selectedRow === index ? "0" : "100%"
                            })`}
                            opacity={selectedRow === index ? 1 : 0}
                            transition="all 0.2s ease"
                            onClick={(e) => {
                              e.stopPropagation();
                              borrarMetodoPago(index);
                            }}
                            _hover={{ bg: "red.600" }}
                          >
                            <Trash />
                          </Box>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Flex>
              <Flex
                w="100%"
                h={isMobile ? "auto" : "40"}
                bg="blue.600"
                borderRadius={"md"}
                p={2}
                px={4}
              >
                <Flex
                  gap={isMobile ? 2 : 4}
                  display={"flex"}
                  w={"100%"}
                  justifyContent={"space-between"}
                  flexDir={isMobile ? "column" : "row"}
                >
                  <Flex
                    flexDir={isMobile ? "row" : "column"}
                    justifyContent={isMobile ? "space-between" : "center"}
                    alignItems={"flex-end"}
                  >
                    <FormLabel color={"white"}>
                      <strong>Total Neto:</strong>
                    </FormLabel>
                    <Text
                      color={"white"}
                      fontSize={isMobile ? "x-large" : "xxx-large"}
                    >
                      {formatCurrency(ventaSeleccionada?.total || 0)}
                    </Text>
                  </Flex>
                  <Flex
                    flexDir={isMobile ? "row" : "column"}
                    justifyContent={isMobile ? "space-between" : "center"}
                    alignItems={"flex-end"}
                  >
                    <FormLabel color={"white"}>
                      <strong>Recibido de otros métodos:</strong>
                    </FormLabel>
                    <Text
                      color={"white"}
                      fontSize={isMobile ? "x-large" : "xxx-large"}
                    >
                      {formatCurrency(totalmetodos)}
                    </Text>
                  </Flex>
                  <Flex
                    flexDir={isMobile ? "row" : "column"}
                    justifyContent={isMobile ? "space-between" : "center"}
                    alignItems={"flex-end"}
                  >
                    <FormLabel color={"white"}>
                      <strong>Recibido en efectivo:</strong>
                    </FormLabel>
                    <Text
                      color={"white"}
                      fontSize={isMobile ? "x-large" : "xxx-large"}
                    >
                      {formatCurrency(totalEfectivo)}
                    </Text>
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
                      {formatCurrency(
                        faltante(totalRecibido, efectivorestante)
                      )}
                    </Text>
                  </Flex>
                
                </Flex>
              </Flex>
              <Flex
                w="100%"
                h={isMobile ? "auto" : "40"}
                bg="green.600"
                borderRadius={"md"}
                p={2}
                px={4}
              >
                <Flex
                  gap={isMobile ? 2 : 4}
                  display={"flex"}
                  w={"100%"}
                  justifyContent={"flex-start"}
                  flexDir={isMobile ? "column" : "row"}
                >
                  <Flex
                    flexDir={isMobile ? "row" : "column"}
                    justifyContent={isMobile ? "space-between" : "center"}
                    alignItems={"flex-end"}
                  >
                    <FormLabel color={"white"} pb={isMobile ? 0 : 4}>
                      <strong>Entr. en Efectivo:</strong>
                    </FormLabel>
                    <Input
                      height={isMobile ? "40px" : "60px"}
                      type="number"
                      placeholder="Gs."
                      value={montoRecibidoEfectivo}
                      onChange={(e) =>
                        setMontoRecibidoEfectivo(Number(e.target.value))
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
                      <strong>Vuelto:</strong>
                    </FormLabel>
                    <Text
                      color={"white"}
                      fontSize={isMobile ? "x-large" : "xxx-large"}
                    >
                      {formatCurrency(
                        vuelto(montoRecibidoEfectivo, efectivorestante)
                      )}
                    </Text>
                  </Flex>

                  
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              variant={"outline"}
              mr={3}
              onClick={handleCancelarCobro}
            >
              Cancelar
            </Button>
            <Button variant="solid" colorScheme="green" onClick={handleCobro}>
              Cobrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isTarjetaModalOpen}
        onClose={onTarjetaModalClose}
        isCentered={true}
        size={"md"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tarjetas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDir={"column"} gap={4}>
              <Flex alignItems={"center"}>
                <FormLabel>Banco:</FormLabel>
                <Select
                  value={bancoSeleccionado}
                  onChange={(e) => {
                    setBancoSeleccionado(Number(e.target.value));
                    console.log("Banco seleccionado", e.target.value);
                  }}
                >
                  {bancos.map((banco) => (
                    <option key={banco.ba_codigo} value={banco.ba_codigo}>
                      {banco.ba_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex alignItems={"center"}>
                <FormLabel>Cuenta:</FormLabel>
                <Select
                  value={cuentaBancariaSeleccionada}
                  onChange={(e) => {
                    setCuentaBancariaSeleccionada(Number(e.target.value));
                  }}
                >
                  {cuentasBancarias.map((cuenta) => (
                    <option key={cuenta.cb_codigo} value={cuenta.cb_codigo}>
                      {cuenta.cb_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Tarjeta:</FormLabel>
                <Select
                  value={tarjetaSeleccionada}
                  onChange={(e) => {
                    setTarjetaSeleccionada(Number(e.target.value));
                  }}
                >
                  {tarjetas.map((tarjeta) => (
                    <option key={tarjeta.t_codigo} value={tarjeta.t_codigo}>
                      {tarjeta.t_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Moneda:</FormLabel>
                <Select
                  value={monedaSeleccionada}
                  onChange={(e) => {
                    setMonedaSeleccionada(Number(e.target.value));
                  }}
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Nro. Tarjeta:</FormLabel>
                <Input
                  value={numeroTarjeta}
                  onChange={(e) => {
                    setNumeroTarjeta(e.target.value);
                  }}
                />
              </Flex>
              <Flex>
                <FormLabel>Nro. Autorización:</FormLabel>
                <Input
                  value={numeroActualizacion}
                  onChange={(e) => {
                    setNumeroActualizacion(e.target.value);
                  }}
                />
              </Flex>
              <Flex>
                <FormLabel>Importe:</FormLabel>
                <Input
                  type="number"
                  value={montoRecibidoTarjeta}
                  onChange={(e) => {
                    setMontoRecibidoTarjeta(Number(e.target.value));
                  }}
                />
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onTarjetaModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={() => {
                agregarMetodoPagoALaLista();
                onTarjetaModalClose();
              }}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isTransferenciaModalOpen}
        onClose={onTransferenciaModalClose}
        isCentered={true}
        size={"md"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transferencia Bancaria</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDir={"column"} gap={4}>
              <Flex alignItems={"center"}>
                <FormLabel>Banco Emisor:</FormLabel>
                <Select
                  value={bancoSeleccionado}
                  onChange={(e) => {
                    setBancoSeleccionado(Number(e.target.value));
                    console.log("Banco seleccionado", e.target.value);
                  }}
                >
                  {bancos.map((banco) => (
                    <option key={banco.ba_codigo} value={banco.ba_codigo}>
                      {banco.ba_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex alignItems={"center"}>
                <FormLabel>Cuenta:</FormLabel>
                <Select
                  value={cuentaBancariaSeleccionada}
                  onChange={(e) => {
                    setCuentaBancariaSeleccionada(Number(e.target.value));
                  }}
                >
                  {cuentasBancarias.map((cuenta) => (
                    <option key={cuenta.cb_codigo} value={cuenta.cb_codigo}>
                      {cuenta.cb_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Moneda:</FormLabel>
                <Select
                  value={monedaSeleccionada}
                  onChange={(e) => {
                    setMonedaSeleccionada(Number(e.target.value));
                  }}
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Numero:</FormLabel>
                <Input
                  value={numeroTransferencia}
                  onChange={(e) => {
                    setNumeroTransferencia(e.target.value);
                  }}
                />
              </Flex>
              <Flex>
                <FormLabel>Importe:</FormLabel>
                <Input
                  type="number"
                  value={montoRecibidoTransferencia}
                  onChange={(e) => {
                    setMontoRecibidoTransferencia(Number(e.target.value));
                  }}
                />
              </Flex>
              <Flex flexDir={"column"}>
                <FormLabel>Obs.:</FormLabel>
                <Textarea
                  value={transferenciaObservacion}
                  onChange={(e) => {
                    setTransferenciaObservacion(e.target.value);
                  }}
                />
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onTarjetaModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={() => {
                agregarMetodoPagoALaLista();
                onTransferenciaModalClose();
              }}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isChequeModalOpen}
        onClose={onChequeModalClose}
        isCentered={true}
        size={"md"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cheque</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDir={"column"} gap={4}>
              <Flex alignItems={"center"}>
                <FormLabel>Banco Emisor:</FormLabel>
                <Select
                  value={bancoSeleccionado}
                  onChange={(e) => {
                    setBancoSeleccionado(Number(e.target.value));
                    console.log("Banco seleccionado", e.target.value);
                  }}
                >
                  {bancos.map((banco) => (
                    <option key={banco.ba_codigo} value={banco.ba_codigo}>
                      {banco.ba_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex>
                <FormLabel>Titular:</FormLabel>
                <Input
                  isDisabled
                  value={ventaSeleccionada?.cliente}
                  onChange={(e) => {
                    setNumeroTransferencia(e.target.value);
                  }}
                />
              </Flex>
              <Flex>
                <FormLabel>Moneda:</FormLabel>
                <Select
                  value={monedaSeleccionada}
                  onChange={(e) => {
                    setMonedaSeleccionada(Number(e.target.value));
                  }}
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </Select>
              </Flex>

              <Flex>
                <FormLabel>Importe:</FormLabel>
                <Input
                  type="number"
                  value={importeDesdeCheque}
                  onChange={(e) =>
                    setImporteDesdeCheque(Number(e.target.value))
                  }
                />
              </Flex>
              <Flex>
                <FormLabel>Fecha de vencimiento:</FormLabel>
                <Input
                  type="date"
                  value={fechaVencimientoCheque}
                  onChange={(e) => {
                    setFechaVencimientoCheque(e.target.value);
                  }}
                />
              </Flex>
              <Flex>
                <FormLabel>Numero:</FormLabel>
                <Input
                  value={numeroCheque}
                  onChange={(e) => {
                    setNumeroCheque(e.target.value);
                  }}
                />
                <Button
                  colorScheme="red"
                  variant={"outline"}
                  ml={2}
                  onClick={limpiarCamposCheque}
                >
                  Borrar
                </Button>
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onTarjetaModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={agregarMetodoPagoALaLista}
            >
              Agregar Cheque
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isEfectivoModalOpen}
        onClose={onEfectivoModalClose}
        isCentered={true}
        size={"md"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Efectivo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display={"flex"} flexDir={"column"} gap={4}>
              <Flex>
                <FormLabel>Importe:</FormLabel>
                <Input
                  type="number"
                  value={montoRecibidoEfectivo}
                  onChange={(e) => {
                    setMontoRecibidoEfectivo(Number(e.target.value));
                  }}
                />
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onEfectivoModalClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={() => {
                agregarMetodoPagoALaLista();
                onEfectivoModalClose();
              }}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
