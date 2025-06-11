import { useDepositosStore } from "@/stores/depositosStore";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useOperadoresStore } from "@/stores/operadoresStore";

import { useEffect, useMemo, useRef, useState } from "react";
import { getArticulosPorCodBarra } from "@/shared/ui/articulos/services/articuloPorCodBarraService";
import { useMonedasStore } from "@/stores/monedasStore";
import { PedidoDTO, DetallePedidoTabla } from "./types/shared.type";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import {
  Cliente,
  Deposito,
  Sucursal,
} from "@/shared/types/shared_interfaces";
import { useToast } from "@chakra-ui/react";
import { agregarItemPedido } from "./services/pedidoServices";
import { calcularTotalesPedido } from "./utils/calcularTotales";
import { ShoppingCartIcon, Check, X, Plus } from "lucide-react";
import { useClientesStore } from "@/stores/clientesStore";
import BuscadorClientes from "@/shared/ui/clientes/BuscadorClientes";
import { ArticulosComponent } from "@/shared/ui/articulos/ArticulosComponent";
import { formatCurrency } from "./utils/formatCurrency";
import { usePedidos } from "./hooks/usePedidos";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";
import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";
import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";

const FormularioPedidos = () => {
  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();
  const { vendedorSeleccionado, getOperadorPorCodInterno } =
    useOperadoresStore();
  const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();
  const { monedas, fetchMonedas } = useMonedasStore();
  const { clienteSeleccionado, cargarClientesPorId } = useClientesStore();
  const [clienteSeleccionadoInterno, setClienteSeleccionadoInterno] =
    useState<Cliente>();
  const [precioSeleccionado, setPrecioSeleccionado] = useState<ListaPrecio>();
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
    p_estado: 0,
    p_vendedor: 0,
    p_area: 1,
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

  const [articulo, setArticulo] = useState<ArticuloBusqueda>();

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

  const [codigoBarraArticulo, setCodigoBarraArticulo] = useState("");

  const toast = useToast();

  const { insertarPedido } = usePedidos();

  const handleBusquedaPorCodigoBarra = async (busqueda: string) => {
    if (depositoSeleccionado?.dep_codigo && monedaSeleccionada?.moCodigo) {
      const articulo = await getArticulosPorCodBarra(
        busqueda,
        depositoSeleccionado?.dep_codigo,
        0,
        monedaSeleccionada?.moCodigo
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
    articulo: ArticuloBusqueda,
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
      setPrecioSeleccionado(listaPrecios[0]);
      setPedidoDTO(prev => ({
        ...prev,
        p_lista_precio: listaPrecios[0]?.lpCodigo || 0
      }));
    }
    if (depositos.length > 0 && !depositoSeleccionado) {
      setDepositoSeleccionado(depositos[0]);
      setPedidoDTO(prev => ({
        ...prev,
        p_deposito: depositos[0].dep_codigo
      }));
    }
    if (sucursales.length > 0 && !sucursalSeleccionada) {
      setSucursalSeleccionada(sucursales[0]);
      setPedidoDTO(prev => ({
        ...prev,
        p_sucursal: sucursales[0].id
      }));
    }
    if (monedas.length > 0 && !monedaSeleccionada) {
      setMonedaSeleccionada(monedas[0]);
      setPedidoDTO(prev => ({
        ...prev,
        p_moneda: monedas[0].moCodigo
      }));
    }
  }, [listaPrecios, depositos, sucursales, monedas]);

  const totales = useMemo(
    () => calcularTotalesPedido(detallePedido),
    [detallePedido]
  );

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
        p_moneda: monedaSeleccionada.moCodigo,
      }));
    }
    if (precioSeleccionado) {
      setPedidoDTO((prev) => ({
        ...prev,
        p_lista_precio: precioSeleccionado.lpCodigo,
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

  const handleVendedorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !vendedorSeleccionado && busquedaVendedor) {
      getOperadorPorCodInterno(Number(busquedaVendedor));
      articuloCodigoRef.current?.focus();
    } else if (e.key === "Enter" && vendedorSeleccionado) {
      articuloCodigoRef.current?.focus();
    }
  };

  const handleArticuloKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" && (!codigoBarraArticulo || codigoBarraArticulo.trim() === "")
    ) {
      setModalArticulosOpen(true);
    } else if (e.key === "Enter" && codigoBarraArticulo.length > 0) {
      handleBusquedaPorCodigoBarra(codigoBarraArticulo);
      cantidadRef.current?.focus();
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

  const cancelarPedido = () => {
    window.location.reload();
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

  return (
    <div className="flex h-screen w-full bg-gray-100 flex-col gap-2 p-2">
      <div className="flex flex-row p-2 rounded-sm bg-blue-500">
        <ShoppingCartIcon className="w-8 h-8 text-white mr-2" />
        <p className="text-white font-bold text-2xl ">Formulario de Pedidos</p>
      </div>
      <div className="flex flex-row rounded-sm bg-blue-300 shadow-xs p-2 gap-2">
        <div className="flex flex-col ">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="fechaPedido" className="text-sm font-bold">
              Fecha:
            </label>
            <input
              type="date"
              id="fechaPedido"
              className="rounded-md p-1 border-2 border-gray-300"
              value={fechaPedido}
              onChange={(e) => setFechaPedido(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="fechaPedido" className="text-sm font-bold">
              Operador:
            </label>
            <input
              type="text"
              id="operador"
              className="rounded-md p-1 border-2 border-gray-300"
              value={user || ""}
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="sucursal" className="text-sm font-bold">
              Sucursal:
            </label>
            <select
              name="sucursal"
              id="sucursal"
              className="rounded-md p-1 border-2 border-gray-300"
              onChange={(e) => {
                setSucursalSeleccionada(
                  sucursales.find(
                    (sucursal) => sucursal.id === Number(e.target.value)
                  )
                );
              }}
              value={sucursalSeleccionada?.descripcion}
            >
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.descripcion}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="deposito" className="text-sm font-bold">
              Depósito:
            </label>
            <select
              name="deposito"
              id="deposito"
              className="rounded-md p-1 border-2 border-gray-300"
              onChange={(e) =>
                setDepositoSeleccionado(
                  depositos.find(
                    (deposito) => deposito.dep_codigo === Number(e.target.value)
                  )
                )
              }
              value={depositoSeleccionado?.dep_descripcion}
            >
              {depositos.map((deposito) => (
                <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
                  {deposito.dep_descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="cliente" className="text-sm font-bold">
              Cliente:
            </label>
            <input
              type="text"
              name="busquedaCliente"
              id="busquedaCliente"
              ref={clienteRef}
              className="rounded-md p-1 border-2 border-gray-300 w-1/4 focus:outline-none"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              onKeyDown={handleClienteKeyDown}
            />
            <input
              type="text"
              value={
                clienteSeleccionadoInterno
                  ? clienteSeleccionadoInterno.cli_razon
                  : "No se ha seleccionado ningun cliente"
              }
              className="rounded-md p-1 border-2 border-gray-300 w-full focus:outline-none"
              readOnly
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="vendedor" className="text-sm font-bold">
              Vendedor:
            </label>
            <input
              type="number"
              name="busquedaVendedor"
              id="busquedaVendedor"
              ref={vendedorRef}
              className="rounded-md p-1 border-2 border-gray-300 w-1/4 focus:outline-none"
              value={busquedaVendedor}
              onChange={(e) => setBusquedaVendedor(e.target.value)}
              onKeyDown={handleVendedorKeyDown}
            />
            <input
              type="text"
              value={
                vendedorSeleccionado
                  ? vendedorSeleccionado.op_nombre
                  : "No se ha seleccionado ningun vendedor"
              }
              className="rounded-md p-1 border-2 border-gray-300 w-full focus:outline-none"
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="listaPrecio" className="text-sm font-bold">
              Lista de Precios:
            </label>
            <select
              name="listaPrecio"
              id="listaPrecio"
              className="rounded-md p-1 border-2 border-gray-300"
              value={precioSeleccionado?.lpCodigo}
              onChange={(e) =>
                setPrecioSeleccionado(
                  listaPrecios.find(
                    (listaPrecio) =>
                      listaPrecio.lpCodigo === Number(e.target.value)
                  )
                )
              }
            >
              {listaPrecios.map((listaPrecio) => (
                <option
                  key={listaPrecio.lpCodigo}
                  value={listaPrecio.lpCodigo}
                >
                  {listaPrecio.lpDescripcion}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="moneda" className="text-sm font-bold">
              Moneda:
            </label>
            <select
              name="moneda"
              id="moneda"
              className="rounded-md p-1 border-2 border-gray-300"
              value={monedaSeleccionada?.moCodigo}
              onChange={(e) =>
                setMonedaSeleccionada(
                  monedas.find(
                    (moneda) => moneda.moCodigo === Number(e.target.value)
                  )
                )
              }
            >
              {monedas.map((moneda) => (
                <option key={moneda.moCodigo} value={moneda.moCodigo}>
                  {moneda.moDescripcion}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="entrega" className="text-sm font-bold">
              Entrega:
            </label>
            <input
              type="number"
              name="entrega"
              id="entrega"
              className="rounded-md p-1 border-2 border-gray-300"
              value={pedidoDTO.p_entrega}
              onChange={(e) =>
                setPedidoDTO({
                  ...pedidoDTO,
                  p_entrega: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="cantCuotas" className="text-sm font-bold">
              Cant. Cuotas:
            </label>
            <input
              type="number"
              name="cantCuotas"
              id="cantCuotas"
              className="rounded-md p-1 border-2 border-gray-300"
              value={pedidoDTO.p_cantcuotas}
              onChange={(e) =>
                setPedidoDTO({
                  ...pedidoDTO,
                  p_cantcuotas: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col  items-center bg-orange-300 border border-orange-500 rounded-md p-2">
            <label htmlFor="condicion" className="text-sm font-bold">
              Condición:
            </label>
            <div className="flex flex-row gap-2">
              <input
                type="checkbox"
                name="contado_input"
                id="contado_input"
                value={pedidoDTO.p_credito === 0 ? 1 : 0}
                onChange={(e) =>
                  setPedidoDTO({
                    ...pedidoDTO,
                    p_credito: e.target.checked ? 0 : 1,
                  })
                }
                checked={pedidoDTO.p_credito === 0}
              />
              <label htmlFor="contado_input" className="text-sm font-bold">
                Contado
              </label>
            </div>
            <div className="flex flex-row gap-2 justify-start">
              <input
                type="checkbox"
                name="credito_input"
                id="credito_input"
                value={pedidoDTO.p_credito === 1 ? 1 : 0}
                onChange={(e) =>
                  setPedidoDTO({
                    ...pedidoDTO,
                    p_credito: e.target.checked ? 1 : 0,
                  })
                }
                checked={pedidoDTO.p_credito === 1}
              />
              <label htmlFor="credito_input" className="text-sm font-bold">
                Crédito
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2">
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="zona_pedido"
              id="zona_showroom"
              value={0}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 0 })}
              checked={pedidoDTO.p_zona === 0}
            />
            <label htmlFor="zona_showroom" className="font-bold text-red-500">
              Show Room
            </label>
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="zona_pedido"
              id="zona_encomienda"
              value={1}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 1 })}
              checked={pedidoDTO.p_zona === 1}
            />
            <label
              htmlFor="zona_encomienda"
              className="font-bold text-green-700"
            >
              Encomienda
            </label>
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="zona_pedido"
              id="zona_regional"
              value={2}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_zona: 2 })}
              checked={pedidoDTO.p_zona === 2}
            />
            <label htmlFor="zona_regional" className="font-bold text-blue-700">
              N. Regional
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2">
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="tipo_pedido"
              id="tipo_vendedor"
              value={0}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 0 })}
              checked={pedidoDTO.p_tipo === 0}
            />
            <label htmlFor="tipo_vendedor" className="font-bold">
              Vendedor
            </label>
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="tipo_pedido"
              id="tipo_telefono"
              value={1}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 1 })}
              checked={pedidoDTO.p_tipo === 1}
            />
            <label htmlFor="tipo_telefono" className="font-bold">
              Teléfono
            </label>
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              name="tipo_pedido"
              id="tipo_facebook"
              value={2}
              onChange={() => setPedidoDTO({ ...pedidoDTO, p_tipo: 2 })}
              checked={pedidoDTO.p_tipo === 2}
            />
            <label htmlFor="tipo_facebook" className="font-bold">
              Facebook
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 flex-1 bg-white">
          <label htmlFor="observaciones" className="text-sm font-bold">
            Observaciones:
          </label>
          <textarea
            name="observaciones"
            id="observaciones"
            className="rounded-md p-1 border-2 border-gray-300"
            value={pedidoDTO.p_obs}
            onChange={(e) =>
              setPedidoDTO({
                ...pedidoDTO,
                p_obs: e.target.value,
              })
            }
          ></textarea>
        </div>
      </div>
      <div className="flex flex-row gap-2 bg-gray-300 p-2 rounded-md items-end">
        <div className="flex flex-col items-start w-32">
          <label htmlFor="codigoBarra" className="text-xs font-bold mb-1">Código de Barras:</label>
          <input
            type="text"
            id="codigoBarra"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            ref={articuloCodigoRef}
            placeholder="Codigo de barras:"
            onKeyDown={handleArticuloKeyDown}
            value={codigoBarraArticulo}
            onChange={(e) => setCodigoBarraArticulo(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start w-64 flex-1">
          <label htmlFor="descripcionArticulo" className="text-xs font-bold mb-1">Descripción:</label>
          <input
            type="text"
            id="descripcionArticulo"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            readOnly
            placeholder="Descripcion del articulo:"
            value={articulo ? articulo.descripcion : "Descripcion del articulo"}
          />
        </div>
        <div className="flex flex-col items-start w-20">
          <label htmlFor="cantidad" className="text-xs font-bold mb-1">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            placeholder="Cdad:"
            value={cantidadArticulo}
            onChange={(e) => setCantidadArticulo(Number(e.target.value))}
            ref={cantidadRef}
            onKeyDown={handleCantidadKeyDown}
          />
        </div>
        <div className="flex flex-col items-start w-24">
          <label htmlFor="bonificacion" className="text-xs font-bold mb-1">Venta/Bonif:</label>
          <input
            type="number"
            id="bonificacion"
            name="bonificacion"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            placeholder="V/B:"
            value={bonificacionArticulo}
            onChange={(e) => setBonificacionArticulo(Number(e.target.value))}
            ref={bonificacionRef}
            onKeyDown={handleBonificacionKeyDown}
          />
        </div>
        <div className="flex flex-col items-start w-24">
          <label htmlFor="descuento" className="text-xs font-bold mb-1">Descuento:</label>
          <input
            type="number"
            name="descuento"
            id="descuento"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            placeholder="Descuento:"
            value={descuentoArticulo}
            onChange={(e) => setDescuentoArticulo(Number(e.target.value))}
            ref={descuentoRef}
            onKeyDown={handleDescuentoKeyDown}
          />
        </div>
        <div className="flex flex-col items-start w-24">
          <label htmlFor="precio" className="text-xs font-bold mb-1">Precio:</label>
          <input
            type="number"
            name="precio"
            id="precio"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            placeholder="Precio:"
            value={articulo ? formatCurrency(articulo.precioVentaGuaranies): 0}
            onChange={(e) => setPrecioArticulo(Number(e.target.value))}
            ref={precioRef}
            onKeyDown={handlePrecioKeyDown}
          />
        </div>
        <div className="flex flex-col items-start w-20">
          <label htmlFor="lote" className="text-xs font-bold mb-1">Lote:</label>
          <input
            type="text"
            name="lote"
            id="lote"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            readOnly
            placeholder="Lote:"
            value={articulo ? articulo.lote : "Lote"}
          />
        </div>
        <div className="flex flex-col items-start w-24">
          <label htmlFor="exentas" className="text-xs font-bold mb-1">Exentas:</label>
          <input
            type="number"
            name="exentas"
            id="exentas"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            readOnly
            placeholder="Exentas:"
            value={
              articulo
                ? articulo.iva === 0
                  ? formatCurrency(articulo.precioVentaGuaranies)
                  : 0
                : "Exenta"
            }
          />
        </div>
        <div className="flex flex-col items-start w-16">
          <label htmlFor="impuesto5" className="text-xs font-bold mb-1">5%:</label>
          <input
            type="number"
            name="impuesto5"
            id="impuesto5"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            readOnly
            placeholder="5%:"
            value={
              articulo
                ? articulo.iva === 2
                  ? formatCurrency(articulo.precioVentaGuaranies)
                  : 0
                : "5%"
            }
          />
        </div>
        <div className="flex flex-col items-start w-16">
          <label htmlFor="impuesto10" className="text-xs font-bold mb-1">10%:</label>
          <input
            type="number"
            name="impuesto10"
            id="impuesto10"
            className="rounded-md p-1 border-2 border-gray-300 w-full"
            readOnly
            placeholder="10%:"
            value={
              articulo
                ? articulo.iva === 1
                  ? formatCurrency(articulo.precioVentaGuaranies)
                  : 0
                : "10%"
            }
          />
        </div>
        <div className="flex flex-col items-end justify-end w-12">
          <label className="invisible select-none">Agregar</label>
          <button
            ref={agregarBtnRef}
            className="bg-blue-500 text-white rounded-md p-2 flex flex-row gap-2 items-center w-full justify-center"
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
            <Plus />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-slate-300 p-2 rounded-md overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-blue-500 text-white rounded-md sticky top-0">
              <tr className="text-md font-bold text-left [&>th]:p-2 [&>th]:border-2 [&>th]:border-white">
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Bonif.</th>
                <th>Precio Unit.</th>
                <th>Descuento</th>
                <th>Exentas</th>
                <th>5%</th>
                <th>10%</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {detallePedido.length > 0 ? (
                detallePedido.map((detalle) => {
                  return (
                    <tr className="text-md font-bold text-left [&>td]:p-2 [&>td]:border-2 [&>td]:border-gray-300">
                      <td>{detalle.codigo}</td>
                      <td>{detalle.descripcion}</td>
                      <td>{detalle.dp_cantidad}</td>
                      <td>{detalle.dp_bonif === 1 ? "B" : "V"}</td>
                      <td>{formatCurrency(detalle.dp_precio)}</td>
                      <td>{formatCurrency(detalle.dp_descuento)}</td>
                      <td>{formatCurrency(detalle.dp_exentas)}</td>
                      <td>{formatCurrency(detalle.dp_cinco)}</td>
                      <td>{formatCurrency(detalle.dp_diez)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center font-bold h-full">
                    No hay articulos en el pedido
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-row gap-2 p-2 bg-blue-300 rounded-md ">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="total_exentas" className="text-md font-bold">
                Total Exentas:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalExentas}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="total_exentas" className="text-md font-bold">
                Total 5%:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalCinco}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="total_exentas" className="text-md font-bold">
                Total 10%:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalDiez}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2 my-6">
            <button className="bg-blue-500 text-white rounded-md p-2 flex flex-row gap-2 items-center"
              onClick={() => {
                insertarPedido(pedidoDTO, detallePedido);
                cancelarPedido();
              }}
            >
              <Check />
              <p className="text-md font-bold">Guardar Pedido</p>
            </button>
            <button className="bg-red-500 text-white rounded-md p-2 flex flex-row gap-2 items-center"
              onClick={() => {
                cancelarPedido();
              }}
            >
              <X />
              <p className="text-sm font-bold">Cancelar</p>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="total_factura" className="text-md font-bold">
                Total Factura:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.total}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="total_factura" className="text-md font-bold">
                Total Descuento por Factura:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalDescuentos}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="total_factura" className="text-md font-bold">
                Total Descuento por Items:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalDescuentos}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="total_factura" className="text-md font-bold">
                Total a pagar:
              </label>
              <input
                type="text"
                readOnly
                className="rounded-md p-1 border-2 border-gray-300 text-right text-2xl font-bold"
                value={totales.totalAPagar}
              />
            </div>
          </div>
        </div>
      </div>
      <BuscadorClientes
        isOpen={modalClientesOpen}
        setIsOpen={setModalClientesOpen}
        onSelect={(cliente) => {
          setClienteSeleccionadoInterno(cliente);
          setBusquedaCliente(cliente.cli_interno.toString());
          setPedidoDTO(prev => ({
            ...prev,
            p_cliente: cliente.cli_codigo
          }));
          vendedorRef.current?.focus();
        }}
      />
      <ArticulosComponent
        isOpen={modalArticulosOpen}
        setIsOpen={setModalArticulosOpen}
        onSelect={(articulo) => {
          setArticulo(articulo);
          setCodigoBarraArticulo(articulo.ar_codbarra);
          cantidadRef.current?.focus();
          setDescuentoArticulo(0);
          setBonificacionArticulo(0);
          setCantidadArticulo(1);
        }}
      />
    </div>
  );
};

export default FormularioPedidos;
