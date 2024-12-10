import { Articulo, Deposito, Sucursal } from "@/types/shared_interfaces";
import {
  Flex,
  Box,
  useToast,
  FormLabel,
  Select,
  Input,
  Text,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Heading,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  ArchiveRestore,
  Menu,
  Barcode,
  Box as LucideBox,
  Calendar,
  DollarSign,
  Info,
  Tag,
  Plus,
} from "lucide-react";
import axios from "axios";
import { api_url } from "@/utils";

const TomaDeInventario = () => {

  const [codigoNuevo, setCodigoNuevo] = useState<number>(0);
  const [descripcionNuevo, setDescripcionNuevo] = useState<string>("");
  const [codigoBarraNuevo, setCodigoBarraNuevo] = useState<string>("");
  const [descripcionGenericaNuevo, setDescripcionGenericaNuevo] = useState<string>("");
  const [presentacionNuevo, setPresentacionNuevo] = useState<string>("");
  const [modeloNuevo, setModeloNuevo] = useState<string>("");
  const [cantidadCajaNuevo, setCantidadCajaNuevo] = useState<number>(0);
  const [kilosNuevo, setKilosNuevo] = useState<number>(0);
  const [marcaNuevo, setMarcaNuevo] = useState<string>("");
  const [paisOrigenNuevo, setPaisOrigenNuevo] = useState<number>(0);
  const [unidadMedidaNuevo, setUnidadMedidaNuevo] = useState<number>(0);
  const [ubicacionNuevo, setUbicacionNuevo] = useState<number>(0);
  const [subUbicacionNuevo, setSubUbicacionNuevo] = useState<number>(0);
  const [categoriaNuevo, setCategoriaNuevo] = useState<number>(0);
  const [subCategoriaNuevo, setSubCategoriaNuevo] = useState<number>(0);
  const [bloqueNuevo, setBloqueNuevo] = useState<string>("");
  const [dvlNuevo, setDvlNuevo] = useState<number>(0);
  const [monedaNuevo, setMonedaNuevo] = useState<number>(0);
  const [ivaNuevo, setIvaNuevo] = useState<number>(0);
  const [fabricanteNuevo, setFabricanteNuevo] = useState<number>(0);
  const [stockMinimoNuevo, setStockMinimoNuevo] = useState<number>(0);
  const [numeroSerieNuevo, setNumeroSerieNuevo] = useState<number>(0);
  const [costoGuaraniNuevo, setCostoGuaraniNuevo] = useState<number>(0);
  const [precioContadoNuevo, setPrecioContadoNuevo] = useState<number>(0);
  const [precioCreditoNuevo, setPrecioCreditoNuevo] = useState<number>(0);
  const [precioMostradorNuevo, setPrecioMostradorNuevo] = useState<number>(0);
  const [precio4Nuevo, setPrecio4Nuevo] = useState<number>(0);

  //states para arrays

  const [marcas, setMarcas] = useState<[]>([]);
  const [paises, setPaises] = useState<[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<[]>([]);
  const [ubicaciones, setUbicaciones] = useState<[]>([]);
  const [subUbicaciones, setSubUbicaciones] = useState<[]>([]);
  const [categorias, setCategorias] = useState<[]>([]);
  const [subCategorias, setSubCategorias] = useState<[]>([]);
  const [monedas, setMonedas] = useState<[]>([]);
  const [fabricantes, setFabricantes] = useState<[]>([]);
  const [cotizacionDolar, setCotizacionDolar]= useState<number>(7770)
  const [cotizacionReal, setCotizacionReal] = useState<number>(1200)
  const [cotizacionPeso, setCotizacionPeso] = useState<number>(5)


  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [sucursal, setSucursal] = useState<(typeof sucursales)[0]>();
  const [deposito, setDeposito] = useState<(typeof depositos)[0]>();
  const [articuloBusqueda, setArticuloBusqueda] = useState<string>("");
  const [, setRecomendaciones] = useState<(typeof articulos)[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo>();
  const toast = useToast();
  const [articuloCodigo, setArticuloCodigo] = useState<Number>(0);
  const [costoNuevo, setCostoNuevo] = useState<number>(0);
  const [precioNuevo, setPrecioNuevo] = useState<number>(0);
  const [existenciaFisica, setExistenciaFisica] = useState<number>(0);
  const [existenciaActual, setExistenciaActual] = useState<number>(0);
  const [lote, setLote] = useState<string>("");
  const [vencimiento, setVencimiento] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<
    Articulo[]
  >([]);
  const [codigoBarra, setCodigoBarra] = useState<string>("");
  const operadorActual = Number(localStorage.getItem("user_id"));
  const [codigoArticuloSeleccionado, setCodigoArticuloSeleccionado] = useState<
    number | null
  >(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    "Definicion",
    "Listas de Precios",
    "Desglose por caja",
    "Ensamble",
    "Historico",
    "Compra/venta",
    "Varios",
  ];
  // const [itemsGuardados, setItemsGuardados] = useState<Articulo[]>([]);

  
  const fetchCotizaciones = async () => {
    try {
      const response = await axios.get(`${api_url}cotizaciones/`);
      console.log('Cotizaciones',response.data.body)
      setCotizacionDolar(response.data.body[0].usd_venta)
      setCotizacionPeso(response.data.body[0].ars_venta)
      setCotizacionReal(response.data.body[0].brl_venta)
    } catch(err) {
      console.log(err)
    }
  }


  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${api_url}marcas/`);
      setMarcas(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchPaises = async () => {
    try {
      const response = await axios.get(`${api_url}paises/`);
      setPaises(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUnidadesMedida = async () => {
    try {
      const response = await axios.get(`${api_url}unidadmedidas/`);
      setUnidadesMedida(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}ubicaciones/`);
      setUbicaciones(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchSubUbicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}sububicaciones/`);
      setSubUbicaciones(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${api_url}categorias/`);
      setCategorias(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchSubCategorias = async () => {
    try {
      const response = await axios.get(`${api_url}subcategorias/`);
      setSubCategorias(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${api_url}monedas/`);
      setMonedas(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchFabricantes = async () => {
    try {
      const response = await axios.get(`${api_url}fabricantes/`);
      setFabricantes(response.data.body);
    } catch (error) {
      console.log(error);
    }
  }





  const fetchSucursales = async () => {
    try {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursales(response.data.body);
      if (response.data.body.length > 0) {
        setSucursal(response.data.body[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDepositos = async () => {
    try {
      const response = await axios.get(`${api_url}depositos/`);
      setDepositos(response.data.body);
      if (response.data.body.length > 0) {
        setDeposito(response.data.body[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setArticuloBusqueda(busqueda);
    buscarArticuloPorCodigo(busqueda);
  };

  const buscarArticuloPorCodigo = async (codigo: string) => {
    if (codigo.length === 0) {
      setRecomendaciones([]);
      setArticulos([]);
      return;
    }

    try {
      // Limpiar el estado antes de realizar la búsqueda
      setRecomendaciones([]);
      setArticulos([]);

      const response = await axios.get(`${api_url}articulos/`, {
        params: {
          buscar: codigo,
          id_deposito: parseInt(deposito?.dep_codigo.toString() || "1"),
        },
      });

      console.log(response.data.body);
      setRecomendaciones((prevRecomendaciones) => [
        ...prevRecomendaciones,
        ...response.data.body,
      ]);
      setArticulos((prevArticulos) => [
        ...prevArticulos,
        ...response.data.body,
      ]);
    } catch (error) {
      console.error("Error al buscar artículos:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al buscar los artículos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setRecomendaciones([]);
      setArticulos([]);
    }
  };

  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
  }, []);

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaObj.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
    }).format(monto);
  };

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    setArticuloCodigo(articulo.ar_codigo);
    setCostoNuevo(articulo.ar_pcg);
    setPrecioNuevo(articulo.ar_pvg);
    setExistenciaActual(articulo.al_cantidad);
    setExistenciaFisica(articulo.al_cantidad);
    setLote(articulo.al_codigo.toString());
    setCodigoBarra(articulo.ar_codbarra);
    setArticulosSeleccionados((prev) => [...prev, articulo]);
    onOpen();
  };

  const handleGuardarArticulo = () => {
    if (!articuloSeleccionado) {
      toast({
        title: "Error",
        description: "No hay ningún artículo seleccionado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (existenciaFisica < 0) {
      toast({
        title: "Error",
        description: "La existencia física no puede ser menor a 0.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (existenciaFisica === 0) {
      toast({
        title: "Error",
        description: "La existencia física no puede ser igual a 0.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!vencimiento || vencimiento === "") {
      toast({
        title: "Error",
        description: "La fecha de vencimiento no puede estar vacía.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const articuloEditado = {
      ...articuloSeleccionado,
      al_cantidad: existenciaActual,
      existenciaFisica,
      al_vencimiento: vencimiento,
      ar_pcg: costoNuevo,
      ar_pvg: precioNuevo,
      lote,
      ar_codbarra: codigoBarra,
      observaciones,
    };

    setArticulosSeleccionados((prev) => {
      const existe = prev.find(
        (art) => art.ar_codigo === articuloEditado.ar_codigo
      );
      if (existe) {
        return prev.map((art) =>
          art.ar_codigo === articuloEditado.ar_codigo ? articuloEditado : art
        );
      } else {
        return [...prev, articuloEditado];
      }
    });

    onClose();
  };

  const cargarInventario = async () => {
    try {
      if (!articulosSeleccionados.length) {
        toast({
          title: "Error",
          description: "No hay artículos para cargar",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const inventarioData = {
        inventario: {
          fecha,
          hora: new Date().toLocaleTimeString().slice(0, 5),
          operador: operadorActual,
          sucursal: sucursal?.id,
          deposito: deposito?.dep_codigo,
          tipo: 1,
          estado: 1,
          in_obs: observaciones || "",
          nro_inventario: 4567,
        },
        inventario_items: articulosSeleccionados.map((item) => ({
          idArticulo: item.ar_codigo,
          cantidad: Number(existenciaFisica),
          costo: Number(item.ar_pcg),
          stock_actual: Number(existenciaActual),
          stock_dif: Number(existenciaFisica) - Number(existenciaActual),
          codbarra: item.ar_codbarra || "", // Added for lote creation
          vencimientos: [
            {
              lote: lote || "SIN LOTE", // Default value if empty
              fecha_vence: vencimiento,
              loteid: lote || 0, // Use existing loteid or generate new
            },
          ],
        })),
      };

      await axios.post(
        `${api_url}articulos/agregar-inventario`,
        inventarioData
      );
      setArticulosSeleccionados([]);
      onClose();
      toast({
        title: "ÉXITO",
        description: "El inventario se cargo satisfactoriamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al cargar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMostrarBotones = (codigo: number) => {
    setCodigoArticuloSeleccionado(codigo);
  };

  const handleEliminarArticulo = (codigo: number) => {
    setArticulosSeleccionados((prev) =>
      prev.filter((art) => art.ar_codigo !== codigo)
    );
  };

  const costoDolar = costoGuaraniNuevo / cotizacionDolar;

  const costoReal = costoGuaraniNuevo / cotizacionReal;

  const costoPeso = costoGuaraniNuevo / cotizacionPeso;

  const precioContadoDolar = precioContadoNuevo / cotizacionDolar;

  const precioContadoReal = precioContadoNuevo / cotizacionReal;

  const precioContadoPeso = precioContadoNuevo / cotizacionPeso;

  return (
    <Flex padding={2} h={"100vh"} bg={"gray.100"}>
      <Flex
        gap={2}
        padding={2}
        w={"100%"}
        borderRadius={"md"}
        boxShadow={"md"}
        bg={"white"}
        flexDir={"column"}
      >
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={6}
          alignItems="center"
          rounded="lg"
        >
          <ArchiveRestore size={24} className="mr-2" />
          <Heading size={"md"}>Toma de inventario</Heading>
          <Flex ml="auto" gap={4}>
            <Button colorScheme="green" onClick={
              () => {
                onModalOpen();
                fetchCotizaciones();
                fetchMarcas();
                fetchPaises();
                fetchUnidadesMedida();
                fetchUbicaciones();
                fetchSubUbicaciones();
                fetchCategorias();
                fetchSubCategorias();
                fetchMonedas();
                fetchFabricantes();
              }
            }>
              Agregar Item
              <Plus size={16} className="ml-2" />
            </Button>
            <IconButton
              colorScheme="blue"
              aria-label="Menu"
              icon={<Menu />}
              onClick={onDrawerOpen}
            />
          </Flex>
        </Flex>
        <Flex gap={2}>
          <Box display={"flex"} flexDir={"column"} flexGrow={1}>
            <FormLabel>Sucursal</FormLabel>
            <Select
              placeholder="Seleccionar sucursal"
              value={sucursal?.id}
              onChange={(e) => {
                const selectedSucursal = sucursales.find(
                  (s) => s.id.toString() === e.target.value
                );
                setSucursal(selectedSucursal);
              }}
            >
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id.toString()}>
                  {sucursal.descripcion}
                </option>
              ))}
            </Select>
          </Box>
          <Box display={"flex"} flexDir={"column"} flexGrow={1}>
            <FormLabel>Depósito</FormLabel>
            <Select
              placeholder="Seleccionar depósito"
              value={deposito?.dep_codigo}
              onChange={(e) => {
                const selectedDeposito = depositos.find(
                  (d) => d.dep_codigo.toString() === e.target.value
                );
                setDeposito(selectedDeposito);
              }}
            >
              {depositos.map((deposito) => (
                <option
                  key={deposito.dep_codigo}
                  value={deposito.dep_codigo.toString()}
                >
                  {deposito.dep_descripcion}
                </option>
              ))}
            </Select>
          </Box>
          <Box display={"flex"} flexDir={"column"} flexGrow={1}>
            <FormLabel>Fecha</FormLabel>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Box>
        </Flex>
        <Flex>
          <Box display={"flex"} flexDir={"column"} flexGrow={1}>
            <FormLabel>Buscar artículo</FormLabel>
            <Input
              placeholder="Buscar artículo"
              variant={"filled"}
              type="text"
              value={articuloBusqueda}
              onChange={handleBusqueda}
            />
          </Box>
        </Flex>
        <Flex borderRadius="md" flexDir="column" mt={2} overflowX="auto">
          {/* Encabezados */}
          <Flex
            display={{ base: "none", md: "grid" }}
            gridTemplateColumns="5% 15% 7% 7% 5% 7% 7% 7% 5% 7% 8% 10% 5%"
            p={4}
            bg="gray.100"
            borderRadius="md"
            gap={2}
          >
            {[
              "Código",
              "Descripción",
              "Exist. Actual",
              "Exist. Físico",
              "Dif. (+/-)",
              "Costo U.",
              "P. Contado",
              "Vencimiento",
              "Lote",
              "Subtotal",
              "Cod. Barra",
              "Marca",
              "Nro. Registro",
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
          <Flex flexDir="column" gap={1} mt={2}>
            {articulos.map((articulo) => (
              <Flex
                key={articulo.ar_codigo}
                flexDir={{ base: "column", md: "row" }}
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "5% 15% 7% 7% 5% 7% 7% 7% 5% 7% 8% 10% 5%",
                }}
                p={4}
                _hover={{ bg: "gray.50" }}
                boxShadow="xs"
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleSeleccionarArticulo(articulo)}
                gap={2}
              >
                {[
                  articulo.ar_codigo,
                  articulo.ar_descripcion,
                  articulo.al_cantidad,
                  articulo.al_cantidad,
                  articulo.al_cantidad - articulo.al_cantidad,
                  formatearMoneda(articulo.ar_pcg),
                  formatearMoneda(articulo.ar_pvg),
                  formatearFecha(articulo.al_vencimiento),
                  articulo.al_codigo,
                  formatearMoneda(articulo.ar_pvg),
                  articulo.ar_codbarra,
                  articulo.ma_descripcion,
                  articulo.al_registro,
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
                          "Descripción",
                          "Exist. Actual",
                          "Exist. Físico",
                          "Dif. (+/-)",
                          "Costo U.",
                          "P. Contado",
                          "Vencimiento",
                          "Lote",
                          "Subtotal",
                          "Cod. Barra",
                          "Marca",
                          "Nro. Registro",
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar artículo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} gap={2}>
              <Flex gap={4}>
                <Box borderRadius={"sm"} boxShadow={"xs"} p={2}>
                  <Text
                    fontSize={"xl"}
                    fontWeight={"bold"}
                    textAlign={"center"}
                  >
                    {articuloCodigo.toString()}
                  </Text>
                </Box>
                <Box borderRadius={"sm"} boxShadow={"xs"} p={2} flexGrow={1}>
                  <Text
                    fontSize={"xl"}
                    fontWeight={"bold"}
                    textAlign={"center"}
                  >
                    {articuloSeleccionado?.ar_descripcion}
                  </Text>
                </Box>
              </Flex>
              <Flex gap={4}>
                <Box>
                  <FormLabel>Exist. Actual</FormLabel>
                  <Input
                    type="number"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={existenciaActual}
                    onChange={(e) =>
                      setExistenciaActual(parseInt(e.target.value))
                    }
                  />
                </Box>
                <Box>
                  <FormLabel>Exist. Físico</FormLabel>
                  <Input
                    type="number"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={existenciaFisica}
                    onChange={(e) =>
                      setExistenciaFisica(parseInt(e.target.value))
                    }
                  />
                </Box>
                <Box>
                  <FormLabel>Fecha Vencimiento</FormLabel>
                  <Input
                    type="date"
                    w={"150px"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={vencimiento}
                    onChange={(e) => setVencimiento(e.target.value)}
                  />
                </Box>
              </Flex>
              <Flex gap={4}>
                <Box flexGrow={1}>
                  <FormLabel>Costo U.</FormLabel>
                  <Input
                    type="number"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={costoNuevo}
                    onChange={(e) => setCostoNuevo(parseFloat(e.target.value))}
                  />
                </Box>
                <Box flexGrow={1}>
                  <FormLabel>Precio Contado</FormLabel>
                  <Input
                    type="number"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={precioNuevo}
                    onChange={(e) => setPrecioNuevo(parseFloat(e.target.value))}
                  />
                </Box>
              </Flex>
              <Flex gap={4}>
                <Box>
                  <FormLabel>Lote</FormLabel>
                  <Input
                    type="text"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                  />
                </Box>
                <Box>
                  <FormLabel>Código de barras</FormLabel>
                  <Input
                    type="text"
                    w={"100%"}
                    placeContent={"center"}
                    variant={"filled"}
                    value={codigoBarra}
                    onChange={(e) => setCodigoBarra(e.target.value)}
                  />
                </Box>
              </Flex>
              <Textarea
                mt={2}
                placeholder="Observaciones"
                variant={"filled"}
                w={"100%"}
                h={"100px"}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></Textarea>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleGuardarArticulo}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={onModalClose} size={'full'}>
      <ModalOverlay />
      <ModalContent className="bg-white shadow-lg rounded-lg">
        <ModalHeader className="text-3xl font-bold text-gray-800">Registrar Productos</ModalHeader>
        <ModalCloseButton className="text-gray-800 hover:text-gray-900" />
        <ModalBody>
          <div className="border-b border-gray-300 mb-4">
            <nav className="flex justify-around">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`w-full py-4 px-1 text-center border-b-2 font-medium text-lg transition duration-300 ease-in-out ${
                    activeTab === index
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6 transition duration-300 ease-in-out">
            {activeTab === 0 &&
            <div className="animate-fadeIn">
              <Flex flexDir={'column'} gap={2}>
                <Flex gap={4}>
                  <Box>
                    <FormLabel>Código:</FormLabel>
                    <Input type="number" variant={'filled'}  value={codigoNuevo} onChange={(e)=> setCodigoNuevo(Number(e.target.value))}/>
                  </Box>
                  <Box flexGrow={1}>
                    <FormLabel>Descripción:</FormLabel>
                    <Input type="text" variant={'filled'} value={descripcionNuevo} onChange={(e)=> setDescripcionNuevo(e.target.value)}/>
                  </Box>
                  <Box >
                    <FormLabel>Código de barras:</FormLabel>
                      <Input type="text" variant={'filled'} value={codigoBarraNuevo} onChange={(e)=>{ setCodigoBarraNuevo(e.target.value)}} />
                  </Box>
                  <Box>
                    <FormLabel>Código de origen:</FormLabel>
                    <Input type="text" variant={'filled'} value={codigoBarraNuevo} />
                  </Box>
                </Flex>
                <Flex gap={4}>
                  <Box flexGrow={1}>
                    <FormLabel>Descripcion Generica:</FormLabel>
                    <Input type="text" variant={'filled'} value={descripcionGenericaNuevo} onChange={(e) => setDescripcionGenericaNuevo(e.target.value)}/>
                  </Box>
                  <Box>
                    <FormLabel>Presentacion:</FormLabel>
                    <Input type="text" variant={'filled'} value={presentacionNuevo} onChange={(e) => setPresentacionNuevo(e.target.value)} />
                  </Box>
                  <Box>
                    <FormLabel>Modelo:</FormLabel>
                    <Input type="text" variant={'filled'} value={modeloNuevo} onChange={(e)=> setModeloNuevo(e.target.value)}/>
                  </Box>
                  <Box>
                    <FormLabel>Cant./Caja:</FormLabel>
                    <Input type="number" variant={'filled'}  value={cantidadCajaNuevo} onChange={(e)=> setCantidadCajaNuevo(Number(e.target.value))}/>
                  </Box>
                  <Box>
                    <FormLabel>Kilos:</FormLabel>
                    <Input type="number" variant={'filled'} value={kilosNuevo} onChange={(e)=> setKilosNuevo(Number(e.target.value))} />
                  </Box>
                  <Box>
                    <FormLabel>Marca/Laboratorio:</FormLabel>
                    <Select variant={'filled'} value={marcaNuevo} onChange={(e) => setMarcaNuevo(e.target.value)}>
                      {marcas.map((marca: any) => (
                        <option value={marca.ma_codigo}>{marca.ma_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Pais de origen:</FormLabel>
                    <Select variant={'filled'} value={paisOrigenNuevo} onChange={(e)=> setPaisOrigenNuevo(Number(e.target.value))}>
                      {paises.map((pais: any) => (
                        <option value={pais.nac_codigo}>{pais.descripcion}</option> //reparar
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Unidad de medida:</FormLabel>
                    <Select variant={'filled'} value={unidadMedidaNuevo} onChange={(e)=> setUnidadMedidaNuevo(Number(e.target.value))}>
                      {unidadesMedida.map((unidad: any) => (
                        <option value={unidad.um_codigo}>{unidad.um_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                </Flex>
                <Flex gap={4}>
                  <Box>
                    <FormLabel>Ubicación:</FormLabel>
                    <Select variant={'filled'} value={ubicacionNuevo} onChange={(e)=> setUbicacionNuevo(Number(e.target.value))}>
                      {ubicaciones.map((ubicacion: any) => (
                        <option value={ubicacion.ub_codigo}>{ubicacion.ub_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Sub-ubicación:</FormLabel>
                    <Select variant={'filled'} value={subUbicacionNuevo} onChange={(e)=> setSubUbicacionNuevo(Number(e.target.value))}>
                      {subUbicaciones.map((subUbicacion: any) => (
                        <option value={subUbicacion.s_codigo}>{subUbicacion.s_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Categoria:</FormLabel>
                    <Select variant={'filled'} value={categoriaNuevo} onChange={(e)=> setCategoriaNuevo(Number(e.target.value))}>
                      {categorias.map((categoria: any) => (
                        <option value={categoria.ca_codigo}>{categoria.ca_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Sub-categoria:</FormLabel>
                    <Select variant={'filled'} value={subCategoriaNuevo} onChange={(e)=> setSubCategoriaNuevo(Number(e.target.value))}>
                      {subCategorias.map((subCategoria: any) => (
                        <option value={subCategoria.sc_codigo}>{subCategoria.sc_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Bloque:</FormLabel>
                    <Input type="text" variant={'filled'} value={bloqueNuevo} onChange={(e) => setBloqueNuevo(e.target.value)}/>
                  </Box>
                  <Box>
                    <FormLabel>DVL:</FormLabel>
                    <Input type="number" variant={'filled'} value={dvlNuevo} onChange={(e)=> setDvlNuevo(Number(e.target.value))}/>
                  </Box>
                  <Box>
                    <FormLabel>Moneda:</FormLabel>
                    <Select variant={'filled'} value={monedaNuevo} onChange={(e)=> setMonedaNuevo(Number(e.target.value))}>
                      {monedas.map((moneda: any) => (
                        <option value={moneda.mo_codigo}>{moneda.mo_descripcion}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>IVA:</FormLabel>
                    <Select variant={'filled'} value={ivaNuevo} onChange={(e)=> setIvaNuevo(Number(e.target.value))}>
                      <option value="1">Exentas</option>
                      <option value="2">5%</option>
                      <option value="3">10%</option>
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Fabricante:</FormLabel>
                    <Select variant={'filled'} value={fabricanteNuevo} onChange={(e)=> setFabricanteNuevo(Number(e.target.value))}>
                      {fabricantes.map((fabricante: any) => (
                        <option value={fabricante.f_codigo}>{fabricante.f_razon_social}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <Input type="number" variant={'filled'} value={stockMinimoNuevo} onChange={(e)=> setStockMinimoNuevo(Number(e.target.value))}/>
                  </Box>
                  <Box>
                    <FormLabel>Número de serie</FormLabel>
                    <Input type="number" variant={'filled'} value={numeroSerieNuevo} onChange={(e)=> setNumeroSerieNuevo(Number(e.target.value))} />
                  </Box>
                </Flex>
                <Flex
                  borderRadius={"md"}
                  bg={'gray.100'}
                  flexGrow={1}
                  h={'auto'}
                  p={4}
                >
                    <Flex
                      flexDir={'column'}
                    >

                      <Heading size={'md'}>Costos:</Heading>
                      <Divider   my={2}/>
                    <Box>
                      <FormLabel>Costo Guaraní:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} value={costoGuaraniNuevo} onChange={(e)=> setCostoGuaraniNuevo(Number(e.target.value))}/>
                    </Box>
                    <Box>
                      <FormLabel>Costo Dolar:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0"  value={costoDolar}/>
                    </Box>
                    <Box>
                      <FormLabel>Costo Real:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0" value={costoReal} />
                    </Box>
                    <Box>
                      <FormLabel>Costo Peso:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="0" value={costoPeso} />
                    </Box>
                    </Flex>

                    <Flex
                      flexDir={'column'}
                    >
                      <Heading size={'md'}>Utilidades (Guaraníes):</Heading>
                      <Divider   my={2}/>
                    <Box>
                      <FormLabel>Contado:</FormLabel>
                      <Flex>
                      <Input type="number" variant={'outline'} bg={'white'} value={precioContadoNuevo} onChange={(e)=>setPrecioContadoNuevo(Number(e.target.value))}/>
                      <Input type="number" variant={'outline'} bg={'white'}/></Flex> 
                    </Box>
                    <Box>
                      <FormLabel>Crédito:</FormLabel>
                      <Flex>
                      <Input type="number" variant={'outline'} bg={'white'} value={precioCreditoNuevo} onChange={(e)=>setPrecioCreditoNuevo(Number(e.target.value))}/>
                      <Input type="number" variant={'outline'} bg={'white'}/>
                      </Flex>
                    </Box>
                    <Box>
                      <FormLabel>Mostrador:</FormLabel>
                      <Flex>
                      <Input type="number" variant={'outline'} bg={'white'} value={precioMostradorNuevo} onChange={(e)=>setPrecioMostradorNuevo(Number(e.target.value))}/>
                      <Input type="number" variant={'outline'} bg={'white'}/>
                      </Flex>
                    </Box>
                    <Box>
                      <FormLabel>Precio 4:</FormLabel>
                      <Flex>
                      <Input type="number" variant={'outline'} bg={'white'} value={precio4Nuevo} onChange={(e)=>setPrecio4Nuevo(Number(e.target.value))}/>
                      <Input type="number" variant={'outline'} bg={'white'}/>
                      </Flex>
                    </Box>
                    </Flex>
                    <Flex
                      flexDir={'column'}
                    >
                      <Heading size={'md'}>Precios:</Heading>
                      <Divider   my={2}/>
                    <Box>
                      <FormLabel>Precio Contado:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0" value={precioContadoNuevo} onChange={(e)=> {setPrecioContadoNuevo(parseFloat(e.target.value))}}/>
                    </Box>
                    <Box>
                      <FormLabel>Precio Contado Dolar:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0" value={precioContadoDolar} />
                    </Box>
                    <Box>
                      <FormLabel>Precio Contado Real:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0"  value={precioContadoReal}/>
                    </Box>
                    <Box>
                      <FormLabel>Precio Sugerido:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0"  value={precioContadoPeso}/>
                    </Box>
                    </Flex>

                    <Flex
                      flexDir={'column'}
                    >
                      <Heading size={'md'}>Fraccionamientos:</Heading>
                      <Divider   my={2}/>
                    <Box>
                      <FormLabel>Fraccionamiento:</FormLabel>
                      <Select bg={'white'}>
                        <option value="1">Por Unidad</option>
                        <option value="2">Entero</option>
                      </Select>
                    </Box>
                    <Box>
                      <FormLabel>Cantidad fraccionada:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="0" />
                    </Box>
                    <Box>
                      <FormLabel>Precio Fraccionado:</FormLabel>
                      <Input type="number" variant={'outline'} bg={'white'} placeholder="Gs. 0" />
                    </Box>
                    </Flex>

                </Flex>
              </Flex>
            </div>}
            {activeTab === 1 && <div className="animate-fadeIn">Contenido de Listas de Precios</div>}
            {activeTab === 2 && <div className="animate-fadeIn">Contenido de Desglose por caja</div>}
            {activeTab === 3 && <div className="animate-fadeIn">Contenido de Ensamble</div>}
            {activeTab === 4 && <div className="animate-fadeIn">Contenido de Historico</div>}
            {activeTab === 5 && <div className="animate-fadeIn">Contenido de Compra/venta</div>}
            {activeTab === 6 && <div className="animate-fadeIn">Contenido de Varios</div>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size={"md"}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Articulos a cargar</DrawerHeader>

          <DrawerBody>
            {articuloSeleccionado &&
              articulosSeleccionados.map((articulo) => (
                <Flex
                  key={articulo.ar_codigo}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  mb={2}
                  boxShadow="sm"
                  flexDir="column"
                  gap={2}
                  onClick={() => handleMostrarBotones(articulo.ar_codigo)}
                  transition={"all 0.3s"}
                >
                  {/* Cabecera */}
                  <Flex
                    justifyContent="space-between"
                    align="center"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    pb={2}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      display={"flex"}
                      alignItems={"center"}
                      gap={2}
                    >
                      <Tag size={14} /> {articulo.ar_codigo}
                    </Text>
                    <Text
                      fontSize="md"
                      fontWeight={"bold"}
                      color="gray.600"
                      display={"flex"}
                      alignItems={"center"}
                      gap={2}
                    >
                      <Info size={14} /> {articulo.ar_descripcion}
                    </Text>
                  </Flex>

                  {/* Existencias */}
                  <Flex justifyContent="space-between" fontSize="sm">
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <LucideBox size={14} /> Exist. actual: {existenciaActual}
                    </Text>
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <LucideBox size={14} /> Exist. físico: {existenciaFisica}
                    </Text>
                    <Text
                      color="red.500"
                      display={"flex"}
                      alignItems={"center"}
                      gap={2}
                    >
                      <Info size={14} /> Dif.:{" "}
                      {existenciaFisica - existenciaActual}
                    </Text>
                  </Flex>

                  {/* Precios */}
                  <Flex justifyContent="space-between" fontSize="sm">
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <DollarSign size={14} /> Costo:{" "}
                      {formatearMoneda(costoNuevo)}
                    </Text>
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <DollarSign size={14} /> Precio:{" "}
                      {formatearMoneda(precioNuevo)}
                    </Text>
                  </Flex>

                  {/* Fecha de vencimiento */}

                  {/* Detalles adicionales */}
                  <Flex justifyContent="space-between" fontSize="sm">
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <Tag size={14} /> Lote: {lote}
                    </Text>
                    <Text display={"flex"} alignItems={"center"} gap={2}>
                      <Barcode size={14} /> Código de barras: {codigoBarra}
                    </Text>
                  </Flex>

                  <Text fontSize="xs" color="gray.500">
                    Marca: {articulo.ma_descripcion}
                  </Text>
                  <Flex justifyContent={"space-between"}>
                    <Text fontSize="xs" color="gray.500">
                      Registro: {articulo.al_registro}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={
                        new Date(vencimiento) < new Date()
                          ? "red.500"
                          : "gray.700"
                      }
                      display={"flex"}
                      alignItems={"center"}
                      gap={2}
                    >
                      <Calendar size={14} /> Vencimiento:{" "}
                      {formatearFecha(articulo.al_vencimiento)}
                    </Text>
                  </Flex>
                  {codigoArticuloSeleccionado === articulo.ar_codigo && (
                    <div className="flex justify-end gap-2 items-center mt-2 animate-in fade-in duration-300 slide-in-from-top-5">
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() =>
                          handleEliminarArticulo(articulo.ar_codigo)
                        }
                      >
                        Eliminar
                      </Button>
                      <Button
                        colorScheme="green"
                        size="sm"
                        onClick={() => {
                          setArticuloSeleccionado(articulo);
                          setArticuloCodigo(articulo.ar_codigo);
                          setCostoNuevo(articulo.ar_pcg);
                          setPrecioNuevo(articulo.ar_pvg);
                          setExistenciaActual(articulo.al_cantidad);
                          setExistenciaFisica(articulo.al_cantidad);
                          setLote(articulo.al_codigo.toString());
                          setCodigoBarra(articulo.ar_codbarra);
                          setVencimiento(
                            formatearFecha(articulo.al_vencimiento)
                          );
                          setObservaciones(observaciones);
                          onOpen();
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  )}
                </Flex>
              ))}
          </DrawerBody>

          <DrawerFooter>
            <Flex gap={4} flexDir={"column"} w={"100%"}>
              <Text fontWeight={"bold"} textAlign={"start"}>
                Total de artículos:{" "}
                <strong>{articulosSeleccionados.length}</strong>
              </Text>
              <Flex gap={2} justifyContent={"end"}>
                <Button variant="outline" mr={3} onClick={onClose}>
                  Cancelar
                </Button>
                <Button colorScheme="blue" onClick={cargarInventario}>
                  Cargar inventario
                </Button>
              </Flex>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default TomaDeInventario;
