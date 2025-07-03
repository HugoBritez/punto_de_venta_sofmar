import { useEffect, useState, useRef } from "react";
import { useBuscadorArticulos } from "./hooks/useBuscadorArticulos";
import { BusquedaDTO } from "./types/busquedaDTO.type";
import { Articulo } from "./types/articulo.type";
import { Search, ArrowLeft, Package, AlertCircle, Loader2, Filter } from "lucide-react";
import { useToast } from "@chakra-ui/react";
import { formatCurrency } from "./utils/formatCurrency";

interface ArticulosComponentMobileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect?: (articulo: any) => void;
  depositoInicial?: number;
  sucursalInicial?: number;
}

export const ArticulosComponentMobile = ({
  isOpen,
  setIsOpen,
  onSelect,
  depositoInicial,
}: ArticulosComponentMobileProps) => {
  const [busquedaDTO, setBusquedaDTO] = useState<BusquedaDTO>({
    busqueda: "",
    id_articulo: undefined,
    codigo_barra: undefined,
    deposito: depositoInicial ?? undefined,
    stock: true,
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

  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string | null>("articulo");
  const [showFilters, setShowFilters] = useState(false);

  const toast = useToast();
  const inputBusquedaRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (depositoInicial !== undefined) {
      setBusquedaDTO((prev) => ({
        ...prev,
        deposito: depositoInicial,
      }));
    }
  }, [depositoInicial]);

  const {
    setTermino,
    resultados: resultadosBusqueda,
    cargando: cargandoBusqueda,
    error: errorBusqueda,
  } = useBuscadorArticulos(busquedaDTO);

  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1);

  useEffect(() => {
    if (isOpen && inputBusquedaRef.current) {
      inputBusquedaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        limpiarFiltros();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, setIsOpen]);

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
          const articuloSeleccionadoPorTeclado = resultadosBusqueda[indiceSeleccionado];
          
          if (articuloSeleccionado && articuloSeleccionado.id_lote === articuloSeleccionadoPorTeclado.id_lote) {
            handleSeleccionarArticulo();
          } else {
            handleArticuloSeleccionado(articuloSeleccionadoPorTeclado, undefined, true);
          }
        }
        break;
    }
  };

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTermino(valor);
    setBusquedaDTO((prev) => ({
      ...prev,
      busqueda: valor,
    }));
  };

  const handleFiltroChange = (filtro: string) => {
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

  const handleArticuloSeleccionado = (
    articulo: Articulo,
    event?: React.MouseEvent,
    esSeleccionPorTeclado: boolean = false
  ) => {
    event?.preventDefault();
    
    if (articuloSeleccionado && articuloSeleccionado.id_lote === articulo.id_lote) {
      handleSeleccionarArticulo();
    } else {
      setArticuloSeleccionado(articulo);
      
      if (!esSeleccionPorTeclado) {
        setIndiceSeleccionado(-1);
      }
    
    }
  };

  const handleMostrarTodosChange = (stock: boolean) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      stock: stock,
    }));
    sessionStorage.setItem("stockArticulos", stock.toString());
  };

  const handleNegativoChange = (negativo: boolean) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      negativo: negativo,
    }));
    sessionStorage.setItem("negativoArticulos", negativo.toString());
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
      deposito: depositoInicial ?? undefined,
      moneda: undefined,
      articulo: 1,
    }));
    setArticuloSeleccionado(null);
  };

  const handleSeleccionarArticulo = () => {
    if (articuloSeleccionado) {
      if (
        articuloSeleccionado.cantidad_lote < 0 &&
        articuloSeleccionado.vencimiento_validacion === 0
      ) {
        toast({
          title: "No se puede seleccionar un artículo con stock negativo o cero.",
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
        title: "No se ha seleccionado ningún artículo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full h-[95%] rounded-t-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Buscar Artículos</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Filter className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputBusquedaRef}
                value={busquedaDTO.busqueda}
                onChange={handleBusqueda}
                onKeyDown={handleKeyDown}
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar artículos..."
              />
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="categoria"
                    checked={filtroSeleccionado === "categoria"}
                    onChange={() => handleFiltroChange("categoria")}
                    className="w-4 h-4"
                  />
                  <span>Categoría</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="marca"
                    checked={filtroSeleccionado === "marca"}
                    onChange={() => handleFiltroChange("marca")}
                    className="w-4 h-4"
                  />
                  <span>Marca</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="ubicacion"
                    checked={filtroSeleccionado === "ubicacion"}
                    onChange={() => handleFiltroChange("ubicacion")}
                    className="w-4 h-4"
                  />
                  <span>Ubicación</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="proveedor"
                    checked={filtroSeleccionado === "proveedor"}
                    onChange={() => handleFiltroChange("proveedor")}
                    className="w-4 h-4"
                  />
                  <span>Proveedor</span>
                </label>
              </div>
              
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!busquedaDTO.stock}
                    onChange={() => handleMostrarTodosChange(!busquedaDTO.stock)}
                    className="w-4 h-4"
                  />
                  <span>Mostrar todos</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={busquedaDTO.negativo}
                    onChange={() => handleNegativoChange(!busquedaDTO.negativo)}
                    className="w-4 h-4"
                  />
                  <span>Stock &lt; 0</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Lista de artículos */}
        <div className="flex-1 overflow-y-auto">
          {cargandoBusqueda ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : errorBusqueda ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <AlertCircle className="w-8 h-8" />
              <p className="font-medium">Error al cargar artículos</p>
            </div>
          ) : resultadosBusqueda.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <Package className="w-8 h-8" />
              <p className="font-medium">No se encontraron artículos</p>
            </div>
          ) : (
            <div className="p-2">
              {resultadosBusqueda.map((articulo, index) => (
                <div
                  key={articulo.id_lote}
                  onClick={(e) => handleArticuloSeleccionado(articulo, e)}
                  className={`
                    p-4 border-b border-gray-100 cursor-pointer transition-colors
                    ${articuloSeleccionado?.id_lote === articulo.id_lote ? 'bg-blue-50 border-blue-200' : 
                      indiceSeleccionado === index ? 'bg-blue-100' : 'hover:bg-gray-50'}
                    ${articulo.estado_vencimiento === "VENCIDO" ? 'bg-red-50' :
                      articulo.estado_vencimiento === "PROXIMO" ? 'bg-yellow-50' :
                      articulo.precompra === 1 ? 'bg-cyan-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{articulo.descripcion}</p>
                      <p className="text-xs text-gray-500">Código: {articulo.id_articulo}</p>
                      <p className="text-xs text-gray-500">Barras: {articulo.codigo_barra}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-green-600">{formatCurrency(articulo.precio_venta_guaranies)}</p>
                      <p className="text-xs text-gray-500">Stock: {articulo.cantidad_lote}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <div className="flex gap-2">
                      <span>Lote: {articulo.lote}</span>
                      <span>Serie: {articulo.lote}</span>
                    </div>
                    <div className="flex gap-1">
                      {articulo.estado_vencimiento === "VENCIDO" && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Vencido</span>
                      )}
                      {articulo.estado_vencimiento === "PROXIMO" && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Próximo</span>
                      )}
                      {articulo.precompra === 1 && (
                        <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">Pre-compra</span>
                      )}
                    </div>
                  </div>
                  
                  {articulo.vencimiento_lote && (
                    <p className="text-xs text-gray-500 mt-1">
                      Vence: {articulo.vencimiento_lote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={limpiarFiltros}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar
            </button>
            <button
              onClick={handleSeleccionarArticulo}
              disabled={!articuloSeleccionado}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};