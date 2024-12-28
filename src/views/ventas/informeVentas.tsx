import {
  Articulo,
  Categoria,
  Ciudad,
  Cliente,
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
  Text,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import axios from "axios";
import { EyeIcon, EyeOff, FileChartColumnIncreasing } from "lucide-react";
import { useEffect, useState } from "react";

const InformeVentas = () => {
  const [horaDesde, setHoraHasta] = useState<string>("");
  const [horaHasta, setHoraDesde] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
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
  >(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);
  const [clienteSeleccionados, setClienteSeleccionados] = useState<
    number[] | null
  >(null);

  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedoresSeleccionados, setVendedoresSeleccionados] = useState<
    number[] | null
  >(null);

  const [vendedoresFiltrados, setVendedoresFiltrados] = useState(vendedores);

  const [tipoArticulo, setTipoArticulo] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[] | null
  >(null);

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<
    number[] | null
  >(null);

  const [marca, setMarca] = useState<Marca[]>([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<number | null>(
    null
  );

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesSeleccionadas, setCiudadesSeleccionadas] = useState<
    number[] | null
  >(null);

  const [condiciones, setCondiciones] = useState<number | null>(null);

  const [situaciones, setSituaciones] = useState<number | null>(null);

  const [tipoMovimiento, setTipoMovimiento] = useState<number | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    number[] | null
  >(null);

  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedasSeleccionadas, setMonedasSeleccionadas] = useState<
    number[] | null
  >(null);

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
    useState<number>(0);
  const [deducirDescuentoSobreVenta, setDeducirDescuentoSobreVenta] =
    useState<number>(0);
  const [soloResumen, setSoloResumen] = useState<number>(0);

  const [ordenAsc, setOrdenAsc] = useState<boolean>(false);
  const [infDesgIVA, setInfDesgIVA] = useState<boolean>(false);
  const [desglosadoXFactura, setDesglosadoXFactura] = useState<boolean>(false);
  const [totalesDeProd, setTotalesDeProd] = useState<boolean>(false);
  const [agruparXPeriodo, setAgruparXPeriodo] = useState<boolean>(false);
  const [totalizarArt, setTotalizarArt] = useState<boolean>(false);
  const [informeBonif, setInformeBonif] = useState<boolean>(false);

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

  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      console.log(response.data.body);
      setSucursales(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepositos = async () => {
    try {
      const response = await axios.get(`${api_url}depositos/`);
      console.log(response.data.body);
      setDepositos(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${api_url}categorias/`);
      console.log(response.data.body);
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
  }, []);

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
                  <option value={1}>Contado</option>
                  <option value={0}>Crédito</option>
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
                <Select>
                  <option value={1}>Precio de costo real</option>
                  <option value={1}>Precio de costo promedio</option>
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
                      >
                        Nro. de factura
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
            </Flex>
          </Box>
        )}
        <Flex
          border={"1px solid #ccc"}
          p={2}
          borderRadius={8}
          overflowY={"auto"}
          flexDir={"column"}
          flexGrow={1}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th>F. Venta</th>
                <th>Cod. Barra</th>
                <th>Descripcion</th>
                <th>P. Costo</th>
                <th>P. de Venta</th>
                <th>Unid. Vendida</th>
                <th>Exentas</th>
                <th>IVA 5%</th>
                <th>IVA 10%</th>
                <th>% Util. s/Venta</th>
                <th>Sub-Total</th>
                <th>V/B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01/01/2021</td>
                <td>123456</td>
                <td>Producto de prueba</td>
                <td>1000</td>
                <td>1500</td>
                <td>10</td>
                <td>0</td>
                <td>0</td>
                <td>150</td>
                <td>50%</td>
                <td>15000</td>
                <td>1</td>
              </tr>
              </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}></td>
                <td>Total Unid. Vendida</td>
                <td>Total Exentas</td>
                <td>Total IVA 5%</td>
                <td>Total IVA 10%</td>
                <td></td>
                <td>Total Sub-Total</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
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
            py={8}
            borderRadius={4}
            w={isMobile ? "100%" : "80%"}
            color={"white"}
            display={isMobile ? "flex" : "grid"}
            flexDir={"column"}
            gridTemplateColumns={"repeat(4, 1fr)"}
            gap={2}
          >
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Neto Venta:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Costos Directo:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc. Factura:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Margen en % S/V Neta:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Neto NC. Desc./Conc.:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Util. en Monto:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc. Items:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Margen en % S/V. Bruta:
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"50%"}></Box>
            </Flex>
            <Flex
              gap={2}
              alignItems={"center"}
              justifyContent={"flex-end"}
              gridColumn={"span 4"}
            >
              <Text fontWeight={"bold"} fontSize={isMobile ? "sm" : "lg"}>
                Total Desc.
              </Text>
              <Box bg={"white"} p={4} borderRadius={4} minW={"12.3%"}></Box>
            </Flex>
          </Box>
          <Box
            p={2}
            borderRadius={4}
            w={isMobile ? "100%" : "20%"}
            color={"white"}
          >
            <Box display={"flex"} flexDirection={"column"} gap={1}>
              <Text
                fontWeight={"bold"}
                fontSize={isMobile ? "sm" : "lg"}
                color={"black"}
              >
                Obs:
              </Text>
              <Flex gap={4}>
              <Box p={4} borderRadius={"md"} bg={"gray.200"}></Box>
                <Text fontSize={isMobile ? "sm" : "lg"} color={"black"}>
                  Indica utilidad S/V menor al 20%
                </Text>
              </Flex>
              <Flex gap={4}>
                <Box p={4} borderRadius={"md"} bg={"yellow.200"}></Box>
                <Text fontSize={isMobile ? "sm" : "lg"} color={"black"}>
                  Indica utilidad S/V mayor al 70%
                </Text>
              </Flex>
              <Flex gap={4}>
              <Box p={4} borderRadius={"md"} bg={"red.200"}></Box>
                <Text fontSize={isMobile ? "sm" : "lg"} color={"black"}>
                  Indica utilidad S/V en pérdida
                </Text>
              </Flex>
              <Flex gap={4}>
              <Box p={4} borderRadius={"md"} bg={"blue.200"}></Box>
                <Text fontSize={isMobile ? "sm" : "lg"} color={"black"}>
                  Opción utilidad S/V positivo
                </Text>
              </Flex>
            </Box>
            <Flex gap={2} mt={2}>
              <Button colorScheme={"blue"} w={'50%'}>Imprimir</Button>
              <Button colorScheme={"green"} w={'50%'}>Procesar</Button>
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
                    marcasSeleccionadas === marca.ma_codigo
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() => setMarcasSeleccionadas(marca.ma_codigo)}
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
                    monedasSeleccionadas?.includes(moneda.mo_codigo) ?? false
                      ? "blue.100"
                      : "gray.100"
                  }
                  borderRadius={8}
                  cursor={"pointer"}
                  onClick={() =>
                    setMonedasSeleccionadas((prevSeleccionados) => {
                      if (prevSeleccionados === null) {
                        return [moneda.mo_codigo];
                      }
                      if (prevSeleccionados.includes(moneda.mo_codigo)) {
                        return prevSeleccionados.filter(
                          (id) => id !== moneda.mo_codigo
                        );
                      } else {
                        return [...prevSeleccionados, moneda.mo_codigo];
                      }
                    })
                  }
                >
                  {moneda.mo_descripcion}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter display={"flex"} gap={4}>
            <Button
              colorScheme={"red"}
              onClick={() => setMonedasSeleccionadas(null)}
            >
              Cancelar
            </Button>
            <Button colorScheme={"green"} onClick={onMonedaModalClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InformeVentas;
