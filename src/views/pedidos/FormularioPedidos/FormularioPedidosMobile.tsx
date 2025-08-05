import { useDepositosStore } from "@/stores/depositosStore";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useOperadoresStore } from "@/stores/operadoresStore";

import { Articulo } from "@/ui/articulos/types/articulo.type";
import { useEffect, useMemo, useRef, useState } from "react";
import { getArticulosPorCodBarra } from "@/ui/articulos/services/articuloPorCodBarraService";
import { useMonedasStore } from "@/stores/monedasStore";
import { PedidoDTO, DetallePedidoTabla } from "./types/shared.type";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import {
  Cliente,
  Deposito,
  ListaPrecios,
  Moneda,
  Sucursal,
} from "@/types/shared_interfaces";
import { useToast } from "@chakra-ui/react";
import { agregarItemPedido } from "./services/pedidoServices";
import { calcularTotalesPedido } from "./utils/calcularTotales";
import { ShoppingCartIcon, Check, X, Plus, Settings, ArrowUp, ArchiveX } from "lucide-react";
import { useClientesStore } from "@/stores/clientesStore";
import BuscadorClientesMobile from "@/ui/clientes/BuscardorClientesMobile";
import { ArticulosComponentMobile } from "@/ui/articulos/ArticulosComponentMobile";
import { formatCurrency } from "./utils/formatCurrency";
import { usePedidos } from "./hooks/usePedidos";
import { usePedidosConfigStore } from "./stores/pedidosConfigStore";

