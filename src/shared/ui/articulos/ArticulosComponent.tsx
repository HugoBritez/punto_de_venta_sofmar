import { useEffect, useState, useRef } from "react";
import { useBuscadorArticulos } from "./hooks/useBuscadorArticulos";
import { BusquedaDTO } from "./types/busquedaDTO.type";
import Modal from "../modal/Modal";
import DepositosSelect from "../select/DepositosSelect";
import SucursalesSelect from "../select/SucursalesSelect";
import useVerArticulosEnPedido from "./hooks/useVerArticulosEnPedido";
import NotFound from "@/assets/not-found/not-found.png";
import { Spinner, useToast } from "@chakra-ui/react";
import { useListasDePrecios } from "./hooks/useListasDePrecio";
import { formatCurrency } from "./utils/formatCurrency";
import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";

interface ArticulosComponentProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect?: (articulo: any) => void;
}

export const ArticulosComponent = ({
  isOpen,
  setIsOpen,
  onSelect,
}: ArticulosComponentProps) => {
  const [busquedaDTO, setBusquedaDTO] = useState<BusquedaDTO>({
    busqueda: "",
    id_articulo: undefined,
    codigo_barra: undefined,
    deposito: undefined,
    stock: false,
    moneda: undefined,
    marca: undefined,
    categoria: undefined,
    ubicacion: undefined,
    proveedor: undefined,
    cod_interno: undefined,
    articulo: 1,
    lote: undefined,
    negativo: false,
  });

  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticuloBusqueda | null>(null);

  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string | null>(
    "articulo"
  );

  const { listaPrecios, obtenerListaPrecios } = useListasDePrecios();

  const toast = useToast();

  const {
    setTermino,
    resultados: resultadosBusqueda,
    cargando: cargandoBusqueda,
    error: errorBusqueda,
  } = useBuscadorArticulos(busquedaDTO);
  const {
    articulosEnPedido,
    cargando: cargandoPedido,
    error: errorPedido,
  } = useVerArticulosEnPedido(
    articuloSeleccionado?.idArticulo || 0,
    articuloSeleccionado?.idLote || 0
  );

  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1);
  const inputBusquedaRef = useRef<HTMLInputElement>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Agregar este useEffect para el autofocus
  useEffect(() => {
    if (isOpen && inputBusquedaRef.current) {
      inputBusquedaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(()=> {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key ===  "Escape") {
        event.preventDefault();
        limpiarFiltros();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, setIsOpen]);

  // Agregar el manejador de teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (resultadosBusqueda.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndiceSeleccionado((prev) =>
          prev < resultadosBusqueda.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndiceSeleccionado((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (indiceSeleccionado >= 0) {
          if (articuloSeleccionado) {
            // Si ya hay un artículo seleccionado, confirmar la selección
            handleSeleccionarArticulo();
          } else {
            // Seleccionar el artículo
            handleArticuloSeleccionado(resultadosBusqueda[indiceSeleccionado]);
          }
        }
        break;
    }
  };

  // Maneja cambios en el campo de búsqueda
  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTermino(valor);
    setBusquedaDTO((prev) => ({
      ...prev,
      busqueda: valor,
    }));
  };

  // Maneja cambios en los checkboxes de filtros
  const handleFiltroChange = (filtro: string) => {
    // Si se hace clic en el mismo filtro, lo deseleccionamos
    if (filtroSeleccionado === filtro) {
      setFiltroSeleccionado(null);
      setBusquedaDTO((prev) => ({
        ...prev,
        categoria: undefined,
        marca: undefined,
        ubicacion: undefined,
        proveedor: undefined,
        cod_interno: undefined,
        lote: undefined,
      }));
    } else {
      setFiltroSeleccionado(filtro);
      setBusquedaDTO((prev) => ({
        ...prev,
        categoria: filtro === "categoria" ? 1 : undefined,
        marca: filtro === "marca" ? 1 : undefined,
        ubicacion: filtro === "ubicacion" ? 1 : undefined,
        proveedor: filtro === "proveedor" ? 1 : undefined,
        cod_interno: filtro === "cod_interno" ? 1 : undefined,
        lote: filtro === "lote" ? 1 : undefined,
      }));
    }
  };

  const handleDepositoChange = (depositoId: number | null) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      deposito: depositoId ?? undefined, // Convertimos null a undefined
    }));
  };

  const handleSucursalChange = (sucursalId: number | null) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      sucursal: sucursalId ?? undefined, // Convertimos null a undefined
    }));
  };

  useEffect(() => {
    if (listaPrecios.length === 0) {
      obtenerListaPrecios();
    }
    // Simular un click en el primer depósito y sucursal
    const seleccionarPrimerosValores = async () => {
      try {
        const primerDeposito = 1;
        const primeraSucursal = 1;

        handleDepositoChange(primerDeposito);
        handleSucursalChange(primeraSucursal);
        setTermino("abs");
      } catch (error) {
        console.error("Error al seleccionar valores iniciales:", error);
      }
    };

    if (isOpen) {
      seleccionarPrimerosValores();
    }
  }, [isOpen]);

  const handleArticuloSeleccionado = (
    articulo: ArticuloBusqueda,
    event?: React.MouseEvent
  ) => {
    // Prevenir el comportamiento predeterminado si hay un evento
    event?.preventDefault();
    console.log("Artículo seleccionado:", articulo);
    setArticuloSeleccionado(articulo);
  };

  const limpiarFiltros = () => {
    setFiltroSeleccionado("articulo");
    setBusquedaDTO((prev) => ({
      ...prev,
      categoria: undefined,
      marca: undefined,
      ubicacion: undefined,
      proveedor: undefined,
      cod_interno: undefined,
      lote: undefined,
      busqueda: "",
      id_articulo: undefined,
      codigo_barra: undefined,
      deposito: undefined,
      stock: false,
      moneda: undefined,
      articulo: 1,
    }));
    setArticuloSeleccionado(null);
  };

  const TablaArticulos = () => {
    return (
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-white uppercase bg-blue-600">
            <tr>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Código Int.
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Cód. de Barras
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Descripción
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Stock Lote
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                P. {listaPrecios[0].lpDescripcion ?? "Contado"}
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                P. {listaPrecios[1].lpDescripcion ?? "Crédito"}
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                P. {listaPrecios[2].lpDescripcion ?? "Mostrador"}
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">Serie</th>
              <th className="px-4 py-3 border-r-2 border-blue-700">Lote</th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Vencimiento
              </th>
              <th className="px-4 py-3 border-r-2 border-blue-700">
                Nro. Registro
              </th>
              <th className="px-4 py-3">ID Lote</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-gray-300">
            {resultadosBusqueda.map((resultado, index) => (
              <tr
                key={resultado.idLote}
                ref={index === indiceSeleccionado ? selectedRowRef : null}
                onClick={(e) => handleArticuloSeleccionado(resultado, e)}
                className={`hover:bg-blue-100 cursor-pointer transition-colors ${
                  articuloSeleccionado?.idLote === resultado.idLote
                    ? "bg-blue-200"
                    : indiceSeleccionado === index
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.idArticulo}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.codigoBarra}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.descripcion}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.cantidadLote}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {formatCurrency(resultado.precioVentaGuaranies)}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {formatCurrency(resultado.precioCredito)}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {formatCurrency(resultado.precioMostrador)}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.lote}
                </td>
                <td
                  className={`px-4 py-2 font-medium border-r-2 border-gray-200 ${
                    resultado.estadoVencimiento === "VENCIDO"
                      ? "bg-red-300"
                      : resultado.estadoVencimiento === "PROXIMO"
                      ? "bg-yellow-300"
                      : resultado.preCompra === 1
                      ? "bg-cyan-300"
                      : "bg-white"
                  }`}
                >
                  {resultado.lote}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.vencimientoLote}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {resultado.idArticulo}
                </td>
                <td className="px-4 py-2 font-medium">{resultado.idLote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const ErrorTablaArticulos = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-4 bg-white rounded-md border-2 border-red-200">
        <p className="text-xl font-bold text-red-600">
          No se encontraron artículos
        </p>
        <p className="text-gray-600">Intenta con otros criterios de búsqueda</p>
      </div>
    );
  };

  const CargandoTablaArticulos = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-4 bg-white rounded-md border-2 border-blue-200">
        <div className="animate-spin text-4xl">
          <Spinner />
        </div>
        <p className="text-xl font-bold text-blue-600">Cargando artículos...</p>
        <p className="text-gray-600">Por favor espere un momento</p>
      </div>
    );
  };

  const ErrorTablaArticulosEnPedido = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-4 bg-white rounded-md border-2 border-red-200">
        <p className="text-xl font-bold text-red-600">
          Error al obtener artículos en pedido
        </p>
        <p className="text-gray-600">Intente nuevamente más tarde</p>
      </div>
    );
  };

  const CargandoTablaArticulosEnPedido = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-4 bg-white rounded-md border-2 border-blue-200">
        <div className="animate-spin text-4xl">🔄</div>
        <p className="text-xl font-bold text-blue-600">Cargando pedidos...</p>
        <p className="text-gray-600">Por favor espere un momento</p>
      </div>
    );
  };

  const TablaArticulosEnPedido = () => {
    // Si no hay artículo seleccionado
    if (!articuloSeleccionado) {
      return (
        <div className="overflow-x-auto rounded-lg shadow-md overflow-y-auto max-h-[80%]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-white uppercase bg-blue-600">
              <tr>
                <th className="px-4 py-3 border-r-2 border-blue-700">Fecha</th>
                <th className="px-4 py-3 border-r-2 border-blue-700">
                  Cliente
                </th>
                <th className="px-4 py-3">Cantidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-300">
              <tr>
                <td
                  className="px-4 py-2 font-medium border-r-2 border-gray-200 text-center"
                  colSpan={3}
                >
                  Seleccione un artículo para ver sus pedidos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Si está cargando
    if (cargandoPedido) {
      return <CargandoTablaArticulosEnPedido />;
    }

    // Si hay error
    if (errorPedido) {
      return <ErrorTablaArticulosEnPedido />;
    }

    // Asegurarnos de que articulosEnPedido sea un array
    const pedidos = Array.isArray(articulosEnPedido) ? articulosEnPedido : [];

    // Si no hay pedidos
    if (pedidos.length === 0) {
      return (
        <div className="overflow-x-auto rounded-lg shadow-md overflow-y-auto max-h-[80%]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-white uppercase bg-blue-600">
              <tr>
                <th className="px-4 py-3 border-r-2 border-blue-700">Fecha</th>
                <th className="px-4 py-3 border-r-2 border-blue-700">
                  Cliente
                </th>
                <th className="px-4 py-3">Cantidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-300">
              <tr>
                <td
                  className="px-4 py-2 font-medium border-r-2 border-gray-200 text-center"
                  colSpan={3}
                >
                  No hay pedidos para este artículo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Si tenemos pedidos, mostrar la tabla
    return (
      <div className="overflow-x-auto rounded-lg shadow-md overflow-y-auto max-h-[80%]">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-white uppercase bg-blue-600">
            <tr>
              <th className="px-4 py-3 border-r-2 border-blue-700">Fecha</th>
              <th className="px-4 py-3 border-r-2 border-blue-700">Cliente</th>
              <th className="px-4 py-3">Cantidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-gray-300">
            {pedidos.map((articulo) => (
              <tr
                key={articulo.idDetallePedido}
                className="hover:bg-purple-50 transition-colors"
              >
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {articulo.fecha}
                </td>
                <td className="px-4 py-2 font-medium border-r-2 border-gray-200">
                  {articulo.cliente}
                </td>
                <td className="px-4 py-2 font-medium">{articulo.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSeleccionarArticulo = () => {
    if (articuloSeleccionado) {
      if (
        articuloSeleccionado.cantidadLote < 0 &&
        articuloSeleccionado.vencimientoValidacion === 0
      ) {
        toast({
          title:
            "No se puede seleccionar un articulo con stock negativo o cero.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setIsOpen(false);
        onSelect?.(articuloSeleccionado);
        limpiarFiltros();
      }
    } else {
      toast({
        title: "No se ha seleccionado ningun articulo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (articuloSeleccionado) {
      console.log("Artículo seleccionado actualizado:", articuloSeleccionado);
    }
  }, [articuloSeleccionado]);

  // Agregar este useEffect para resetear el índice seleccionado cuando cambian los resultados
  useEffect(() => {
    setIndiceSeleccionado(-1);
  }, [resultadosBusqueda]);

  // Modificamos el useEffect que observa los cambios en el índice seleccionado
  useEffect(() => {
    if (indiceSeleccionado >= 0 && selectedRowRef.current) {
      const element = selectedRowRef.current;
      const container = element.closest('.overflow-y-auto');
      
      if (container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Solo hacemos scroll si el elemento está fuera del área visible
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
  }, [indiceSeleccionado]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="h-[calc(100vh-10rem)]"
      maxWidth="max-w-[calc(100vw-10rem)]"
      backgroundColor="bg-gray-100"
    >
      <div className="h-screen w-full flex flex-col gap-4 p-4">
        <div className="flex flex-row bg-blue-200 rounded-lg shadow-md p-4 gap-4 border border-gray-300">
          <div className="flex flex-row gap-4 flex-1">
            <input
              ref={inputBusquedaRef}
              value={busquedaDTO.busqueda}
              onChange={handleBusqueda}
              onKeyDown={handleKeyDown}
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              id="busqueda"
              className="w-full p-3 rounded-lg border-2 border-blue-500 text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Buscar artículos..."
            />
          </div>
          <div className="flex flex-row gap-4 flex-1">
            <div className="flex flex-col gap-2 flex-1">
              <SucursalesSelect
                onChange={handleSucursalChange}
                value={busquedaDTO.sucursal}
              />
              <DepositosSelect
                onChange={handleDepositoChange}
                value={busquedaDTO.deposito}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="border-2 border-orange-500 rounded-lg bg-orange-100 grid grid-cols-3 gap-3 p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="categoria"
                    checked={filtroSeleccionado === "categoria"}
                    onChange={() => handleFiltroChange("categoria")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="categoria"
                    className="text-sm font-bold text-gray-800"
                  >
                    Categoria
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="marca"
                    checked={filtroSeleccionado === "marca"}
                    onChange={() => handleFiltroChange("marca")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="marca"
                    className="text-sm font-bold text-gray-800"
                  >
                    Marca
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ubicacion"
                    checked={filtroSeleccionado === "ubicacion"}
                    onChange={() => handleFiltroChange("ubicacion")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="ubicacion"
                    className="text-sm font-bold text-gray-800"
                  >
                    Ubicacion
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="proveedor"
                    checked={filtroSeleccionado === "proveedor"}
                    onChange={() => handleFiltroChange("proveedor")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="proveedor"
                    className="text-sm font-bold text-gray-800"
                  >
                    Proveedores
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="articulo"
                    checked={filtroSeleccionado === "articulo"}
                    onChange={() => handleFiltroChange("articulo")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="articulo"
                    className="text-sm font-bold text-gray-800"
                  >
                    Articulos
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="bg-white flex flex-col gap-2 p-3 rounded-lg border-2 border-gray-300">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-gray-800">
                    Busc. Por Marca de Origen
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!busquedaDTO.stock}
                    onChange={() =>
                      setBusquedaDTO((prev) => ({
                        ...prev,
                        stock: !prev.stock,
                        negativo: false,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-gray-800">
                    Mostrar todos los items
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={busquedaDTO.negativo}
                    onChange={() =>
                      setBusquedaDTO((prev) => ({
                        ...prev,
                        negativo: !prev.negativo,
                        stock: true,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-gray-800">
                    Stock &lt; 0
                  </label>
                </div>
              </div>
              <div className="bg-white flex flex-col gap-2 p-3 rounded-lg border-2 border-gray-300">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cod_interno"
                    checked={filtroSeleccionado === "cod_interno"}
                    onChange={() => handleFiltroChange("cod_interno")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    className="text-sm font-bold text-gray-800"
                    htmlFor="cod_interno"
                  >
                    Busqueda por codigo interno
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lote"
                    checked={filtroSeleccionado === "lote"}
                    onChange={() => handleFiltroChange("lote")}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500"
                  />
                  <label
                    className="text-sm font-bold text-gray-800"
                    htmlFor="lote"
                  >
                    Busqueda por lote
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*TABLA DE ARTICULOS */}
        <div className="flex flex-col p-4 gap-4 bg-white rounded-lg shadow-md border border-gray-300 overflow-y-auto max-h-[30%]">
          {cargandoBusqueda ? (
            <CargandoTablaArticulos />
          ) : errorBusqueda ? (
            <ErrorTablaArticulos />
          ) : (
            <TablaArticulos />
          )}
        </div>
        {/*Componentes varios */}
        <div className="flex flex-row gap-4 p-4 rounded-lg bg-blue-200 shadow-md border border-gray-300 justify-between">
          {/*Informacion del producto */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Lab./Marca:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.marca ?? ""}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Principio Activo:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.principio_activo ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Presentación:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.presentacion ?? ""}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Ubicación:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.ubicacion ?? ""}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Sub. Ubicación:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.subUbicacion ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Fecha últ. Venta:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.fechaUltimaVenta ?? ""}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Fecha últ. Compra:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.fechaUltimaCompra ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    Cant. por Caja:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.cantidad_caja ?? ""}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <span className="text-lg font-bold text-gray-500">
                    P. Sugerido:
                  </span>
                  <p className="font-bold text-gray-800">
                    {articuloSeleccionado?.precio_sugerido}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-1">
              <span className="text-lg font-bold text-gray-500">
                Proveedor:
              </span>
              <p className="font-bold text-gray-800 text-wrap">
                {articuloSeleccionado?.proveedor ?? ""}
              </p>
            </div>
          </div>
          {/*Tabla de articulos en pedidos */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm font-bold text-gray-800">
                Cantidad de articulos en pedido: {articulosEnPedido.length}
              </p>
              <div className="p-2 w-2 h-2 border-2 border-gray-400 bg-white rounded-full" />
              <p className="text-sm font-bold text-gray-800">
                Cantidad de articulos en remision: {articulosEnPedido.length}
              </p>
              <div className="p-2 w-2 h-2 bg-purple-600 rounded-full" />
            </div>
            <TablaArticulosEnPedido />
          </div>
          {/*Foto del articulo */}
          <div className="flex flex-col gap-2">
            <img
              src={NotFound}
              alt="Foto del articulo"
              className="w-48 h-48 object-cover rounded-lg shadow-md border-2 border-gray-300 bg-white"
            />
            <p className="text-sm font-bold text-gray-800">
              Foto del articulo no disponible
            </p>
          </div>
          {/*Botones de accion y leyebdas*/}
          <div className="flex flex-col gap-2">
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
              <div className="flex flex-row gap-2 p-2 items-center">
                <p className="text-sm font-bold text-gray-800">
                  Lote Vencido o proximo a vencer
                </p>
                <div className="p-2 w-2 h-2 bg-red-600 rounded-full" />
              </div>
              <div className="flex flex-row gap-2 p-2 items-center">
                <p className="text-sm font-bold text-gray-800">
                  Lote vence en más de 120 dias
                </p>
                <div className="p-2 w-2 h-2 bg-yellow-500 rounded-full" />
              </div>
              <div className="flex flex-row gap-2 p-2 items-center">
                <p className="text-sm font-bold text-gray-800">
                  Registrado en pre-compra
                </p>
                <div className="p-2 w-2 h-2 bg-cyan-500 rounded-full" />
              </div>
            </div>
            <div className="border-2 bg-white border-gray-300 rounded-lg p-3 flex flex-row gap-2">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-bold"
                onClick={limpiarFiltros}
              >
                Limpiar Filtros
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-bold"
                onClick={handleSeleccionarArticulo}
              >
                Seleccionar articulo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
