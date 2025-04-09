import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  VStack,
  Heading,
  useMediaQuery,
  useToast,
  Spinner,
  Text,
  Button,
  useDisclosure,
  Input,
  Select,
} from "@chakra-ui/react";
import { Archive, Eye } from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { api_url } from "@/utils";
import axios from "axios";
import {
  Deposito,
  Subcategoria,
  Marca,
  Ubicacion,
  Proveedor,
  Categoria,
  Moneda,
  UnidadMedida,
} from "@/types/shared_interfaces";
import { ModalMultiselector } from "@/modules/ModalMultiselector";

interface PaginacionResponse {
  datos: Articulo[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    paginas: number;
  };
}

interface Articulo {
  codigo_articulo: number;
  codigo_barra: string;
  descripcion_articulo: string;
  precio_compra: number;
  precio_venta: number;
  precio_venta_credito: number;
  precio_venta_mostrador: number;
  precio_venta_4: number;
  proveedor: number;
  marca: number;
  categoria: number;
  subcategoria: number;
  ubicacion: number;
  moneda: number;
  unidad_medida: number;
  stock_actual: number;
  stock_minimo: number;
  deposito: string;
  lote: number;
  vencimiento: string;
}

const GestionInventario: React.FC = () => {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [depositosSeleccionados, setDepositosSeleccionados] = useState<
    number[]
  >([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] = useState<
    number[]
  >([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[]
  >([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<
    number[]
  >([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<
    number[]
  >([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedasSeleccionadas, setMonedasSeleccionadas] = useState<number[]>(
    []
  );
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [unidadesMedidaSeleccionadas, setUnidadesMedidaSeleccionadas] =
    useState<number[]>([]);

  const [estadoDeStock, setEstadoDeStock] = useState<number>(1);

  const [tipoValorizacionCosto, setTipoValorizacionCosto] = useState<
    number | null
  >(1);

  const [stringBusqueda, setStringBusqueda] = useState<string | null>(null);
  const [numeroDePaginas, setNumeroDePaginas] = useState<number>(1);
  const [paginaActual, setPaginaActual] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cargaInicial, setCargaInicial] = useState(true);

  const [limiteArticulosPorPagina] = useState<number>(50);

  const toast = useToast();
  const { auth } = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const verProveedor = auth?.permisoVerProveedor;
  const verCostos = auth?.permisoVerUtilidad;

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const {
    isOpen: isOpenModalDeposito,
    onOpen: onOpenModalDeposito,
    onClose: onCloseModalDeposito,
  } = useDisclosure();


  const {
    isOpen: isOpenModalUbicacion,
    onOpen: onOpenModalUbicacion,
    onClose: onCloseModalUbicacion,
  } = useDisclosure();

  const {
    isOpen: isOpenModalMarca,
    onOpen: onOpenModalMarca,
    onClose: onCloseModalMarca,
  } = useDisclosure();

  const {
    isOpen: isOpenModalCategoria,
    onOpen: onOpenModalCategoria,
    onClose: onCloseModalCategoria,
  } = useDisclosure();

  const {
    isOpen: isOpenModalSubcategoria,
    onOpen: onOpenModalSubcategoria,
    onClose: onCloseModalSubcategoria,
  } = useDisclosure();

  const {
    isOpen: isOpenModalProveedor,
    onOpen: onOpenModalProveedor,
    onClose: onCloseModalProveedor,
  } = useDisclosure();

  const {
    isOpen: isOpenModalMoneda,
    onOpen: onOpenModalMoneda,
    onClose: onCloseModalMoneda,
  } = useDisclosure();

  const {
    isOpen: isOpenModalUnidadMedida,
    onOpen: onOpenModalUnidadMedida,
    onClose: onCloseModalUnidadMedida,
  } = useDisclosure();

  const fetchArticulos = async (busqueda: string | null = null) => {
    setIsLoading(true);

    try {
      console.log(
        'ENVIANDO FETCHING DE DATOS',
        {
          busqueda: busqueda,
          deposito: depositosSeleccionados.length
            ? depositosSeleccionados[0]
            : null,
          stock: estadoDeStock === 2 ? null : estadoDeStock,
          marca: marcasSeleccionadas.length ? marcasSeleccionadas[0] : null,
          categoria: categoriasSeleccionadas.length
            ? categoriasSeleccionadas[0]
            : null,
          subcategoria: subcategoriasSeleccionadas.length
            ? subcategoriasSeleccionadas[0]
            : null,
          proveedor: proveedoresSeleccionados.length
            ? proveedoresSeleccionados[0]
            : null,
          ubicacion: ubicacionesSeleccionadas.length
            ? ubicacionesSeleccionadas[0]
            : null,
          moneda: monedasSeleccionadas.length
            ? monedasSeleccionadas[0]
            : null,
          unidadMedida: unidadesMedidaSeleccionadas.length
            ? unidadesMedidaSeleccionadas[0]
            : null,
          tipoValorizacionCosto: tipoValorizacionCosto,
          pagina: paginaActual,
          limite: limiteArticulosPorPagina,
            
        }
      )
      const response = await axios.get<{ body: PaginacionResponse }>(
        `${api_url}articulos/todos`,
        {
          params: {
            busqueda: busqueda,
            deposito: depositosSeleccionados.length
              ? depositosSeleccionados[0]
              : null,
            stock:  estadoDeStock,
            marca: marcasSeleccionadas.length ? marcasSeleccionadas[0] : null,
            categoria: categoriasSeleccionadas.length
              ? categoriasSeleccionadas[0]
              : null,
            subcategoria: subcategoriasSeleccionadas.length
              ? subcategoriasSeleccionadas[0]
              : null,
            proveedor: proveedoresSeleccionados.length
              ? proveedoresSeleccionados[0]
              : null,
            ubicacion: ubicacionesSeleccionadas.length
              ? ubicacionesSeleccionadas[0]
              : null,
            moneda: monedasSeleccionadas.length
              ? monedasSeleccionadas[0]
              : null,
            unidadMedida: unidadesMedidaSeleccionadas.length
              ? unidadesMedidaSeleccionadas[0]
              : null,
            tipoValorizacionCosto: tipoValorizacionCosto,
            pagina: paginaActual,
            limite: limiteArticulosPorPagina,
          },
        }
      );
      console.log('datos', response.data.body);
      setArticulos(response.data.body.datos);
      setNumeroDePaginas(response.data.body.paginacion.paginas);
    } catch (error) {
      setIsError(true);
      toast({
        title: "Error",
        description: "Error al cargar los artículos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepositos = async () => {
      if (!auth) {
        toast({
          title: "Error de autenticación",
          description: "No estás autentificado",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      try {
        const response = await axios.get(`${api_url}depositos/`);
        setDepositos(response.data.body);
      } catch (err) {
        toast({
          title: "Error",
          description: "Hubo un problema al traer los depósitos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchDepositos();
  }, [auth, toast]);

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [
          marcasRes,
          subcatRes,
          categoriasRes,
          proveedoresRes,
          ubicacionesRes,
          monedasRes,
          unidadesMedidaRes,
        ] = await Promise.all([
          axios.get(`${api_url}marcas/`),
          axios.get(`${api_url}subcategorias/`),
          axios.get(`${api_url}categorias/`),
          axios.get(`${api_url}proveedores/`),
          axios.get(`${api_url}ubicaciones/`),
          axios.get(`${api_url}monedas/`),
          axios.get(`${api_url}unidadmedidas/`),
        ]);
        setMarcas(marcasRes.data.body);
        setSubcategorias(subcatRes.data.body);
        setCategorias(categoriasRes.data.body);
        setProveedores(proveedoresRes.data.body);
        setUbicaciones(ubicacionesRes.data.body);
        setMonedas(monedasRes.data.body);
        setUnidadesMedida(unidadesMedidaRes.data.body);
        setCargaInicial(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar filtros",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchFiltros();
  }, []);

  useEffect(() => {
    if (!cargaInicial) {
      fetchArticulos();
    }
  }, [
    depositosSeleccionados,
    estadoDeStock,
    marcasSeleccionadas,
    categoriasSeleccionadas,
    subcategoriasSeleccionadas,
    proveedoresSeleccionados,
    ubicacionesSeleccionadas,
    monedasSeleccionadas,
    unidadesMedidaSeleccionadas,
    paginaActual,
    limiteArticulosPorPagina,
    tipoValorizacionCosto,
    cargaInicial
  ]);

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
        overflowY={"auto"}
        maxH={"calc(100vh - 1rem)"}
      >
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={isMobile ? 4 : 6}
          alignItems="center"
          rounded="lg"
        >
          <Archive size={32} className="mr-2" />
          <Heading size={isMobile ? "sm" : "md"}>Consulta de articulos</Heading>
          <Button
            className="ml-auto"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Eye size={24} />
          </Button>
        </Flex>
        {mostrarFiltros && (
          <Flex className="gap-x-2" flexDir={isMobile ? "column" : "row"}>
            <Box className=" flex flex-col gap-y-2">
              <Flex
                className={`${isMobile ? "gap-y-2" : "gap-x-2"}`}
                flexDir={isMobile ? "column" : "row"}
              >
                <Input
                  placeholder="Seleccionar depósito"
                  readOnly
                  onClick={onOpenModalDeposito}
                />
                <Input
                  placeholder="Seleccionar ubicación"
                  readOnly
                  onClick={onOpenModalUbicacion}
                />
                <Input
                  placeholder="Seleccionar marca"
                  readOnly
                  onClick={onOpenModalMarca}
                />
                <Input
                  placeholder="Seleccionar categoría"
                  readOnly
                  onClick={onOpenModalCategoria}
                />
                <Input
                  placeholder="Seleccionar subcategoría"
                  readOnly
                  onClick={onOpenModalSubcategoria}
                />
                <Input
                  placeholder="Seleccionar proveedor"
                  readOnly
                  onClick={onOpenModalProveedor}
                />
                <Input
                  placeholder="Seleccionar moneda"
                  readOnly
                  onClick={onOpenModalMoneda}
                />
              </Flex>
              <Flex
                className={`${isMobile ? "gap-y-2" : "gap-x-2"}`}
                flexDir={isMobile ? "column-reverse" : "row"}
              >
                <Flex
                  flex={1}
                  className={`${isMobile ? "gap-y-2 gap-x-2" : "gap-x-2"}`}
                >
                  <Input
                    placeholder="Buscar articulo"
                    onChange={(e) => setStringBusqueda(e.target.value)}
                  />
                  <Button
                    colorScheme="green"
                    onClick={() => fetchArticulos(stringBusqueda)}
                  >
                    Buscar
                  </Button>
                </Flex>
                <Input
                  w={isMobile ? "100%" : "25%"}
                  placeholder="Seleccionar unidad de medida"
                  readOnly
                  onClick={onOpenModalUnidadMedida}
                />
              </Flex>
            </Box>
            <Box className="border border-gray-200 rounded-md p-2">
              <p>Estado de stock</p>
              <Select
                value={estadoDeStock}
                onChange={(e) => setEstadoDeStock(Number(e.target.value))}
              >
                <option value={2}>Todos</option>
                <option value={1}>Stock positivo</option>
                <option value={-1}>Stock negativo</option>
                <option value={0}>Stock cero</option>
              </Select>
            </Box>
            <Box
              display={isMobile ? "flex" : "block"}
              flexDirection={isMobile ? "column" : "row"}
              gap={2}
              w={isMobile ? "100%" : "250px"}
              className="border border-gray-200 rounded-md p-2"
            >
              <p>Tipo de valorización de costo</p>
              <Select
                w={isMobile ? "100%" : "fit-content"}
                onChange={(e) =>
                  setTipoValorizacionCosto(Number(e.target.value))
                }
              >
                <option value="1">Costo Promedio</option>

                <option value="2">Ultimo costo</option>
              </Select>
            </Box>
          </Flex>
        )}
        {isLoading ? (
          <Flex justify="center" p={4} height={isMobile ? "90vh" : "750px"}>
            <Spinner />
          </Flex>
        ) : isError ? (

          <Box p={4} textAlign="center" color="red.500">
            <Text>Error al cargar los artículos</Text>
          </Box>
        ) : !articulos.length ? (
          <Box p={4} textAlign="center" color="gray.500">
            No se encontraron artículos
          </Box>
        ) : (
          <Box overflowX="auto" height={isMobile ? "90vh" : "750px"}>
            <table className="table-auto w-full">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-200">
                <tr>

                  <th className="px-4 py-2 whitespace-nowrap min-w-[150px]  border border-gray-200">
                    Codigo de barras
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[200px] border border-gray-200">
                    Descripcion
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Stock Minimo
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Stock Actual
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Lote
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Vencimiento
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Precio Compra
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[150px] border border-gray-200">
                    P. Contado
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[150px] border border-gray-200">
                    P. Credito
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[150px] border border-gray-200">
                    P. Mostrador
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Precio 4
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Deposito
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Marca
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Categoria
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Subcategoria
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                    Proveedor
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Ubicacion
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                    Moneda
                  </th>
                  <th className="px-4 py-2 whitespace-nowrap min-w-[150px] border border-gray-200">
                    Unidad de Medida
                  </th>
                </tr>
              </thead>
              <tbody>
                {articulos.map((articulo) => (
                  <tr key={articulo.lote} className="border border-gray-200">
                    <td className="px-4 py-2 whitespace-nowrap min-w-[150px] border border-gray-200">
                      {articulo.codigo_barra}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap min-w-[200px] border border-gray-200">
                      {articulo.descripcion_articulo}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200 text-center">
                      {articulo.stock_minimo}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200 text-center">
                      {articulo.stock_actual}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200 ">
                      {articulo.lote}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                      {articulo.vencimiento}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] text-right border border-gray-200">
                      {verCostos === 1? articulo.precio_compra : "---"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[150px] text-right border border-gray-200">
                      {articulo.precio_venta}

                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[150px] text-right border border-gray-200">
                      {articulo.precio_venta_credito}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[150px] text-right border border-gray-200">
                      {articulo.precio_venta_mostrador}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] text-right border border-gray-200">
                      {articulo.precio_venta_4}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                      {articulo.deposito}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                      {articulo.marca}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                      {articulo.categoria}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                      {articulo.subcategoria}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[120px] border border-gray-200">
                      {verProveedor === 1 ? articulo.proveedor : "---"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] border border-gray-200">
                      {articulo.ubicacion}

                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[100px] text-center border border-gray-200">
                      {articulo.moneda}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[150px] text-center border border-gray-200">
                      {articulo.unidad_medida}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
        <Flex justify="center" mt={4} gap={2}>
          <Button
            colorScheme="blue"
            onClick={() => setPaginaActual(1)}
            isDisabled={paginaActual === 1}
          >
            ⟪
          </Button>

          <Button
            colorScheme="blue"
            onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
            isDisabled={paginaActual === 1}
          >
            ←
          </Button>

          <Text alignSelf="center">
            Página {paginaActual} de {numeroDePaginas}
          </Text>

          <Button
            colorScheme="blue"
            onClick={() =>
              setPaginaActual((prev) => Math.min(numeroDePaginas, prev + 1))
            }
            isDisabled={paginaActual === numeroDePaginas}
          >
            →
          </Button>

          <Button
            colorScheme="blue"
            onClick={() => setPaginaActual(numeroDePaginas)}
            isDisabled={paginaActual === numeroDePaginas}
          >
            ⟫
          </Button>
        </Flex>
      </VStack>
      <ModalMultiselector
        isOpen={isOpenModalDeposito}
        onClose={onCloseModalDeposito}
        title="Seleccionar depósito"
        items={depositos}
        onSearch={() => {}}
        onSelect={(item) => {
          setDepositosSeleccionados((prev) => {
            const exists = prev.includes(item.dep_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.dep_codigo);
            }
            return [...prev, item.dep_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalDeposito();
        }}
        idField="dep_codigo"
        displayField="dep_descripcion"
        searchPlaceholder="Buscar depósito"
        selectedItems={depositos.filter((d) =>
          depositosSeleccionados.includes(d.dep_codigo)
        )}
      />
      <ModalMultiselector
        isOpen={isOpenModalUbicacion}
        onClose={onCloseModalUbicacion}
        title="Seleccionar ubicación"
        items={ubicaciones}
        onSearch={(busqueda) => {
          const ubicacionesFiltradas = ubicaciones.filter(ubicacion => 
            ubicacion.ub_descripcion.toLowerCase().includes(busqueda.toLowerCase())
          );
          return ubicacionesFiltradas;
        }}
        onSelect={(item) => {
          setUbicacionesSeleccionadas((prev) => {
            const exists = prev.includes(item.ub_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.ub_codigo);
            }
            return [...prev, item.ub_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalUbicacion();
        }}
        idField="ub_codigo"
        displayField="ub_descripcion"
        searchPlaceholder="Buscar ubicación"
        selectedItems={ubicacionesSeleccionadas.map((codigo) => ({
          ub_codigo: codigo,
          ub_descripcion:
            ubicaciones.find((u) => u.ub_codigo === codigo)?.ub_descripcion ||
            "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalMarca}
        onClose={onCloseModalMarca}
        title="Seleccionar marca"
        items={marcas}
        onSearch={() => {}}
        onSelect={(item) => {
          setMarcasSeleccionadas((prev) => {
            const exists = prev.includes(item.ma_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.ma_codigo);
            }
            return [...prev, item.ma_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalMarca();
        }}
        idField="ma_codigo"
        displayField="ma_descripcion"
        searchPlaceholder="Buscar marca"
        selectedItems={marcasSeleccionadas.map((codigo) => ({
          ma_codigo: codigo,
          ma_descripcion:
            marcas.find((m) => m.ma_codigo === codigo)?.ma_descripcion || "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalCategoria}
        onClose={onCloseModalCategoria}
        title="Seleccionar categoría"
        items={categorias}
        onSearch={() => {}}
        onSelect={(item) => {
          setCategoriasSeleccionadas((prev) => {
            const exists = prev.includes(item.ca_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.ca_codigo);
            }
            return [...prev, item.ca_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalCategoria();
        }}
        idField="ca_codigo"
        displayField="ca_descripcion"
        searchPlaceholder="Buscar categoría"
        selectedItems={categoriasSeleccionadas.map((codigo) => ({
          ca_codigo: codigo,
          ca_descripcion:
            categorias.find((c) => c.ca_codigo === codigo)?.ca_descripcion ||
            "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalSubcategoria}
        onClose={onCloseModalSubcategoria}
        title="Seleccionar subcategoría"
        items={subcategorias}
        onSearch={() => {}}
        onSelect={(item) => {
          setSubcategoriasSeleccionadas((prev) => {
            const exists = prev.includes(item.sc_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.sc_codigo);
            }
            return [...prev, item.sc_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalSubcategoria();
        }}
        idField="sc_codigo"
        displayField="sc_descripcion"
        searchPlaceholder="Buscar subcategoría"
        selectedItems={subcategoriasSeleccionadas.map((codigo) => ({
          sc_codigo: codigo,
          sc_descripcion:
            subcategorias.find((s) => s.sc_codigo === codigo)?.sc_descripcion ||
            "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalProveedor}
        onClose={onCloseModalProveedor}
        title="Seleccionar proveedor"
        items={proveedores}
        onSearch={() => {}}
        onSelect={(item) => {
          setProveedoresSeleccionados((prev) => {
            const exists = prev.includes(item.pro_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.pro_codigo);
            }
            return [...prev, item.pro_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalProveedor();
        }}
        idField="pro_codigo"
        displayField="pro_razon"
        searchPlaceholder="Buscar proveedor"
        selectedItems={proveedoresSeleccionados.map((codigo) => ({
          pro_codigo: codigo,
          pro_razon:
            proveedores.find((p) => p.pro_codigo === codigo)?.pro_razon || "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalMoneda}
        onClose={onCloseModalMoneda}
        title="Seleccionar moneda"
        items={monedas}
        onSearch={() => {}}
        onSelect={(item) => {
          setMonedasSeleccionadas((prev) => {
            const exists = prev.includes(item.mo_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.mo_codigo);
            }
            return [...prev, item.mo_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalMoneda();
        }}
        idField="mo_codigo"
        displayField="mo_descripcion"
        searchPlaceholder="Buscar moneda"
        selectedItems={monedasSeleccionadas.map((codigo) => ({
          mo_codigo: codigo,
          mo_descripcion:
            monedas.find((m) => m.mo_codigo === codigo)?.mo_descripcion || "",
        }))}
      />
      <ModalMultiselector
        isOpen={isOpenModalUnidadMedida}
        onClose={onCloseModalUnidadMedida}
        title="Seleccionar unidad de medida"
        items={unidadesMedida}
        onSearch={() => {}}
        onSelect={(item) => {
          setUnidadesMedidaSeleccionadas((prev) => {
            const exists = prev.includes(item.um_codigo);
            if (exists) {
              return prev.filter((codigo) => codigo !== item.um_codigo);
            }
            return [...prev, item.um_codigo];
          });
        }}
        onConfirm={() => {
          onCloseModalUnidadMedida();
        }}
        idField="um_codigo"
        displayField="um_descripcion"
        searchPlaceholder="Buscar unidad de medida"
        selectedItems={unidadesMedidaSeleccionadas.map((codigo) => ({
          um_codigo: codigo,
          um_descripcion:
            unidadesMedida.find((u) => u.um_codigo === codigo)
              ?.um_descripcion || "",
        }))}
      />
    </Box>
  );
};

export default GestionInventario;