const FormularioPedidosMobile = () => {
  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();
  const { vendedorSeleccionado, getOperadorPorCodInterno, cargando, setVendedorSeleccionado } =
    useOperadoresStore();
  const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();
  const { monedas, fetchMonedas } = useMonedasStore();
  const { clienteSeleccionado, cargarClientesPorId, setClienteSeleccionado } = useClientesStore();
  const [clienteSeleccionadoInterno, setClienteSeleccionadoInterno] =
    useState<Cliente>();
  const [precioSeleccionado, setPrecioSeleccionado] = useState<ListaPrecios>();
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito>();
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal>();
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda>();

  const [cantidadArticulo, setCantidadArticulo] = useState<number>(1);
  const [precioArticulo, setPrecioArticulo] = useState<number>(0);
  const [descuentoArticulo, setDescuentoArticulo] = useState<number>(0);
  const [bonificacionArticulo, setBonificacionArticulo] = useState<number>(0);

  const [fechaPedido, setFechaPedido] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [busquedaVendedor, setBusquedaVendedor] = useState<string>("");

  const user = sessionStorage.getItem("user_name");
  const operador = sessionStorage.getItem("user_id");

  const [pedidoDTO, setPedidoDTO] = useState<PedidoDTO>({
    p_fecha: fechaPedido,
    p_nropedido: "",
    p_cliente: 0,
    p_operador: operador ? Number(operador) : 0,
    p_moneda: 0,
    p_deposito: 0,
    p_sucursal: 0,
    p_descuento: 0,
    p_obs: "",
    p_estado: 1,
    p_vendedor: operador ? Number(operador) : 0,
    p_area: 5,
    p_tipo_estado: 1,
    p_credito: 0,
    p_imprimir: 0,
    p_interno: 0,
    p_latitud: 0,
    p_longitud: 0,
    p_tipo: 0,
    p_entrega: 0,
    p_cantcuotas: 0,
    p_consignacion: 0,
    p_autorizar_a_contado: 0,
    p_zona: 0,
    p_acuerdo: 0,
    p_imprimir_preparacion: 0,
    p_cantidad_cajas: 0,
    p_preparado_por: 0,
    p_verificado_por: 0,
  });
  const [detallePedido, setDetallePedido] = useState<DetallePedidoTabla[]>([]);

  const [articulo, setArticulo] = useState<Articulo>();

  const vendedorRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const articuloCodigoRef = useRef<HTMLInputElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);
  const bonificacionRef = useRef<HTMLInputElement>(null);
  const precioRef = useRef<HTMLInputElement>(null);
  const descuentoRef = useRef<HTMLInputElement>(null);
  const agregarBtnRef = useRef<HTMLButtonElement>(null);

  const [modalArticulosOpen, setModalArticulosOpen] = useState(false);
  const [modalClientesOpen, setModalClientesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [codigoBarraArticulo, setCodigoBarraArticulo] = useState("");

  const toast = useToast();

  const { insertarPedido } = usePedidos();

  // Agregar el store de configuración
  const { 
    sucursalSeleccionada: sucursalGuardada, 
    depositoSeleccionado: depositoGuardado,
    listaPrecioSeleccionada: listaPrecioGuardada,
    monedaSeleccionada: monedaGuardada,
    vendedorSeleccionado: vendedorGuardado,
    setSucursalSeleccionada: setSucursalGuardada,
    setDepositoSeleccionado: setDepositoGuardado,
    setListaPrecioSeleccionada: setListaPrecioGuardada,
    setMonedaSeleccionada: setMonedaGuardada,
    setVendedorSeleccionado: setVendedorGuardado
  } = usePedidosConfigStore();

  const handleBusquedaPorCodigoBarra = async (busqueda: string) => {
    if (depositoSeleccionado?.dep_codigo && monedaSeleccionada?.mo_codigo) {
      const articulo = await getArticulosPorCodBarra(
        busqueda,
        depositoSeleccionado?.dep_codigo,
        0,
        monedaSeleccionada?.mo_codigo
      );
      if (articulo) {
        setArticulo(articulo[0]);
        setCodigoBarraArticulo(articulo.ar_codbarra);
        cantidadRef.current?.focus();
        setPrecioArticulo(articulo.ar_pvg);
        setDescuentoArticulo(0);
        setBonificacionArticulo(0);
        setCantidadArticulo(1);
      } else {
        toast({
          title: "Error",
          description: "No se encontró el artículo o no está disponible en la moneda seleccionada",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Debe seleccionar un depósito y una moneda",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchMonedas();
    fetchSucursales();
    fetchDepositos();
    fetchListaPrecios();
  }, []);

  const handleAgregarItem = (
    articulo: Articulo,
    cantidad: number,
    precioUnitario?: number,
    descuento?: number,
    bonificacion?: number
  ) => {
    const resultado = agregarItemPedido(detallePedido, {
      articulo,
      cantidad,
      precioSeleccionado: precioSeleccionado!,
      monedaSeleccionada: monedaSeleccionada!,
      depositoSeleccionado: depositoSeleccionado!,
      sucursalSeleccionada: sucursalSeleccionada!,
      vendedorSeleccionado: vendedorSeleccionado!,
      precioUnitario,
      descuento,
      bonificacion,
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

    setDetallePedido(resultado.detallePedido!);
    setArticulo(undefined);
    setCantidadArticulo(1);
    setPrecioArticulo(0);
    setDescuentoArticulo(0);
    setBonificacionArticulo(0);
  };

  //EFFECT PARA SELECCIONAR POR DEFECTO
  useEffect(() => {
    if (listaPrecios.length > 0 && !precioSeleccionado) {
      if (listaPrecioGuardada) {
        const listaPrecio = listaPrecios.find(lp => lp.lp_codigo === listaPrecioGuardada);
        setPrecioSeleccionado(listaPrecio || listaPrecios[0]);
      } else {
        setPrecioSeleccionado(listaPrecios[0]);
      }
    }
    if (depositos.length > 0 && !depositoSeleccionado) {
      if (depositoGuardado) {
        const deposito = depositos.find(d => d.dep_codigo === depositoGuardado);
        setDepositoSeleccionado(deposito || depositos[0]);
      } else {
        setDepositoSeleccionado(depositos[0]);
      }
    }
    if (sucursales.length > 0 && !sucursalSeleccionada) {
      if (sucursalGuardada) {
        const sucursal = sucursales.find(s => s.id === sucursalGuardada);
        setSucursalSeleccionada(sucursal || sucursales[0]);
      } else {
        setSucursalSeleccionada(sucursales[0]);
      }
    }
    if (monedas.length > 0 && !monedaSeleccionada) {
      if (monedaGuardada) {
        const moneda = monedas.find(m => m.mo_codigo === monedaGuardada);
        setMonedaSeleccionada(moneda || monedas[0]);
      } else {
        setMonedaSeleccionada(monedas[0]);
      }
    }
  }, [listaPrecios, depositos, sucursales, monedas, listaPrecioGuardada, depositoGuardado, sucursalGuardada, monedaGuardada]);

  // Solo un useEffect para restaurar el vendedor guardado al cargar la página
  useEffect(() => {
    if (vendedorGuardado && !vendedorSeleccionado) {
      getOperadorPorCodInterno(vendedorGuardado);
      setBusquedaVendedor(vendedorGuardado.toString());
    }
  }, []); // Solo se ejecuta al montar el componente

  // useEffect para manejar cambios en el vendedor seleccionado
  useEffect(() => {
    if (clienteSeleccionado) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_cliente: clienteSeleccionado.cli_codigo,
      }));
      setClienteSeleccionadoInterno(clienteSeleccionado);
      setBusquedaCliente(clienteSeleccionado.cli_interno.toString());
    }

    if (vendedorSeleccionado) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_vendedor: vendedorSeleccionado.op_codigo,
      }));
      // Guardar automáticamente el vendedor seleccionado como predeterminado
      setVendedorGuardado(vendedorSeleccionado.op_codigo);
    }
    
    if (sucursalSeleccionada) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_sucursal: sucursalSeleccionada.id,
      }));
    }
    if (depositoSeleccionado) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_deposito: depositoSeleccionado.dep_codigo,
      }));
    }
    if (monedaSeleccionada) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_moneda: monedaSeleccionada.mo_codigo,
      }));
    }
    if (precioSeleccionado) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_lista_precio: precioSeleccionado.lp_codigo,
      }));
    }
  }, [
    clienteSeleccionado,
    vendedorSeleccionado,
    sucursalSeleccionada,
    depositoSeleccionado,
    monedaSeleccionada,
    precioSeleccionado
  ]);

  // Agregar useEffect para actualizar el operador cuando cambie
  useEffect(() => {
    if (operador) {
      setPedidoDTO(prev => ({
        ...prev,
        p_operador: Number(operador)
      }));
      setVendedorGuardado(Number(operador));
    }
  }, [operador]);

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      clienteRef.current?.focus();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Focus al input de cliente solo al cargar la página
  useEffect(() => {
    clienteRef.current?.focus();
  }, []);

  const handleClienteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && busquedaCliente) {
      cargarClientesPorId(Number(busquedaCliente));
      vendedorRef.current?.focus();
    } else if (
      e.key === "Enter" &&
      (busquedaCliente === "" || busquedaCliente === null)
    ) {
      setModalClientesOpen(true);
    }
  };

  // Simplificar el handler del vendedor para que solo maneje Enter
  const handleVendedorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      articuloCodigoRef.current?.focus();
    }
  };

  // Simplificar la función para buscar vendedor
  const handleBuscarVendedor = () => {
    if (busquedaVendedor && busquedaVendedor.trim() !== "") {
      getOperadorPorCodInterno(Number(busquedaVendedor));
    } else {
      toast({
        title: "Error",
        description: "Debe ingresar un código de vendedor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleArticuloKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!codigoBarraArticulo || codigoBarraArticulo.trim() === "") {
        setModalArticulosOpen(true);
      } else {
        handleBusquedaPorCodigoBarra(codigoBarraArticulo);
        cantidadRef.current?.focus();
      }
    }
  };

  const handleCantidadKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      bonificacionRef.current?.focus();
    }
  };

  const handleBonificacionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      descuentoRef.current?.focus();
    }
  };

  const handleDescuentoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      precioRef.current?.focus();
    }
  };

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && articulo) {
      handleAgregarItem(
        articulo,
        cantidadArticulo,
        precioArticulo,
        descuentoArticulo,
        bonificacionArticulo
      );
      articuloCodigoRef.current?.focus();
    }
  };

  // Simplificar la función cancelarPedido
  const cancelarPedido = () => {
    setPedidoDTO({
      p_fecha: fechaPedido,
      p_nropedido: "",
      p_cliente: 0,
      p_operador: operador ? Number(operador) : 0,
      p_moneda: monedaSeleccionada?.mo_codigo || 0,
      p_deposito: depositoSeleccionado?.dep_codigo || 0,
      p_sucursal: sucursalSeleccionada?.id || 0,
      p_descuento: 0,
      p_obs: "",
      p_estado: 1,
      p_vendedor: vendedorSeleccionado?.op_codigo || 0,
      p_area: 5,
      p_tipo_estado: 1,
      p_credito: 0,
      p_imprimir: 0,
      p_interno: 0,
      p_latitud: 0,
      p_longitud: 0,
      p_tipo: 0,
      p_entrega: 0,
      p_cantcuotas: 0,
      p_consignacion: 0,
      p_autorizar_a_contado: 0,
      p_zona: 0,
      p_acuerdo: 0,
      p_imprimir_preparacion: 0,
      p_cantidad_cajas: 0,
      p_preparado_por: 0,
      p_verificado_por: 0,
    })
    setDetallePedido([]);
    setArticulo(undefined);
    setCantidadArticulo(1);
    setPrecioArticulo(0);
    setDescuentoArticulo(0);
    setBonificacionArticulo(0);
    setCodigoBarraArticulo("");
    setModalArticulosOpen(false);
    setModalClientesOpen(false);
    setBusquedaCliente("");
    
    // Limpiar vendedor y restaurar el guardado
    setVendedorSeleccionado(null);
    setBusquedaVendedor("");
    // Restaurar el vendedor guardado
    if (vendedorGuardado) {
      getOperadorPorCodInterno(vendedorGuardado);
      setBusquedaVendedor(vendedorGuardado.toString());
    }
    
    setClienteSeleccionadoInterno(undefined);
    setClienteSeleccionado(null);
  };

  // Agrega este useEffect para hacer focus cuando se selecciona un vendedor
  useEffect(() => {
    if (vendedorSeleccionado) {
      articuloCodigoRef.current?.focus();
    }
  }, [vendedorSeleccionado]);

  // Agrega este useEffect para asegurar que el cliente se actualice en el pedidoDTO
  useEffect(() => {
    if (clienteSeleccionadoInterno) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_cliente: clienteSeleccionadoInterno.cli_codigo,
      }));
    }
  }, [clienteSeleccionadoInterno]);

  // Agrega este useEffect para hacer focus cuando se selecciona un artículo
  useEffect(() => {
    if (articulo) {
      cantidadRef.current?.focus();
    }
  }, [articulo]);

  // Agregar funciones para manejar cambios y guardar en el store
  const handleSucursalChange = (sucursalId: number) => {
    const sucursal = sucursales.find(s => s.id === sucursalId);
    if (sucursal) {
      setSucursalSeleccionada(sucursal);
      setSucursalGuardada(sucursalId);
    }
  };

  const handleDepositoChange = (depositoId: number) => {
    const deposito = depositos.find(d => d.dep_codigo === depositoId);
    if (deposito) {
      setDepositoSeleccionado(deposito);
      setDepositoGuardado(depositoId);
    }
  };

  const handleListaPrecioChange = (listaPrecioId: number) => {
    const listaPrecio = listaPrecios.find(lp => lp.lp_codigo === listaPrecioId);
    if (listaPrecio) {
      setPrecioSeleccionado(listaPrecio);
      setListaPrecioGuardada(listaPrecioId);
    }
  };

  const handleMonedaChange = (monedaId: number) => {
    const moneda = monedas.find(m => m.mo_codigo === monedaId);
    if (moneda) {
      setMonedaSeleccionada(moneda);
      setMonedaGuardada(monedaId);
    }
  };

  const totales = useMemo(
    () => calcularTotalesPedido(detallePedido),
    [detallePedido]
  );

  const handleInsertarPedido = async () => {
    try{
      if(pedidoDTO.p_cliente === 0){
        toast({
          title: "Error",
          description: "Debe seleccionar un cliente",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if(pedidoDTO.p_vendedor === 0){
        toast({
          title: "Error",
          description: "Debe seleccionar un vendedor",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if(pedidoDTO.p_sucursal === 0){
        toast({
          title: "Error",
          description: "Debe seleccionar una sucursal",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if(pedidoDTO.p_deposito === 0){ 
        toast({
          title: "Error",
          description: "Debe seleccionar un depósito",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      } 
        await insertarPedido(pedidoDTO, detallePedido);
        cancelarPedido();
      setIsBottomSheetOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al insertar el pedido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const renderArticulos = () => {
    if (detallePedido.length === 0) {
      return (
        <div className="flex flex-col gap-2 w-full h-full justify-center items-center p-4">
          <ArchiveX className="w-10 h-10 text-gray-500" />
          <p className="text-gray-500 text-xl font-bold">No hay artículos en el pedido</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 w-full h-full p-2 overflow-y-auto">
        {detallePedido.map((item, index) => (
          <div
            key={index}
            className="flex flex-col bg-slate-50 rounded-lg shadow-xs border border-gray-200 p-3"
          >
            <div className="flex flex-row items-center justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-gray-600 text-xs truncate">{item.codigo}</p>
                <p className="font-medium text-sm text-gray-800 truncate">{item.descripcion}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right min-w-[60px]">
                  <p className="font-medium text-slate-500 text-sm">{item.dp_cantidad} x {formatCurrency(item.dp_precio)}</p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="font-medium text-sm">{formatCurrency(item.dp_precio * item.dp_cantidad)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 text-xs text-gray-500">
              <span>Desc: {formatCurrency(item.dp_descuento)}</span>
              <span>|</span>
              <span>Bonif: {item.dp_bonif === 1 ? "B" : "V"}</span>
              <span>|</span>
              <span>Exentas: {formatCurrency(item.dp_exentas)}</span>
              <span>|</span>
              <span>5%: {formatCurrency(item.dp_cinco)}</span>
              <span>|</span>
              <span>10%: {formatCurrency(item.dp_diez)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-slate-200 w-full h-screen p-1 gap-2">
      {/* Header */}
      <div className="flex flex-row bg-blue-500 rounded-md p-2 items-center justify-between">
        <div className="flex items-center">
          <ShoppingCartIcon className="w-6 h-6 text-white mr-2" />
          <p className="text-white font-bold text-lg">Formulario de Pedidos</p>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-white hover:bg-blue-600 rounded-md transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Contenedor principal con scroll */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-20">
        {/* Información básica del pedido */}
        <div className="flex flex-col gap-2 bg-white rounded-md p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha</label>
              <input
                type="date"
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={fechaPedido}
                onChange={(e) => setFechaPedido(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Operador</label>
              <input
                type="text"
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={user || ""}
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Cliente</label>
            <div className="flex gap-2">
              <input
                type="text"
                ref={clienteRef}
                className="rounded-md p-2 border border-gray-300 text-sm flex-1"
                placeholder="Buscar cliente..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                onKeyDown={handleClienteKeyDown}
              />
              <button
                onClick={() => setModalClientesOpen(true)}
                className="bg-blue-500 text-white px-3 rounded-md text-sm"
              >
                Buscar
              </button>
            </div>
            <input
              type="text"
              className="rounded-md p-2 border border-gray-300 text-sm bg-gray-50"
              value={
                clienteSeleccionadoInterno
                  ? clienteSeleccionadoInterno.cli_razon
                  : "No se ha seleccionado ningún cliente"
              }
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Vendedor</label>
            <div className="flex gap-2">
              <input
                type="number"
                ref={vendedorRef}
                className="rounded-md p-2 border border-gray-300 text-sm flex-1"
                placeholder="Código vendedor..."
                value={busquedaVendedor}
                onChange={(e) => setBusquedaVendedor(e.target.value)}
                onKeyDown={handleVendedorKeyDown}
              />
              <button
                onClick={handleBuscarVendedor}
                className="bg-blue-500 text-white px-3 rounded-md text-sm"
              >
                Buscar
              </button>
            </div>
            <input
              type="text"
              className="rounded-md p-2 border border-gray-300 text-sm bg-gray-50"
              value={
                vendedorSeleccionado
                  ? vendedorSeleccionado.op_nombre
                  : busquedaVendedor && !cargando
                  ? "Vendedor no encontrado"
                  : "No se ha seleccionado ningún vendedor"
              }
              readOnly
            />
          </div>
        </div>

        {/* Sección de artículos */}
        <div className="flex flex-col gap-2 bg-white rounded-md p-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">Artículo</label>
            <div className="flex gap-2">
              <input
                type="text"
                ref={articuloCodigoRef}
                className="rounded-md p-2 border border-gray-300 text-sm flex-1"
                placeholder="Código de barras..."
                value={codigoBarraArticulo}
                onChange={(e) => setCodigoBarraArticulo(e.target.value)}
                onKeyDown={handleArticuloKeyDown}
              />
              <button
                onClick={() => setModalArticulosOpen(true)}
                className="bg-blue-500 text-white px-3 rounded-md text-sm"
              >
                Buscar
              </button>
            </div>
            <input
              type="text"
              className="rounded-md p-2 border border-gray-300 text-sm bg-gray-50"
              value={articulo ? articulo.descripcion : "Descripción del artículo"}
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Cantidad</label>
              <input
                type="number"
                ref={cantidadRef}
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={cantidadArticulo}
                onChange={(e) => setCantidadArticulo(Number(e.target.value))}
                onKeyDown={handleCantidadKeyDown}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Precio</label>
              <input
                type="number"
                ref={precioRef}
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={precioArticulo}
                onChange={(e) => setPrecioArticulo(Number(e.target.value))}
                onKeyDown={handlePrecioKeyDown}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Bonificación</label>
              <input
                type="number"
                ref={bonificacionRef}
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={bonificacionArticulo}
                onChange={(e) => setBonificacionArticulo(Number(e.target.value))}
                onKeyDown={handleBonificacionKeyDown}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Descuento</label>
              <input
                type="number"
                ref={descuentoRef}
                className="rounded-md p-2 border border-gray-300 text-sm"
                value={descuentoArticulo}
                onChange={(e) => setDescuentoArticulo(Number(e.target.value))}
                onKeyDown={handleDescuentoKeyDown}
              />
            </div>
          </div>

          <button
            ref={agregarBtnRef}
            className="w-full bg-blue-500 text-white rounded-md p-3 flex flex-row gap-2 items-center justify-center"
            onClick={() => {
              if (articulo) {
                handleAgregarItem(
                  articulo,
                  cantidadArticulo,
                  precioArticulo,
                  descuentoArticulo,
                  bonificacionArticulo
                );
              }
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Agregar Artículo</span>
          </button>
        </div>

        {/* Lista de artículos */}
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden min-h-[300px]">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700">Artículos del Pedido ({detallePedido.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[250px]">
            {renderArticulos()}
          </div>
        </div>
      </div>

      {/* Botón para ver totales - Fixed en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-slate-200 border-t border-gray-300 z-40">
        <button
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => setIsBottomSheetOpen(true)}
        >
          <ArrowUp />
          Ver totales y configurar
        </button>
      </div>

      {/* Side Menu para configuración */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
          <div className="flex flex-col w-full h-full bg-white gap-4 p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Sucursal</label>
                <select 
                  className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                  value={sucursalSeleccionada?.id || ""}
                  onChange={(e) => handleSucursalChange(Number(e.target.value))}
                >
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Depósito</label>
                <select 
                  className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                  value={depositoSeleccionado?.dep_codigo || ""}
                  onChange={(e) => handleDepositoChange(Number(e.target.value))}
                >
                  {depositos.map((deposito) => (
                    <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
                      {deposito.dep_descripcion}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Lista de Precios</label>
                <select 
                  className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                  value={precioSeleccionado?.lp_codigo || ""}
                  onChange={(e) => handleListaPrecioChange(Number(e.target.value))}
                >
                  {listaPrecios.map((listaPrecio) => (
                    <option key={listaPrecio.lp_codigo} value={listaPrecio.lp_codigo}>
                      {listaPrecio.lp_descripcion}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Moneda</label>
                <select 
                  className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                  value={monedaSeleccionada?.mo_codigo || ""}
                  onChange={(e) => handleMonedaChange(Number(e.target.value))}
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                      {moneda.mo_descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Entrega</label>
                <input
                  type="number"
                  className="bg-gray-100 rounded-md p-2 border border-gray-300"
                  value={pedidoDTO.p_entrega}
                  onChange={(e) =>
                    setPedidoDTO({
                      ...pedidoDTO,
                      p_entrega: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Cant. Cuotas</label>
                <input
                  type="number"
                  className="bg-gray-100 rounded-md p-2 border border-gray-300"
                  value={pedidoDTO.p_cantcuotas}
                  onChange={(e) =>
                    setPedidoDTO({
                      ...pedidoDTO,
                      p_cantcuotas: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Condición</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pedidoDTO.p_credito === 0}
                      onChange={(e) =>
                        setPedidoDTO({
                          ...pedidoDTO,
                          p_credito: e.target.checked ? 0 : 1,
                        })
                      }
                    />
                    <span>Contado</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pedidoDTO.p_credito === 1}
                      onChange={(e) =>
                        setPedidoDTO({
                          ...pedidoDTO,
                          p_credito: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <span>Crédito</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Zona</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="zona"
                      checked={pedidoDTO.p_zona === 0}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 0 })}
                    />
                    <span className="text-red-500">Show Room</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="zona"
                      checked={pedidoDTO.p_zona === 1}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 1 })}
                    />
                    <span className="text-green-700">Encomienda</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="zona"
                      checked={pedidoDTO.p_zona === 2}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 2 })}
                    />
                    <span className="text-blue-700">N. Regional</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Tipo</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipo"
                      checked={pedidoDTO.p_tipo === 0}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 0 })}
                    />
                    <span>Vendedor</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipo"
                      checked={pedidoDTO.p_tipo === 1}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 1 })}
                    />
                    <span>Teléfono</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipo"
                      checked={pedidoDTO.p_tipo === 2}
                      onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 2 })}
                    />
                    <span>Facebook</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-500 font-bold">Observaciones</label>
                <textarea
                  className="bg-gray-100 rounded-md p-2 border border-gray-300 h-20"
                  value={pedidoDTO.p_obs}
                  onChange={(e) =>
                    setPedidoDTO({
                      ...pedidoDTO,
                      p_obs: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet para totales y finalización */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isBottomSheetOpen ? 'block' : 'hidden'}`}>
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80%] overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Totales y Finalización</h2>
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Exentas:</span>
                  <span className="font-medium">{totales.totalExentas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total 5%:</span>
                  <span className="font-medium">{totales.totalCinco}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total 10%:</span>
                  <span className="font-medium">{totales.totalDiez}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Factura:</span>
                  <span className="font-medium">{totales.total}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total a pagar:</span>
                  <span className="text-lg font-bold text-blue-600">{totales.totalAPagar}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Artículos:</span>
                <span>{detallePedido.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                onClick={handleInsertarPedido}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Guardar Pedido
                </div>
              </button>

              <button
                className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors font-medium"
                onClick={() => {
                  cancelarPedido();
                  setIsBottomSheetOpen(false);
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  Cancelar Pedido
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <BuscadorClientesMobile
        isOpen={modalClientesOpen}
        setIsOpen={setModalClientesOpen}
        onSelect={(cliente: Cliente) => {
          setClienteSeleccionadoInterno(cliente);
          setBusquedaCliente(cliente.cli_interno.toString());
          setPedidoDTO(prev => ({
            ...prev,
            p_cliente: cliente.cli_codigo
          }));
          vendedorRef.current?.focus();
        }}
      />
      <ArticulosComponentMobile
        isOpen={modalArticulosOpen}
        setIsOpen={setModalArticulosOpen}
        onSelect={(articulo) => {
          setArticulo(articulo);
          setCodigoBarraArticulo(articulo.ar_codbarra);
          cantidadRef.current?.focus();
          setPrecioArticulo(articulo.precio_venta_guaranies);
          setDescuentoArticulo(0);
          setBonificacionArticulo(0);
          setCantidadArticulo(1);
        }}
        depositoInicial={depositoSeleccionado?.dep_codigo}
      />
    </div>
  );
};

export default FormularioPedidosMobile;
