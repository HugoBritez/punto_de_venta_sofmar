import HeaderComponent from "@/shared/modules/Header";
import {
  Flex,
  Input,
  Select,
  Spinner,
  Switch,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import { Archive } from "lucide-react";
import { useEffect, useState } from "react";
import { Deposito } from "@/api/depositosApi";
import { Moneda } from "@/api/monedasApi";
import { Sucursal } from "@/api/sucursalApi";
import not_found from "@/assets/not-found/not-found.png";
import { motion, AnimatePresence } from "framer-motion"; 
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useDepositosStore } from "@/stores/depositosStore";
import { useMonedasStore } from "@/stores/monedasStore";
import { getArticulos } from "@/api/articulosApi";



interface Articulos {
  id_articulo: number;
  codigo_barra: string;
  descripcion: string;
  stock: number;
  lotes: [
    {
      id: number;
      lote: string;
      cantidad: number;
      vencimiento: string;
    }
  ];
  depositos: [
    {
      codigo: number;
      descripcion: string;
      stock: number;
    }
  ];
  precio_costo: number;
  precio_venta: number;
  precio_credito: number;
  precio_mostrador: number;
  precio_4: number;
  ubicacion: string;
  sub_ubicacion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  proveedor_razon: string;
  fecha_ultima_compra: string;
  fecha_ultima_venta: string;
}

