import { Vendedor } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Text,
  Box,
  Flex,
  Heading,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Input,
  FormLabel,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import axios from "axios";
import { ChartNoAxesCombined, Medal, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ConteoGeneral {
  total_general: number;
  visitados: string;
  no_visitados: string;
  anulados: string;
}

interface GeneralChartData {
  fecha: string;
  visitados: number;
  no_visitados: number;
}

interface tiempoPromedio {
  tiempo_promedio_visita: string;
}

interface topClientes {
  cliente_nombre: string;
  cantidad: number;
  total_ventas: number;
}

interface topVendedores {
  cantidad: number;
  op_nombre: string;
  total_ventas: number;
}

const RuteamientoGeneralChart = ({ data }: { data: GeneralChartData[] }) => (
  <AreaChart
    width={730}
    height={250}
    data={data}
    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  >
    <defs>
      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="fecha" />
    <YAxis />
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="no_visitados"
      stroke="#8884d8"
      fillOpacity={1}
      fill="url(#colorUv)"
    />
    <Area
      type="monotone"
      dataKey="visitados"
      stroke="#82ca9d"
      fillOpacity={1}
      fill="url(#colorPv)"
    />
  </AreaChart>
);

const RuteamientosDashboard = () => {
  const [hasta, setHasta] = useState<Date>(() => {
    const today = new Date();
    return today;
  });
  const [desde, setDesde] = useState<Date>(() => {
    const today = new Date();
    const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
    return monthAgo;
  });
  const vendedorActual = localStorage.getItem("user_id");
  const [vendedor, setVendedor] = useState(vendedorActual);
  const [tiempopromedio, setTiempoPromedio] = useState<tiempoPromedio[]>([]);
  const [conteoVisitas, setConteoVisitas] = useState<ConteoGeneral[]>([]);
  const [topClientes, setTopClientes] = useState<topClientes[]>([]);
  const [topVendedores, setTopVendedores] = useState<topVendedores[]>([]);
  const [graficoGeneral, setGraficoGeneral] = useState<GeneralChartData[]>([]);
  const [graficoVendedor, setGraficoVendedor] = useState<GeneralChartData[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [buscarVendedor, setBuscarVendedor] = useState("");
  const [recomedacionesVendedores, setRecomendacionesVendedores] = useState<
  typeof vendedores
>([]);
  const totalGeneral = conteoVisitas[0]?.total_general;
  const visitados = Number(conteoVisitas[0]?.visitados);
  const noVisitados = Number(conteoVisitas[0]?.no_visitados);
  const anulados = Number(conteoVisitas[0]?.anulados);
  const verGrafico = localStorage.getItem("permiso_graficos") === "1";
  const isMobile = useMediaQuery("(max-width: 768px)")[0];
  const permisoGrafico = localStorage.getItem("permiso_graficos");

  const fetchDatosGraficoGeneral = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/grafico-general`, {
        desde: desde,
        hasta: hasta,
      });
      setGraficoGeneral(response.data.body);
      console.log(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDatosGraficoVendedor = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/grafico-por-vendedor`, {
        desde: desde,
        hasta: hasta,
        vendedor: vendedor,
      });
      setGraficoVendedor(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConteoVisitas = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/contarvisitas`, {
        desde: desde,
        hasta: hasta,
        vendedor: vendedor,
      });
      setConteoVisitas(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTiempoPromedioVisitas = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/tiempopromedio`, {
        desde: desde,
        hasta: hasta,
        vendedor: vendedor,
      });
      setTiempoPromedio(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopClientes = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/top-clientes`, {
        desde: desde,
        hasta: hasta,
      });
      setTopClientes(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopVendedores = async () => {
    try {
      const response = await axios.post(`${api_url}agendas/top-vendedores`, {
        desde: desde,
        hasta: hasta,
      });
      setTopVendedores(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVendedores = async () => {
    try {
      const response = await axios.get(`${api_url}usuarios`);
      setVendedores(response.data.body);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatosGraficoGeneral();
    fetchTiempoPromedioVisitas();
    fetchConteoVisitas();
    fetchTopClientes();
    fetchTopVendedores();
    fetchVendedores();
    fetchDatosGraficoVendedor();
  }, [desde, hasta, vendedor]);
  const calcularEfectiividad = () => {
    if (!conteoVisitas?.[0]) return "0.00";

    const visitados = parseInt(conteoVisitas[0].visitados?.toString() || "0");
    const total = parseInt(conteoVisitas[0].total_general?.toString() || "0");

    if (total === 0) return "0.00";
    const efectividad = (visitados / total) * 100;
    return efectividad.toFixed(2);
  };

  const calcularKPI = () => {
    if (!conteoVisitas?.[0]) return "0.00";

    const visitados = parseInt(conteoVisitas[0].visitados?.toString() || "0");
    const total = parseInt(conteoVisitas[0].total_general?.toString() || "0");

    if (total === 0) return "0.00";
    const kpi = visitados / total;
    return kpi.toFixed(2);
  };

  const calcularTiempoPromedio = () => {
    if (!tiempopromedio?.[0] || !conteoVisitas?.[0]?.visitados) return "0";

    const tiempoTotal = tiempopromedio[0].tiempo_promedio_visita;
    const cantidadVisitas = conteoVisitas[0].visitados;

    return Math.round(
      Number(tiempoTotal) / Number(cantidadVisitas) / 60
    ).toString();
  };

  const getMedalColor = (index: number) => {
    const colors = ["gold", "silver", "#a97142"];
    return colors[index] || "gray";
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) {
      return "Gs. 0";
    }
    const formatter = new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  const handleBusquedaVendedor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busquedaVendedor = e.target.value;
    setBuscarVendedor(busquedaVendedor);

    if (busquedaVendedor.length > 0) {
      const filteredVendedores = vendedores
        .filter(
          (vendedor) =>
            vendedor.op_nombre
              .toLowerCase()
              .includes(busquedaVendedor.toLowerCase()) ||
            vendedor.op_codigo.toString().includes(busquedaVendedor)
        )
        .slice(0, 5);

      setRecomendacionesVendedores(filteredVendedores);

      if (filteredVendedores.length > 0) {
        setVendedor(filteredVendedores[0].op_codigo);
      } else {
        setVendedor("");
      }
    } else {
      setRecomendacionesVendedores([]);
      setVendedor("");
    }
  };

   if (!verGrafico) {
     return isMobile ? (
       <Box
         h="95vh"
         w="99vw"
         display="flex"
         justifyContent="center"
         alignItems="center"
         backgroundImage="url('/src/assets/bg/fondodashboardResponsive.png')"
         backgroundSize="cover"
         backgroundRepeat="no-repeat"
         backgroundPosition="top"
         overflow="hidden"
       ></Box>
     ) : (
       <Box
         h="95vh"
         w="99vw"
         display="flex"
         justifyContent="center"
         alignItems="center"
         backgroundImage="url('/src/assets/bg/fondodashboard.png')"
         backgroundSize="cover"
         backgroundRepeat="no-repeat"
         backgroundPosition="top"
         overflow="hidden"
       ></Box>
     );
   }


  return (
    <Box p={4} h={"100vh"} bg={"gray.50"}>
      <Box bg={"white"} borderRadius={"lg"} boxShadow={"md"} px={2}>
        <Flex
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={4}
          alignItems="center"
          rounded="lg"
          justifyContent={"space-between"}
        >
          <Flex alignItems={"center"}>
            <ChartNoAxesCombined size={32} className="mr-2" />
            <Heading size={"md"}>Resumen de Ruteamientos</Heading>
          </Flex>

          <Flex alignItems={"center"}>
          <Box position={"relative"}>
                  <Input
                  isDisabled = {permisoGrafico === "0" ? false : true}
                  color={"black"}
                    bg={"white"}
                    width={'300px'}
                    id="vendedor-search"
                    placeholder="Buscar vendedor por código"
                    value={buscarVendedor}
                    onChange={handleBusquedaVendedor}
                    onFocus={() => {
                      if (vendedor) {
                        setBuscarVendedor("");
                        setRecomendacionesVendedores([]);
                      }
                    }}
                    aria-autocomplete="list"
                    aria-controls="vendedor-recommendations"
                  />
                  {vendedor && (
                    <Text mt={2} fontWeight="bold" color="white.500">
                      Vendedor seleccionado: {vendedor}
                    </Text>
                  )}
                  {recomedacionesVendedores.length === 0 &&
                    buscarVendedor.length > 0 &&
                    !vendedor && (
                      <Text color="red.500" mt={2}>
                        No se encontró vendedor con ese código
                      </Text>
                    )}
                  {recomedacionesVendedores.length > 0 && (
                    <Box
                      id="vendedor-recommendations"
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      zIndex={20}
                      bg="white"
                      boxShadow="md"
                      borderRadius="md"
                      mt={1}
                      className="recomendaciones-menu"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {recomedacionesVendedores.map((vendedor) => (
                        <Box
                          key={vendedor.op_codigo}
                          p={2}
                          _hover={{ bg: "gray.100" }}
                          cursor="pointer"
                          onClick={() => {
                            setBuscarVendedor(vendedor.op_codigo);
                            setVendedor(vendedor.op_nombre);
                            setRecomendacionesVendedores([]);
                          }}
                        >
                          <Text fontWeight="bold" color={'black'}>{vendedor.op_nombre}</Text>
                          <Text as="span" color="gray.500" fontSize="sm">
                            Código: {vendedor.op_codigo}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
            <Button onClick={() => {setVendedor("")}} ml={2} bg={'none'}> <X color="#000"/></Button>
            <Box ml={4} display={"flex"} alignItems={"center"}> 
              <FormLabel>Desde:</FormLabel>
              <Input
                type="date"
                value={desde.toISOString().split("T")[0]}
                onChange={(e) => {
                  setDesde(new Date(e.target.value));
                }}
              />
            </Box>
            <Box ml={4} display={"flex"} alignItems={"center"}>
              <FormLabel>Hasta:</FormLabel>
              <Input
                type="date"
                value={hasta.toISOString().split("T")[0]}
                onChange={(e) => {
                  setHasta(new Date(e.target.value));
                }}
              />
            </Box>
          </Flex>
        </Flex>
        <Flex>
          <Box
            display={"flex"}
            flexDir={"column"}
            p={2}
            pb={4}
            flexGrow={1}
            gap={2}
          >
            <Box
              p={4}
              flexGrow={1}
              height="50%"
              borderRadius={"md"}
              bg={"gray.50"}
              boxShadow={"xs"}
              display={"flex"}
              flexDir={"column"}
              gap={4}
            >
              <Heading size={"md"} mb={8}>
                Grafico de ruteamiento general
              </Heading>
              <RuteamientoGeneralChart data={graficoGeneral} />
            </Box>
            <Box
              p={4}
              flexGrow={1}
              height="50%"
              borderRadius={"md"}
              bg={"gray.50"}
              boxShadow={"xs"}
              display={"flex"}
              flexDir={"column"}
            >
              <Flex justify={"space-between"}>
                <Heading size={"md"} mb={8}>
                  Grafico de ruteamiento por vendedor
                </Heading>
              </Flex>
              <RuteamientoGeneralChart data={graficoVendedor} />
            </Box>
          </Box>
          <Box display={"flex"} flexDir={"column"} p={2} flexGrow={1}>
            <Box
              display={"flex"}
              flexDir={"row-reverse"}
              py={2}
              flexGrow={1}
              height="50%"
              gap={4}
            >
              <Box
                display={"flex"}
                flexDir={"column"}
                flexGrow={1}
                height="100%"
                gap={4}
              >
                <Flex h={"50%"} gap={4}>
                  <Flex
                    w={"50%"}
                    borderRadius={"md"}
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    align={"center"}
                    justifyContent={"center"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Visitas totales
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {conteoVisitas[0]?.total_general}
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                        {(
                          (totalGeneral / (totalGeneral + anulados)) *
                          100
                        ).toFixed(2)}
                        %
                      </StatHelpText>
                    </Stat>
                  </Flex>
                  <Flex
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                    borderRadius={"md"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Visitas Realizadas
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {visitados}
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="decrease" />
                        {(
                          (visitados / (totalGeneral + anulados)) *
                          100
                        ).toFixed(2)}
                        %
                      </StatHelpText>
                    </Stat>
                  </Flex>
                </Flex>
                <Flex h={"50%"} gap={4}>
                  <Flex
                    borderRadius={"md"}
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Visitas Anuladas
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {conteoVisitas[0]?.anulados}
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                        {((anulados / (totalGeneral + anulados)) * 100).toFixed(
                          2
                        )}
                        %
                      </StatHelpText>
                    </Stat>
                  </Flex>
                  <Flex
                    borderRadius={"md"}
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Visitas no realizadas
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {conteoVisitas[0]?.no_visitados}
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                        {(
                          (noVisitados / (totalGeneral + anulados)) *
                          100
                        ).toFixed(2)}
                        %
                      </StatHelpText>
                    </Stat>
                  </Flex>
                </Flex>
                <Flex h={"50%"} gap={4}>
                  <Flex
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                    borderRadius={"md"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        KPI General
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {calcularKPI()}
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                      </StatHelpText>
                    </Stat>
                  </Flex>
                  <Flex
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                    borderRadius={"md"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Tasa de efectividad
                      </StatLabel>
                      <StatHelpText textAlign={"center"} fontSize={"xx-large"}>
                        <StatArrow type="increase" />
                        {calcularEfectiividad()}%
                      </StatHelpText>
                    </Stat>
                  </Flex>
                </Flex>
                <Flex h={"50%"} gap={4}>
                  <Flex
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                    borderRadius={"md"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Tiempo promedio de visitas
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        {calcularTiempoPromedio()} min
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                      </StatHelpText>
                    </Stat>
                  </Flex>
                  <Flex
                    boxShadow={"xs"}
                    bg={"gray.50"}
                    w={"50%"}
                    borderRadius={"md"}
                  >
                    <Stat alignContent={"center"}>
                      <StatLabel textAlign={"center"} fontSize={"lg"}>
                        Ratio de conversion
                      </StatLabel>
                      <StatNumber textAlign={"center"} fontSize={"xxx-large"}>
                        0.8
                      </StatNumber>
                      <StatHelpText textAlign={"center"} fontSize={"x-large"}>
                        <StatArrow type="increase" />
                      </StatHelpText>
                    </Stat>
                  </Flex>
                </Flex>
              </Box>
              <Box
                display={"flex"}
                flexDir={"column"}
                flexGrow={1}
                height="100%"
                gap={4}
              >
                <Box
                  boxShadow={"xs"}
                  p={4}
                  flexGrow={1}
                  height="50%"
                  borderRadius={"md"}
                  display={"flex"}
                  flexDir={"column"}
                  gap={4}
                >
                  <Heading size={"md"}>Top 3 vendedores</Heading>
                  <Box display={"flex"} flexDir={"column"} gap={2}>
                    {topVendedores.map((vendedor, index) => (
                      <Flex
                        key={index}
                        boxShadow={"xs"}
                        borderRadius={"sm"}
                        p={2}
                        alignItems={"center"}
                        gap={4}
                        justify={"space-between"}
                      >
                        <Flex gap={4}>
                          <Box>
                            <Medal size={36} color={getMedalColor(index)} />
                          </Box>
                          <Flex flexDir={"column"} gap={1}>
                            <Heading size={"sm"}>{vendedor.op_nombre}</Heading>
                            <Text>Clientes visitados: {vendedor.cantidad}</Text>
                          </Flex>
                        </Flex>
                        <Box>
                          <Stat textAlign={"end"}>
                            <StatLabel textAlign={"end"}>
                              Ventas realizadas
                            </StatLabel>
                            <StatNumber textAlign={"end"}>
                              {formatCurrency(vendedor.total_ventas)}
                            </StatNumber>
                            <StatHelpText textAlign={"end"}>
                              <StatArrow type={"decrease"} />
                              0.0%
                            </StatHelpText>
                          </Stat>
                        </Box>
                      </Flex>
                    ))}
                  </Box>
                </Box>
                <Box
                  boxShadow={"xs"}
                  p={4}
                  flexGrow={1}
                  height="50%"
                  borderRadius={"md"}
                  display={"flex"}
                  flexDir={"column"}
                  gap={4}
                >
                  <Heading size={"md"}>Top 3 clientes</Heading>
                  <Box display={"flex"} flexDir={"column"} gap={2}>
                    {topClientes.map((cliente, index) => (
                      <Flex
                        key={index}
                        boxShadow={"xs"}
                        borderRadius={"sm"}
                        p={2}
                        alignItems={"center"}
                        gap={4}
                        justify={"space-between"}
                      >
                        <Flex gap={4}>
                          <Box>
                            <Medal size={36} color={getMedalColor(index)} />
                          </Box>
                          <Flex flexDir={"column"} gap={1}>
                            <Heading size={"sm"}>
                              {cliente.cliente_nombre}
                            </Heading>
                            <Text>Pedidos realizados: {cliente.cantidad}</Text>
                          </Flex>
                        </Flex>
                        <Box>
                          <Stat textAlign={"end"}>
                            <StatLabel textAlign={"end"}>
                              Compras realizadas
                            </StatLabel>
                            <StatNumber textAlign={"end"}>
                              {formatCurrency(cliente.total_ventas)}
                            </StatNumber>
                            <StatHelpText textAlign={"end"}>
                              <StatArrow type={"decrease"} />
                              0.0%
                            </StatHelpText>
                          </Stat>
                        </Box>
                      </Flex>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default RuteamientosDashboard;
