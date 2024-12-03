import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  Input,
  useToast,
  HStack,
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
} from "@chakra-ui/react";
import { format } from "date-fns";
import { api_url } from "@/utils";
import { SearchIcon } from "@chakra-ui/icons";
import { HandCoins } from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { Sucursal } from "@/types/shared_interfaces";

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
}

interface DetalleVenta {
  det_codigo: number;
  art_codigo: number;
  codbarra: string;
  descripcion: string;
  descripcion_editada?: string;
  cantidad: number;
  precio: number;
  descuento: number;
  exentas: number;
  cinco: number;
  diez: number;
  lote: string;
  vencimiento: string;
}

interface Cliente {
  cli_codigo: number;
  cli_interno: number;
  cli_razon: string;
  cli_ruc: string;
  cli_limitecredito: number;
}
export default function CobrosDiarios() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [facturaFiltro, setFacturaFiltro] = useState("");
  const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(
    null
  );
  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const { auth } = useAuth();
  const [sucursal, setSucursal] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string | number>("");
  const [filtroMetodo, setFiltroMetodo] = useState(0);
  const [factorCotizacion, setFactorCotizacion] = useState(0);

  const {
    isOpen: isCobroModalOpen,
    onOpen: onCobroModalOpen,
    onClose: onCobroModalClose,
  } = useDisclosure();

  useEffect(() => {
    fetchVentas();
    console.log(auth?.rol);
  }, [fecha]);

  const fetchVentas = async () => {
    setIsLoading(true);
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

  const formatCantidad = (cantidad: string | number) => {
    const numericValue = Number(cantidad);
    if (!isNaN(numericValue)) {
      return Math.floor(numericValue).toString();
    }
    return cantidad;
  };

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

        <Flex gap={4} flexDir={isMobile? 'column' : 'row'}>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Select>
            <option value="0">Seleccione un método de cobro</option>
            <option value="1">Efectivo</option>
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
              <option value="0">Todas</option>
              {sucursal.map((suc) => (
                <option key={suc.id} value={suc.id}>
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
        <Flex gap={2} flexDir={"column"} p={2} flex={'1'} overflowY={'auto'}>
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
            <Flex flexDir="column" gap={1} p={1}  overflowY={'auto'}  >
              {filteredVentas.map((venta) => (
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
                    setVentaSeleccionada(venta.codigo);
                    setDetalleVenta([]);
                    onCobroModalOpen();
                  }
                  }
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
      <Modal isOpen={isCobroModalOpen} onClose={onCobroModalClose} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onCobroModalClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
        </Modal>
    </Box>
  );
}
