import HeaderComponent from "@/modules/Header";
import { api_url } from "@/utils";
import {
  Flex,
  Select,
  Spinner,
  Switch,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { Deposito, Moneda, Sucursal } from "@/types/shared_interfaces";
import { motion, AnimatePresence } from "framer-motion"; // Añadir esta importación
import { useGetArticulos } from "@/shared/hooks/querys/articulos/useGetArticulos";
import { ArticulosSimple } from "@/shared/api/articulosApi";

type TipoBusqueda = "articulo" | "marca" | "categoria" | "proveedor" | "ubicacion";

const ConsultaArticulos = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );
  const [stock, setStock] = useState<boolean>(true);
  const [loadingDetalle, setLoadingDetalle] = useState<boolean>(false);
  const [mostrarTallas, setMostrarTallas] = useState<boolean>(false);
  const toast = useToast();
  const [itemSeleccionado, setItemSeleccionado] = useState<ArticulosSimple | null>(
    null
  );
  const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>("articulo");
    const [showMobileDetail, setShowMobileDetail] = useState(false);


  const [isMobile] = useMediaQuery("(max-width: 1600px)");

  const permisos_ver_costo = sessionStorage.getItem("permiso_ver_utilidad");

  const [busqueda, setBusqueda] = useState<string | null>(null);
  const [busquedaInterno, setBusquedaInterno] = useState<string | null>(null);
  const [busquedaCodigo, setBusquedaCodigo] = useState<string | null>(null);


  const { data: articulos, isLoading: loading, isFetching } = useGetArticulos(
    {
      busqueda: busqueda || undefined,
      deposito: depositoSeleccionado?.dep_codigo || undefined,
      moneda: monedaSeleccionada?.mo_codigo,
      stock: !stock,
      cod_interno: busquedaInterno || undefined,
      codigo_barra: busquedaCodigo || undefined,
      tipo_busqueda: tipoBusqueda || undefined
    },
    {
      enabled: true
    }
  );


  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    
    setBusqueda(busqueda);
  };

  const handleBusquedaInterno = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    
    setBusquedaInterno(busqueda);
  };

  const handleBusquedaCodigo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    
    setBusquedaCodigo(busqueda);
  };



  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [monedasRes, depositosRes, sucursalesRes] = await Promise.all([
          axios.get(`${api_url}monedas/`),
          axios.get(`${api_url}depositos/`),
          axios.get(`${api_url}sucursales/listar`)
        ]);

        setMonedas(monedasRes.data.body);
        setDepositos(depositosRes.data.body);
        setSucursales(sucursalesRes.data.body);

        if (monedasRes.data.body.length > 0) {
          setMonedaSeleccionada(monedasRes.data.body[0]);
        }
        if (depositosRes.data.body.length > 0) {
          setDepositoSeleccionado(depositosRes.data.body[0]);
        }
        if (sucursalesRes.data.body.length > 0) {
          setSucursalSeleccionada(sucursalesRes.data.body[0]);
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast({
          title: "Error",
          description: "Error al cargar los datos iniciales",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchInitialData();
  }, []);


  const handleItemSeleccionado = (articulo: ArticulosSimple) => {
    setItemSeleccionado(articulo);
    setLoadingDetalle(true);
    if (isMobile) {
      setShowMobileDetail(true);
    }
    setTimeout(() => {
      setLoadingDetalle(false);
    }, 1000);
  };
const MobileDetailModal = () => (
  <AnimatePresence>
    {showMobileDetail && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-hidden touch-none"
        onClick={() => setShowMobileDetail(false)}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, type: "spring", damping: 25 }}
          className="absolute bottom-0 w-full bg-white rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera fija con indicador de arrastre */}
          <div className="flex flex-col">
            <div className="flex justify-center items-center py-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 truncate max-w-[250px]">
                  {itemSeleccionado?.descripcion}
                </h2>
                <p className="text-sm text-gray-500">Código: {itemSeleccionado?.id_articulo}</p>
              </div>
              <button
                onClick={() => setShowMobileDetail(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loadingDetalle ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" color="blue.500" />
                  <span className="text-gray-500 text-sm">Cargando detalles...</span>
                </div>
              </div>
            ) : itemSeleccionado ? (
              <div className="p-4 space-y-6">
                {/* Imagen y información básica */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <img
                      src={"/not-found.svg"}
                      alt="no-pictures"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {itemSeleccionado.id_articulo}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        itemSeleccionado.stock > 10 
                          ? "bg-green-100 text-green-800" 
                          : itemSeleccionado.stock > 0 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        Stock: {itemSeleccionado.stock}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {itemSeleccionado.codigo_barra || "Sin código de barras"}
                    </p>
                  </div>
                </div>

                {/* Información del artículo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Información del Artículo
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Proveedor:</span>
                      <span className="text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">{itemSeleccionado.proveedor_razon}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Marca:</span>
                      <span className="text-sm text-gray-900 bg-green-50 px-2 py-1 rounded">{itemSeleccionado.marca}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Categoría:</span>
                      <span className="text-sm text-gray-900 bg-purple-50 px-2 py-1 rounded">{itemSeleccionado.categoria}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Subcategoría:</span>
                      <span className="text-sm text-gray-900 bg-orange-50 px-2 py-1 rounded">{itemSeleccionado.subcategoria}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Ubicación:</span>
                      <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{itemSeleccionado.ubicacion}</span>
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Precios
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">P. Contado</p>
                      <p className="text-lg font-bold text-green-800">{formatearNumero(itemSeleccionado.precio_venta)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">P. Crédito</p>
                      <p className="text-lg font-bold text-blue-800">{formatearNumero(itemSeleccionado.precio_credito)}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">P. Mostrador</p>
                      <p className="text-lg font-bold text-purple-800">{formatearNumero(itemSeleccionado.precio_mostrador)}</p>
                    </div>
                    {permisos_ver_costo === "1" && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-600 font-medium">P. Costo</p>
                        <p className="text-lg font-bold text-orange-800">{formatearNumero(itemSeleccionado.precio_costo)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lotes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Lotes ({itemSeleccionado.lotes.filter(lote => lote.lote != "" && lote.cantidad > 0).length})
                  </h3>
                  <div className="space-y-2">
                    {itemSeleccionado.lotes
                      .filter((lote) => lote.lote != "" && lote.cantidad > 0)
                      .map((lote) => (
                        <div key={lote.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{lote.lote}</p>
                            <p className="text-xs text-gray-500">Vence: {lote.vencimiento}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {lote.cantidad}
                          </span>
                        </div>
                      ))}
                    {itemSeleccionado.lotes.filter(lote => lote.lote != "" && lote.cantidad > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No hay lotes disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Depósitos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Depósitos ({itemSeleccionado.depositos.filter(deposito => deposito.stock > 0).length})
                  </h3>
                  <div className="space-y-2">
                    {itemSeleccionado.depositos
                      .filter((deposito) => deposito.stock > 0)
                      .map((deposito) => (
                        <div key={deposito.codigo} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{deposito.descripcion}</p>
                            <p className="text-xs text-gray-500">Código: {deposito.codigo}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deposito.stock > 10 
                              ? "bg-green-100 text-green-800" 
                              : deposito.stock > 0 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {deposito.stock}
                          </span>
                        </div>
                      ))}
                    {itemSeleccionado.depositos.filter(deposito => deposito.stock > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No hay stock en depósitos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

useEffect(() => {
  if (showMobileDetail) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }

  return () => {
    document.body.style.overflow = "unset";
  };
}, [showMobileDetail]);

const formatearNumero = (num: number | string) => {
  // Convertir a número si es string
  const numValue = typeof num === "string" ? Number(num) : num;

  // Eliminar decimales con Math.floor y formatear con separador de miles
  return Math.floor(numValue).toLocaleString("es-PY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

  return (
    <Flex bg={"gray.100"} h={"100vh"} w={"100%"} p={2}>
      <div className=" w-full h-full">
        <HeaderComponent Icono={Archive} titulo="Consulta de Artículos" />
        <div
          className={
            isMobile
              ? "flex flex-col"
              : "flex flex-row gap-2 w-full h-[93%] py-2"
          }
        >
          <div className={isMobile ? "w-full" : "flex flex-col gap-2 w-[65%] "}>
            {/* ########## FILTROS ########## */}
            <div className="flex flex-col p-4 border border-gray-200 bg-white rounded-lg shadow-sm h-[15%] py-4 justify-between">
              {isMobile ? (
                // Diseño móvil optimizado
                <div className="space-y-4">
                  {/* Filtros principales en móvil */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Sucursal
                      </label>
                      <Select
                        bg={"white"}
                        borderColor={"gray.300"}
                        borderRadius="md"
                        size="sm"
                        _hover={{ borderColor: "blue.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                        onChange={(e) =>
                          setSucursalSeleccionada(
                            sucursales.find(
                              (sucursal) => sucursal.id === Number(e.target.value)
                            ) || null
                          )
                        }
                      >
                        {sucursales.map((sucursal) => (
                          <option key={sucursal.id} value={sucursal.id}>
                            {sucursal.descripcion}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Depósito
                      </label>
                      <Select
                        bg={"white"}
                        borderColor={"gray.300"}
                        borderRadius="md"
                        size="sm"
                        _hover={{ borderColor: "blue.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                        onChange={(e) =>
                          setDepositoSeleccionado(
                            depositos.find(
                              (deposito) =>
                                deposito.dep_codigo === Number(e.target.value)
                            ) || null
                          )
                        }
                      >
                        {depositos.map((deposito) => (
                          <option
                            key={deposito.dep_codigo}
                            value={deposito.dep_codigo}
                          >
                            {deposito.dep_descripcion}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Filtros secundarios */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Moneda
                      </label>
                      <Select
                        bg={"white"}
                        borderColor={"gray.300"}
                        borderRadius="md"
                        size="sm"
                        _hover={{ borderColor: "blue.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                        onChange={(e) =>
                          setMonedaSeleccionada(
                            monedas.find(
                              (moneda) =>
                                moneda.mo_codigo === Number(e.target.value)
                            ) || null
                          )
                        }
                      >
                        {monedas.map((moneda) => (
                          <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                            {moneda.mo_descripcion}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Opciones
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            onChange={(e) => setStock(e.target.checked)}
                            isChecked={stock}
                            colorScheme="blue"
                            size="sm"
                          />
                          <span className="text-xs text-gray-600">Todos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            onChange={(e) => setMostrarTallas(e.target.checked)}
                            isChecked={mostrarTallas}
                            colorScheme="purple"
                            size="sm"
                          />
                          <span className="text-xs text-gray-600">Tallas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Búsqueda móvil */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Código interno..."
                          onChange={mostrarTallas ? handleBusquedaInterno : handleBusquedaCodigo}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg placeholder-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Descripción..."
                          onChange={handleBusqueda}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg placeholder-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Diseño desktop (mantener el existente)
                <div className={isMobile ? "flex flex-col gap-4" : "flex flex-row gap-6"}>
                  <div className={isMobile ? "flex flex-col gap-2 items-start flex-1" : "flex flex-row gap-3 items-center flex-1"}>
                    <label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Sucursal:
                    </label>
                    <Select
                      bg={"white"}
                      borderColor={"gray.300"}
                      borderRadius="md"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                      onChange={(e) =>
                        setSucursalSeleccionada(
                          sucursales.find(
                            (sucursal) => sucursal.id === Number(e.target.value)
                          ) || null
                        )
                      }
                    >
                      {sucursales.map((sucursal) => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.descripcion}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className={isMobile ? "flex flex-col gap-2 items-start flex-1" : "flex flex-row gap-3 items-center flex-1"}>
                    <label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Depósito:
                    </label>
                    <Select
                      bg={"white"}
                      borderColor={"gray.300"}
                      borderRadius="md"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                      onChange={(e) =>
                        setDepositoSeleccionado(
                          depositos.find(
                            (deposito) =>
                              deposito.dep_codigo === Number(e.target.value)
                          ) || null
                        )
                      }
                    >
                      {depositos.map((deposito) => (
                        <option
                          key={deposito.dep_codigo}
                          value={deposito.dep_codigo}
                        >
                          {deposito.dep_descripcion}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className={isMobile ? "flex flex-col gap-2 items-start flex-1" : "flex flex-row gap-3 items-center flex-1"}>
                    <label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Moneda:
                    </label>
                    <Select
                      bg={"white"}
                      borderColor={"gray.300"}
                      borderRadius="md"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                      onChange={(e) =>
                        setMonedaSeleccionada(
                          monedas.find(
                            (moneda) =>
                              moneda.mo_codigo === Number(e.target.value)
                          ) || null
                        )
                      }
                    >
                      {monedas.map((moneda) => (
                        <option key={moneda.mo_codigo} value={moneda.mo_codigo}>
                          {moneda.mo_descripcion}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={() => setTipoBusqueda(tipoBusqueda === "marca" ? "articulo" : "marca")}
                        isChecked={tipoBusqueda === "marca"}
                        colorScheme="green"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Buscar por marca
                      </label>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={() => setTipoBusqueda(tipoBusqueda === "categoria" ? "articulo" : "categoria")}
                        isChecked={tipoBusqueda === "categoria"}
                        colorScheme="green"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Buscar por categoria
                      </label>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={() => setTipoBusqueda(tipoBusqueda === "proveedor" ? "articulo" : "proveedor")}
                        isChecked={tipoBusqueda === "proveedor"}
                        colorScheme="green"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Buscar por proveedor
                      </label>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={() => setTipoBusqueda(tipoBusqueda === "ubicacion" ? "articulo" : "ubicacion")}
                        isChecked={tipoBusqueda === "ubicacion"}
                        colorScheme="green"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Buscar por ubicación
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={(e) => setStock(e.target.checked)}
                        isChecked={stock}
                        colorScheme="blue"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Mostrar todos los artículos
                      </label>
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Switch
                        onChange={(e) => setMostrarTallas(e.target.checked)}
                        isChecked={mostrarTallas}
                        colorScheme="purple"
                        size="md"
                      />
                      <label className="font-semibold text-gray-700 text-sm">
                        Mostrar tallas y colores
                      </label>
                    </div>
                    
                  </div>
                </div>
              )}
              
              {!isMobile && (
                <div className="relative">
                  <div className="flex flex-row gap-2">
                    <div className="relative w-1/3">
                      <input
                        type="text"
                        placeholder="Buscar artículos por código interno..."
                        onChange={mostrarTallas ? handleBusquedaInterno : handleBusquedaCodigo}
                        className="w-full mt-4  pr-4 p-2 bg-white border border-gray-300 rounded-lg placeholder-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                      />
                    </div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Buscar artículos por descripción..."
                        onChange={handleBusqueda}
                        className="w-full mt-4  pr-4 p-2 bg-white border border-gray-300 rounded-lg placeholder-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ########## TABLA ########## */}
            <div className="flex flex-row p-4 border border-gray-200 bg-white rounded-lg h-full overflow-hidden shadow-sm">
              {isMobile ? (
                // Diseño móvil con tarjetas
                <div className="w-full overflow-auto">
                  {loading || isFetching ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" color="blue.500" />
                        <span className="text-gray-500">Cargando artículos...</span>
                      </div>
                    </div>
                  ) : articulos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                      <Archive className="w-12 h-12 mb-2 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron artículos</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-2">
                      {articulos?.map((articulo, index) => (
                        <div
                          key={index}
                          className={`p-4 border border-gray-200 bg-white rounded-lg cursor-pointer transition-all duration-150 shadow-sm ${
                            itemSeleccionado?.id_articulo === articulo.id_articulo
                              ? "border-blue-300 bg-blue-50/50 shadow-md ring-1 ring-blue-200"
                              : "hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
                          }`}
                          onClick={() => handleItemSeleccionado(articulo)}
                        >
                          {/* Información principal */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  #{mostrarTallas ? articulo.cod_interno : articulo.id_articulo}
                                </span>
                                <span className={`text-xs font-medium ${
                                  articulo.stock > 10 
                                    ? "text-green-600" 
                                    : articulo.stock > 0 
                                    ? "text-yellow-600" 
                                    : "text-red-600"
                                }`}>
                                  Stock: {articulo.stock} unidades
                                </span>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                                {articulo.descripcion}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono">
                                Código de barras: {mostrarTallas ? articulo.codigo_barra_lote : articulo.codigo_barra || "Sin código de barras"}
                              </p>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Precios y detalles */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-green-600 font-medium">
                                  Contado: {formatearNumero(articulo.precio_venta)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-blue-600 font-medium">
                                  Crédito: {formatearNumero(articulo.precio_credito)}
                                </span>
                              </div>
                              {permisos_ver_costo === "1" && (
                                <div className="flex flex-col">
                                  <span className="text-red-600 font-medium">
                                    Costo: {formatearNumero(articulo.precio_costo)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {mostrarTallas && (articulo.talle || articulo.color) && (
                                <div className="flex items-center gap-1 text-gray-700">
                                  {articulo.talle && (
                                    <span className="font-medium">
                                      Talle: {articulo.talle}
                                    </span>
                                  )}
                                  {articulo.talle && articulo.color && (
                                    <span className="text-gray-400">-</span>
                                  )}
                                  {articulo.color && (
                                    <span className="font-medium">
                                      {articulo.color}
                                    </span>
                                  )}
                                </div>
                              )}
                              <span className="text-gray-400 text-xs">
                                {articulo.marca}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Diseño desktop (mantener el existente)
                <div className="w-full overflow-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          {mostrarTallas ? "Ref." : "Código"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Código de Barras
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          P. Contado
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          P. Crédito
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          P. Mostrador
                        </th>
                        {mostrarTallas && (
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Tallas
                          </th>
                        )}
                        {mostrarTallas && (
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Colores
                          </th>
                        )}
                        {permisos_ver_costo === "1" && (
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            P. Costo
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {loading || isFetching ? (
                        <tr>
                          <td colSpan={mostrarTallas ? (permisos_ver_costo === "1" ? 10 : 9) : (permisos_ver_costo === "1" ? 8 : 7)} className="px-4 py-8 text-center">
                            <div className="flex justify-center items-center">
                              <Spinner size="lg" color="blue.500" />
                              <span className="ml-3 text-gray-500">Cargando artículos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : articulos?.length === 0 ? (
                        <tr>
                          <td colSpan={mostrarTallas ? (permisos_ver_costo === "1" ? 10 : 9) : (permisos_ver_costo === "1" ? 8 : 7)} className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Archive className="w-12 h-12 mb-2 text-gray-300" />
                              <p className="text-lg font-medium">No se encontraron artículos</p>
                              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        articulos?.map((articulo, index) => (
                          <tr
                            key={articulo.id_articulo}
                            className={`transition-all duration-200 hover:bg-blue-50 cursor-pointer ${
                              itemSeleccionado?.id_articulo === articulo.id_articulo
                                ? "bg-blue-100 border-l-4 border-l-blue-500"
                                : "hover:shadow-sm"
                            } ${index % 2 === 0 ? "bg-gray-50/30" : "bg-white"}`}
                            onClick={() => handleItemSeleccionado(articulo)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {mostrarTallas ? articulo.cod_interno : articulo.id_articulo}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                              {articulo.codigo_barra || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                              <div className="truncate" title={articulo.descripcion}>
                                {articulo.descripcion}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                articulo.stock > 10 
                                  ? "bg-green-100 text-green-800" 
                                  : articulo.stock > 0 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {articulo.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              <span className="text-green-600">
                                {formatearNumero(articulo.precio_venta)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              <span className="text-blue-600">
                                {formatearNumero(articulo.precio_credito)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              <span className="text-purple-600">
                                {formatearNumero(articulo.precio_mostrador)}
                              </span>
                            </td>
                            {mostrarTallas && (
                              <td className="px-4 py-3 text-sm text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                  {articulo.talle || "-"}
                                </span>
                              </td>
                            )}
                            {mostrarTallas && (
                              <td className="px-4 py-3 text-sm text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                  {articulo.color || "-"}
                                </span>
                              </td>
                            )}
                            {permisos_ver_costo === "1" && (
                              <td className="px-4 py-3 text-sm text-right font-medium">
                                <span className="text-orange-600">
                                  {formatearNumero(articulo.precio_costo)}
                                </span>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {/* ########## DETALLE ########## */}
          {isMobile ? (
            <MobileDetailModal />
          ) : (
            <div className="flex flex-col gap-2 w-[35%] h-full">
              {itemSeleccionado ? (
                <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Cabecera del detalle */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-800 truncate">
                          {itemSeleccionado.descripcion}
                        </h2>
                        <p className="text-sm text-gray-500">Código: {itemSeleccionado.id_articulo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido scrolleable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingDetalle ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="flex flex-col items-center gap-2">
                          <Spinner size="lg" color="blue.500" />
                          <span className="text-gray-500 text-sm">Cargando detalles...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Imagen y información básica */}
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <img
                              src={"/not-found.svg"}
                              alt="no-pictures"
                              className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {itemSeleccionado.id_articulo}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                itemSeleccionado.stock > 10 
                                  ? "bg-green-100 text-green-800" 
                                  : itemSeleccionado.stock > 0 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                Stock: {itemSeleccionado.stock}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 font-mono break-all">
                              {itemSeleccionado.codigo_barra || "Sin código de barras"}
                            </p>
                          </div>
                        </div>

                        {/* Información del artículo */}
                        <div className="space-y-3">
                          <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-1">
                            Información del Artículo
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-600">Proveedor:</span>
                              <span className="text-xs text-gray-900 bg-blue-50 px-2 py-1 rounded">{itemSeleccionado.proveedor_razon}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-600">Marca:</span>
                              <span className="text-xs text-gray-900 bg-green-50 px-2 py-1 rounded">{itemSeleccionado.marca}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-600">Categoría:</span>
                              <span className="text-xs text-gray-900 bg-purple-50 px-2 py-1 rounded">{itemSeleccionado.categoria}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-600">Subcategoría:</span>
                              <span className="text-xs text-gray-900 bg-orange-50 px-2 py-1 rounded">{itemSeleccionado.subcategoria}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-600">Ubicación:</span>
                              <span className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">{itemSeleccionado.ubicacion}</span>
                            </div>
                          </div>
                        </div>

                        {/* Precios */}
                        <div className="space-y-3">
                          <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-1">
                            Precios
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-600 font-medium">P. Contado</p>
                              <p className="text-sm font-bold text-green-800">{formatearNumero(itemSeleccionado.precio_venta)}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded">
                              <p className="text-xs text-blue-600 font-medium">P. Crédito</p>
                              <p className="text-sm font-bold text-blue-800">{formatearNumero(itemSeleccionado.precio_credito)}</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded">
                              <p className="text-xs text-purple-600 font-medium">P. Mostrador</p>
                              <p className="text-sm font-bold text-purple-800">{formatearNumero(itemSeleccionado.precio_mostrador)}</p>
                            </div>
                            {permisos_ver_costo === "1" && (
                              <div className="p-2 bg-orange-50 rounded">
                                <p className="text-xs text-orange-600 font-medium">P. Costo</p>
                                <p className="text-sm font-bold text-orange-800">{formatearNumero(itemSeleccionado.precio_costo)}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lotes */}
                        <div className="space-y-3">
                          <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-1">
                            Lotes ({itemSeleccionado.lotes.filter(lote => lote.lote != "" && lote.cantidad > 0).length})
                          </h3>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {itemSeleccionado.lotes
                              .filter((lote) => lote.lote != "" && lote.cantidad > 0)
                              .map((lote) => (
                                <div key={lote.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{lote.lote}</p>
                                    <p className="text-gray-500">Vence: {lote.vencimiento}</p>
                                  </div>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                    {lote.cantidad}
                                  </span>
                                </div>
                              ))}
                            {itemSeleccionado.lotes.filter(lote => lote.lote != "" && lote.cantidad > 0).length === 0 && (
                              <div className="text-center py-2 text-gray-500">
                                <p className="text-xs">No hay lotes disponibles</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Depósitos */}
                        <div className="space-y-3">
                          <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-1">
                            Depósitos ({itemSeleccionado.depositos.filter(deposito => deposito.stock > 0).length})
                          </h3>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {itemSeleccionado.depositos
                              .filter((deposito) => deposito.stock > 0)
                              .map((deposito) => (
                                <div key={deposito.codigo} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{deposito.descripcion}</p>
                                    <p className="text-gray-500">Código: {deposito.codigo}</p>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    deposito.stock > 10 
                                      ? "bg-green-100 text-green-800" 
                                      : deposito.stock > 0 
                                      ? "bg-yellow-100 text-yellow-800" 
                                      : "bg-red-100 text-red-800"
                                  } ml-2`}>
                                    {deposito.stock}
                                  </span>
                                </div>
                              ))}
                            {itemSeleccionado.depositos.filter(deposito => deposito.stock > 0).length === 0 && (
                              <div className="text-center py-2 text-gray-500">
                                <p className="text-xs">No hay stock en depósitos</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full h-full bg-white rounded-lg justify-center items-center border border-gray-200">
                  <div className="text-center">
                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h1 className="text-xl font-semibold text-gray-500 mb-2">
                      No hay artículo seleccionado
                    </h1>
                    <p className="text-sm text-gray-400">
                      Selecciona un artículo de la lista para ver sus detalles
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Flex>
  );
};

export default ConsultaArticulos;