const ConsultaArticulos = () => {
  const [articulos, setArticulos] = useState<Articulos[]>([]);
  const {sucursales, fetchSucursalesPorOperador} = useSucursalesStore()
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const {depositos, fetchDepositos} = useDepositosStore()
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);
  const {monedas, fetchMonedas} = useMonedasStore()
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(
    null
  );
  const [stock, setStock] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDetalle, setLoadingDetalle] = useState<boolean>(false);
  const toast = useToast();
  const [itemSeleccionado, setItemSeleccionado] = useState<Articulos | null>(
    null
  );

    const [showMobileDetail, setShowMobileDetail] = useState(false);


  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const permisos_ver_costo = sessionStorage.getItem("permiso_ver_utilidad");
  const operador = Number(sessionStorage.getItem("user_id"));

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fechArticulos = async (busqueda: string | null = null) => {
    try {
      setLoading(true);
      const response = await getArticulos(
        busqueda,
        monedaSeleccionada?.moCodigo,
        stock,
        depositoSeleccionado?.dep_codigo,

      );
      // const response = await axios.get(
      //   `${api_url}articulos/consulta-articulos`,

      //   {
      //     params: {
      //       busqueda: busqueda,
      //       sucursal: sucursalSeleccionada?.id,
      //       deposito: depositoSeleccionado?.dep_codigo,
      //       moneda: monedaSeleccionada?.moCodigo,
      //       stock: stock,
      //     },
      //   }
      // );
      // console.log('LLAMANDO A FETCHARTICULOS', busqueda)
      setArticulos(response);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Error al consultar los artículos: ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    
    // Limpiar el timeout anterior si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Crear un nuevo timeout
    const timeout = setTimeout(() => {
      fechArticulos(busqueda);
    }, 600); // 500ms de debounce para la búsqueda

    setSearchTimeout(timeout);
  };

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchSucursalesPorOperador(operador)
        if (sucursales.length > 0) {
          setSucursalSeleccionada(sucursales[0]);
        }
        await fetchDepositos(sucursalSeleccionada?.id)
        if (depositos.length > 0) {
          setDepositoSeleccionado(depositos[0]);
        }
        await fetchMonedas()
        if (monedas.length > 0) {
          setMonedaSeleccionada(monedas[0]);
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
 
      fetchInitialData()
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fechArticulos('');
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [sucursalSeleccionada, depositoSeleccionado, monedaSeleccionada, stock]);

  const handleItemSeleccionado = (articulo: Articulos) => {
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
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 w-full bg-white rounded-t-3xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera fija */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-700">
              {itemSeleccionado?.descripcion}
            </h2>
            <button
              onClick={() => setShowMobileDetail(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
            {loadingDetalle ? (
              <div className="flex justify-center items-center h-40">
                <Spinner />
              </div>
            ) : itemSeleccionado ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={not_found}
                    alt="no-pictures"
                    className="w-32 h-32 object-cover"
                  />
                  <p className="text-blue-500 text-sm">Subir Imagen</p>
                </div>

                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="font-semibold">Código:</span>{" "}
                    {itemSeleccionado.id_articulo}
                  </p>
                  <p>
                    <span className="font-semibold">Proveedor:</span>{" "}
                    {itemSeleccionado.proveedor_razon}
                  </p>
                  <p>
                    <span className="font-semibold">Marca:</span>{" "}
                    {itemSeleccionado.marca}
                  </p>
                  <p>
                    <span className="font-semibold">Categoría:</span>{" "}
                    {itemSeleccionado.categoria}
                  </p>
                  <p>
                    <span className="font-semibold">Subcategoría:</span>{" "}
                    {itemSeleccionado.subcategoria}
                  </p>
                  <p>
                    <span className="font-semibold">Ubicación:</span>{" "}
                    {itemSeleccionado.ubicacion}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Lotes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Lote</th>
                          <th className="text-center p-2">Cant.</th>
                          <th className="text-center p-2">Venc.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemSeleccionado.lotes
                          .filter(
                            (lote) => lote.lote != "" && lote.cantidad > 0
                          )
                          .map((lote) => (
                            <tr key={lote.id} className="border-b">
                              <td className="p-2">{lote.lote}</td>
                              <td className="text-center p-2">
                                {lote.cantidad}
                              </td>
                              <td className="text-center p-2">
                                {lote.vencimiento}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Depositos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Código</th>
                          <th className="text-center p-2">Descripción</th>
                          <th className="text-center p-2">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemSeleccionado.depositos
                          .filter(
                            (deposito) => deposito.stock > 0
                          )
                          .map((deposito) => (
                            <tr key={deposito.codigo} className="border-b">
                              <td className="p-2">{deposito.codigo}</td>
                              <td className="text-center p-2">
                                {deposito.descripcion}
                              </td>
                              <td className="text-center p-2">
                                {deposito.stock}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
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
          <div className={isMobile ? "w-full" : "flex flex-col gap-2 w-[60%] "}>
            {/* ########## FILTROS ########## */}
            <div
              className={
                "flex flex-col p-2 border border-gray-300 bg-gray-200 rounded-md h-[15%] py-4 justify-between"
              }
            >
              <div
                className={isMobile ? "flex flex-col" : "flex flex-row gap-8"}
              >
                <div
                  className={
                    isMobile
                      ? "flex flex-col gap-2 items-start flex-1"
                      : "flex flex-row gap-2 items-center flex-1"
                  }
                >
                  <p className="font-bold  text-lg">Sucursal:</p>
                  <Select
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
                <div
                  className={
                    isMobile
                      ? "flex flex-col gap-2 items-start flex-1"
                      : "flex flex-row gap-2 items-center flex-1"
                  }
                >
                  <p className="font-bold  text-lg">Depósito:</p>
                  <Select
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
                <div
                  className={
                    isMobile
                      ? "flex flex-col gap-2 items-start flex-1"
                      : "flex flex-row gap-2 items-center flex-1"
                  }
                >
                  <p className="font-bold  text-lg">Moneda:</p>
                  <Select
                    onChange={(e) =>
                      setMonedaSeleccionada(
                        monedas.find(
                          (moneda) =>
                            moneda.moCodigo === Number(e.target.value)
                        ) || null
                      )
                    }
                  >
                    {monedas.map((moneda) => (
                      <option key={moneda.moCodigo} value={moneda.moCodigo}>
                        {moneda.moDescripcion}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-row gap-2 items-center flex-1">
                  <Switch
                    onChange={(e) => setStock(e.target.checked)}
                    isChecked={stock}
                  />
                  <p
                    className={
                      isMobile
                        ? " font-bold  text-lg py-4"
                        : "font-bold  text-lg"
                    }
                  >
                    Mostrar todos los articulos
                  </p>
                </div>
              </div>
              <Input
                placeholder="Buscar"
                onChange={handleBusqueda}
                className="w-full"
                bg={"white"}
              />
            </div>
            {/* ########## TABLA ########## */}
            <div className="flex flex-row p-2 border border-gray-300 bg-white rounded-md h-full overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Código</th>
                    <th>Código de Barras</th>
                    <th>Descripción</th>
                    <th>Stock</th>

                    <th>P. Contado</th>
                    <th>P. Crédito</th>
                    <th>P. Mostrador</th>
                    <th>P. Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <Spinner />
                      </td>
                    </tr>
                  ) : (
                    articulos.map((articulo) => (
                      <tr
                        key={articulo.id_articulo}
                        className={`hover:bg-gray-100 cursor-pointer px-4 border h-10 ${
                          itemSeleccionado?.id_articulo === articulo.id_articulo
                            ? "bg-blue-200"
                            : ""
                        }`}
                        onClick={() => handleItemSeleccionado(articulo)}
                      >
                        <td className="border-r border-gray-300 px-2">
                          {articulo.id_articulo}
                        </td>
                        <td className="border-r border-gray-300 px-2">
                          {articulo.codigo_barra}
                        </td>
                        <td className="border-r border-gray-300 px-2">
                          {articulo.descripcion}
                        </td>
                        <td className="text-center border-r border-gray-300 px-2">
                          {articulo.stock}
                        </td>

                        <td className="text-right border-r border-gray-300 px-2">
                          {formatearNumero(articulo.precio_venta)}
                        </td>
                        <td className="text-right border-r border-gray-300 px-2">
                          {formatearNumero(articulo.precio_credito)}
                        </td>
                        <td className="text-right border-r border-gray-300 px-2">
                          {formatearNumero(articulo.precio_mostrador)}
                        </td>
                        <td className="text-right border-r border-gray-300 px-2">
                          {permisos_ver_costo === "1"
                            ? formatearNumero(articulo.precio_costo)
                            : "---"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* ########## DETALLE ########## */}
          {isMobile ? (
            <MobileDetailModal />
          ) : (
            <div className="flex flex-col p-4 gap-2 w-[40%] h-full bg-white rounded-md">
              {itemSeleccionado ? (
                loadingDetalle ? (
                  <div className="flex flex-col gap-2 w-full h-full bg-white rounded-md justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full h-full bg-white rounded-md ">
                    <div className="border border-gray-300 p-2 flex flex-col gap-2">
                      <h1 className="text-gray-500 text-lg font-bold">
                        {itemSeleccionado.id_articulo} -{" "}
                        {itemSeleccionado.descripcion}
                      </h1>
                    </div>
                    <div className="border flex flex-row p-2">
                      <div className="flex flex-col gap-2 w-[40%] items-center justify-center border border-gray-300">
                        <img
                          src={not_found}
                          alt="no-pictures"
                          className="w-[50%] h-full object-cover"
                        />
                        <p className="text-gray-500 text-sm font-thin text-center hover:text-blue-500 hover:underline cursor-pointer">
                          Subir Imagen
                        </p>
                      </div>
                      <div className="flex flex-col px-4  [&>p]:text-gray-500 [&>p]:text-md [&>p]:font-bold">
                        <p>Proveedor: {itemSeleccionado.proveedor_razon}</p>
                        <p>Marca: {itemSeleccionado.marca}</p>
                        <p>Categoria: {itemSeleccionado.categoria}</p>
                        <p>Subcategoria: {itemSeleccionado.subcategoria}</p>
                        <p>Ubicación: {itemSeleccionado.ubicacion}</p>
                        <p>Sububicación: {itemSeleccionado.sub_ubicacion}</p>
                        <p>
                          Fecha de última compra:{" "}
                          {itemSeleccionado.fecha_ultima_compra}
                        </p>
                        <p>
                          Fecha de última venta:{" "}
                          {itemSeleccionado.fecha_ultima_venta}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 h-[50%] overflow-y-auto border border-gray-300 rounded-md px-2">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="text-left">Lote</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-center">Vencimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemSeleccionado.lotes
                            .filter(
                              (lote) => lote.lote != "" && lote.cantidad > 0
                            )
                            .map((lote) => (
                              <tr key={lote.id}>
                                <td className="text-left">{lote.lote}</td>
                                <td className="text-center">{lote.cantidad}</td>
                                <td className="text-center">
                                  {lote.vencimiento}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-2 h-[50%] overflow-y-auto border border-gray-300 rounded-md px-2">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="text-left">Código</th>
                            <th className="text-left">Descripción</th>
                            <th className="text-center">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemSeleccionado.depositos
                            .filter((deposito) => deposito.stock > 0)
                            .map((deposito) => (
                              <tr key={deposito.codigo}>
                                <td className="text-left">{deposito.codigo}</td>
                                <td>{deposito.descripcion}</td>
                                <td className="text-center">
                                  {deposito.stock}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-2 w-full h-full bg-white rounded-md justify-center items-center">
                  <h1 className="text-gray-500 text-lg font-bold">
                    No hay artículo seleccionado
                  </h1>
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
