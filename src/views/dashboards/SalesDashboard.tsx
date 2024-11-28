"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Heading,
  useToast,
  Tabs,
  TabList,
  Tab,
  Flex,
  useMediaQuery,
  Text,
  HStack,
  Select,
} from "@chakra-ui/react";
import {
  format,
  subDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { api_url } from "@/utils";
import { ChartLine, HandCoins } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import fondoDashboardResponsive from '@/assets/bg/fondodashboardResponsive.png';
import fondoDashboard from '@/assets/bg/fondodashboard.png';

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
  total: string;
  descuento: number;
  saldo: number;
  condicion: string;
  vencimiento: string;
  factura: string;
  obs: string;
  estado: number;
  estado_desc: string;
}

const periodos = [
  { label: "Hoy", value: "hoy" },
  { label: "Ayer", value: "ayer" },
  { label: "Últimos 3 Días", value: "tresDias" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mes", value: "mes" },
  { label: "Anual", value: "ano" },
];

export default function VentasChart() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
  const [, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const verGrafico = localStorage.getItem("permiso_graficos") === "1";

  useEffect(() => {
    fetchVentas();
  }, [fechaDesde, fechaHasta]);

  const fetchVentas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        sucursal: "",
        cliente: "",
        vendedor: "",
        articulo: "",
        moneda: "",
        factura: "",
      });
      setVentas(response.data.body);
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

  const handlePeriodoChange = (index: number) => {
    setPeriodoSeleccionado(index);
    const hoy = new Date();
    let nuevaFechaDesde = hoy;

    switch (periodos[index].value) {
      case "hoy":
        nuevaFechaDesde = hoy;
        break;
      case "ayer":
        nuevaFechaDesde = subDays(hoy, 1);
        break;
      case "tresDias":
        nuevaFechaDesde = subDays(hoy, 2);
        break;
      case "semana":
        nuevaFechaDesde = startOfWeek(hoy);
        break;
      case "mes":
        nuevaFechaDesde = startOfMonth(hoy);
        break;
      case "ano":
        nuevaFechaDesde = startOfYear(new Date(selectedYear, 0, 1));
        setFechaHasta(
          format(endOfYear(new Date(selectedYear, 0, 1)), "yyyy-MM-dd")
        );
        return;
    }

    setFechaDesde(format(nuevaFechaDesde, "yyyy-MM-dd"));
    setFechaHasta(format(hoy, "yyyy-MM-dd"));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    setFechaDesde(format(startOfYear(new Date(year, 0, 1)), "yyyy-MM-dd"));
    setFechaHasta(format(endOfYear(new Date(year, 0, 1)), "yyyy-MM-dd"));
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("es-ES", { minimumFractionDigits: 0 });
  };

  const sumaTotalVentas = useMemo(() => {
    return ventas.reduce((total, venta) => {
      const ventaNumero = parseFloat(venta.total.replace(/[^\d.-]/g, ""));
      return total + (isNaN(ventaNumero) ? 0 : ventaNumero);
    }, 0);
  }, [ventas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const dataDelGrafico = ventas.map((dato) => {
    return {
      monto: parseFloat(dato.total.replace(/[^\d.-]/g, "")) || 0,
      fecha: dato.fecha,
    };
  });

  const maxMonto = Math.max(...dataDelGrafico.map((d) => d.monto));

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (!verGrafico) {
    return isMobile ? (
      <Box
        h="95vh"
        w="99vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        backgroundImage={`url(${fondoDashboardResponsive})`}
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
        backgroundImage={`url(${fondoDashboard})`}
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        backgroundPosition="top"
        overflow="hidden"
      ></Box>
    );
  }

  return (
    <Box
      h="100%"
      w="100%"
      display="flex"
      justifyContent="start"
      p={isMobile ? 2 : 6}
    >
      <Box
        maxW={isMobile ? "100%" : "80vw"}
        bg="white"
        my={4}
        p={isMobile ? 3 : 6}
        shadow="xl"
        rounded="lg"
        border="1px"
        borderColor="gray.200"
      >
        <VStack spacing={isMobile ? 4 : 8} align="stretch">
          {/* Encabezado */}
          <Flex
            bgGradient="linear(to-r, blue.500, blue.600)"
            color="white"
            p={isMobile ? 3 : 6}
            rounded="md"
            alignItems="center"
            justifyContent="center"
            mb={4}
          >
            <ChartLine size={28} className="mr-2" />
            <Heading size={isMobile ? "md" : "lg"}>Ventas</Heading>
          </Flex>

          {/* Contenido de Ventas */}
          <Box
            p={isMobile ? 4 : 6}
            bg="gray.50"
            shadow="md"
            rounded="md"
            border="1px"
            borderColor="gray.200"
          >
            <Heading size={isMobile ? "sm" : "md"} color="gray.700" mb={4}>
              Ventas Totales
            </Heading>

            {/* Tabs de Periodos */}
            <Tabs
              index={periodoSeleccionado}
              onChange={handlePeriodoChange}
              variant="solid-rounded"
              colorScheme="green"
              mb={4}
              isFitted
            >
              <TabList>
                {periodos.map((periodo, index) => (
                  <Tab
                    key={index}
                    fontSize={isMobile ? "xx-small" : "sm"}
                    p={2}
                  >
                    {periodo.label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            {/* Selección de Año */}
            {periodoSeleccionado === 5 && (
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                mb={4}
                size="sm"
                variant="filled"
                borderColor="blue.500"
                borderRadius="md"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            )}

            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={dataDelGrafico}
                margin={{ top: 5, right: 2, left: 2, bottom: 2 }}
              >
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fecha"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  label={"Fecha"}
                />
                <YAxis
                  domain={[0, maxMonto]}
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  label={"Monto"}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                  itemStyle={{ color: "#82ca9d" }}
                />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="#82ca9d"
                  fill="url(#colorPv)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Total de Ventas */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              mt={5}
              py={3}
              px={4}
              bg="gray.100"
              rounded="md"
            >
              <HandCoins size={24} color="green" />
              <Heading size="xs" color="blue.600">
                Total Ventas:
              </Heading>
              <Text
                fontSize={isMobile ? "lg" : "2xl"}
                fontWeight="bold"
                color="green.700"
              >
                Gs. {formatNumber(sumaTotalVentas)}
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
