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
} from "@chakra-ui/react";
import { format } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { HandCoins } from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { Factura, OperacionData, Sucursal } from "@/types/shared_interfaces";

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
  const [montoRecibido, setMontoRecibido] = useState(0);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [, setNumeroTimbrado] = useState("");
  const [numeroEstablecimiento, setNumeroEstablecimiento] = useState("");
  const [numeroEmision, setNumeroEmision] = useState("");
  const operadorActual = auth?.userId || "";
  const [tipoRecibo, setTipoRecibo] = useState(1);
  const [cajaId, setCajaId] = useState<number>(0);

  const {
    isOpen: isCobroModalOpen,
    onOpen: onCobroModalOpen,
    onClose: onCobroModalClose,
  } = useDisclosure();

  useEffect(() => {
    fetchVentas();
  }, [fecha]);

  useEffect(() => {
    fetchSucursales();
    verificarCajaAbierta();
  }, []);

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
    // Validación del ventaId
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

  const vuelto = (monto: number, total: number) => {
    const result = monto - total;
    return result < 0 ? 0 : result;
  };

  const faltante = (monto: number, total: number) => {
    const result = total - monto;
    return result < 0 ? 0 : result;
  };

  const handleCobro = async () => {
    if (montoRecibido < (ventaSeleccionada?.total ?? 0)) {
      toast({
        title: "Error",
        description: "El monto recibido no puede ser menor al total",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const operacionData: OperacionData = {
      ventaId: ventaSeleccionada?.codigo || 0,
      caja: cajaId,
      cuenta: 1,
      fecha: fecha,
      observacion: "Venta",
      recibo: 0,
      documento: Number(ventaSeleccionada?.factura) || 0,
      operador: operadorActual,
      redondeo: 0,
      monto: ventaSeleccionada?.total ?? 0,
      mora: 0,
      punitorio: 0,
      descuento: ventaSeleccionada?.descuento || 0,
      estado: 1,
      cod_retencion: 0,
      metodo: 1,
    };

    insertarOperacion(operacionData);
    await actualizarUltimaFactura(
      Number(facturaData[0]?.d_nro_secuencia),
      Number(numeroFactura)
    );
    onCobroModalClose();
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
    setMontoRecibido(0);
    setFiltroMetodo(0);
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
            <option value="2">Cheque</option>
            <option value="3">Tarjeta</option>
            <option value="4">Transferencia</option>
            <option value="5">Depósito</option>
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
        size={"4xl"}
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
                        <option value="0">Caja Cobro- Tesorería</option>
                      </Select>
                    </Box>
                    <Box flexGrow={1} w={"100%"}>
                      <FormLabel>Método</FormLabel>
                      <Select isDisabled={true}>
                        <option value="1">Efectivo</option>
                        <option value="2">Cheque</option>
                        <option value="3">Tarjeta</option>
                        <option value="4">Transferencia</option>
                        <option value="5">Depósito</option>
                      </Select>
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
                      <strong>Total a cobrar:</strong>
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
                    <FormLabel color={"white"} pb={isMobile ? 0 : 6}>
                      <strong>Recibido:</strong>
                    </FormLabel>
                    <Input
                      height={isMobile ? "40px" : "60px"}
                      type="number"
                      placeholder="Gs."
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(Number(e.target.value))}
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
                      <strong>Faltante:</strong>
                    </FormLabel>
                    <Text
                      color={"white"}
                      fontSize={isMobile ? "x-large" : "xxx-large"}
                    >
                      {formatCurrency(
                        faltante(montoRecibido, ventaSeleccionada?.total || 0)
                      )}
                    </Text>
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
                        vuelto(montoRecibido, ventaSeleccionada?.total || 0)
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
            <Button
              variant="solid"
              colorScheme="green"
              onClick={async () => {
                try {
                  await handleCobro();
                  // Update the main ventas state instead
                  setVentas((prev) =>
                    prev.filter(
                      (venta) => venta.codigo !== ventaSeleccionada?.codigo
                    )
                  );
                  onCobroModalClose();
                } catch (error) {
                  console.error("Error processing payment:", error);
                }
              }}
            >
              Cobrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
