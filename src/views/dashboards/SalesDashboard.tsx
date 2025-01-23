import {
  Box,
  Flex,
  Heading,
  useMediaQuery,
  Text,
  Select,
} from "@chakra-ui/react";

import fondoDashboardResponsive from "@/assets/bg/fondodashboardResponsive.png";
import fondoDashboard from "@/assets/bg/fondodashboard.png";
import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";
import { api_url } from "@/utils";
import { useEffect, useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";

export default function VentasChart() {
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const verGrafico = sessionStorage.getItem("permiso_graficos") === "1";
  const [tipo, setTipo] = useState("hoy");
  const [ventasData, setVentasData] = useState([]);
  const [totalVentas, setTotalVentas] = useState("");
  const [cantidadVentas, setCantidadVentas] = useState(0);
  const [cantidadProductosVendidos, setCantidadProductosVendidos] =
    useState("");

  const traerVentas = async () => {
    try {
      const response = await axios.get(`${api_url}venta/ventas-data`, {
        params: {
          tipo,
        },
      });
      console.log(response.data.body);

      // Convertir total_ventas a número
      const datosFormateados = response.data.body.map((item: any) => ({
        ...item,
        total_ventas: parseFloat(item.total_ventas),
      }));
      setVentasData(datosFormateados);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalVentas = async () => {
    try {
      const response = await axios.get(`${api_url}venta/total-ventas`, {
        params: {
          tipo,
        },
      });
      console.log(response.data.body);
      setTotalVentas(response.data.body[0].total_ventas);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCantidadVentas = async () => {
    try {
      const response = await axios.get(`${api_url}venta/contar-ventas`, {
        params: {
          tipo,
        },
      });
      console.log(response.data.body);
      setCantidadVentas(response.data.body[0].cantidad_ventas);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCantidadArticulos = async () => {
    try {
      const response = await axios.get(`${api_url}venta/contar-articulos`, {
        params: {
          tipo,
        },
      });
      console.log(response.data.body);
      setCantidadProductosVendidos(response.data.body[0].cantidad_articulos);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    traerVentas();
    fetchTotalVentas();
    fetchCantidadVentas();
    fetchCantidadArticulos();
  }, [tipo]);

  if (!verGrafico) {
    return isMobile ? (
      <Box
        h="100%"
        w="100%"
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

  const formatMonto = (monto: number) => {
    return monto.toLocaleString("es-PY", {
      style: "currency",
      currency: "PYG",
    });
  };

  const redondear = (numero: number) => {
    return Math.floor(numero);
  };

  const GraficoVentas = () => {
    if (!ventasData || ventasData.length === 0) {
      return (
        <Box
          h="100%"
          w="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"

        >
          <Text fontSize="xl" fontWeight="bold" color={'gray.600'}>
            Aún no hay datos para mostrar
          </Text>
        </Box>
      );
    }

    return (
      <AreaChart
        margin={{ top: isMobile? 10 : 50, right: 0, left: isMobile? 0 : 60, bottom: 0 }}
        width={isMobile? 500 : 700}
        height={ 300}
        data={ventasData}
      >
        <defs>
          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3cab73" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#3cab73" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="fecha" />
        <YAxis />
        <Tooltip
          itemStyle={{ color: "#3cab73", fontWeight: "bold", fontSize: "14px" }}
          wrapperStyle={{
            backgroundColor: "#fff",
            padding: "5px",
            borderRadius: "5px",
            boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.2)",
          }}
          formatter={(value) => [value.toLocaleString(), "Total Gs.:"]}
        />
        <Area
          type="monotone"
          dataKey="total_ventas"
          stroke="#3cab73"
          fillOpacity={1}
          fill="url(#colorV)"
        />
      </AreaChart>
    );
  };

  return (
    <>
      <Box h={"100vh"} p={2} display={"flex"} flexDirection={"column"} gap={2}>
        <Flex
          h={"10%"}
          w={"100%"}
          bg={"white"}
          borderRadius={"md"}
          boxShadow={"sm"}
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          p={4}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Flex alignItems={"center"}>
            <ChartNoAxesCombined size={32} className="mr-2" />
            <Heading size={"md"}>Dashboard de Ventas</Heading>
          </Flex>
          <Select
            ml={"auto"}
            w={"10%"}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            bg={"white"}
            color={"black"}
          >
            <option value="año">Año</option>
            <option value="mes">Mes</option>
            <option value="semana">Semana</option>
            <option value="hoy">Hoy</option>
          </Select>
        </Flex>
        <Flex h={"90%"} w={"100%"} gap={2}>
          <Box
            h={"100%"}
            w={isMobile? '100%' : "60%"}
            display={"flex"}
            flexDirection={"column"}
            gap={2}
          >
            <Flex h={"20%"} w={"100%"} gap={2} flexDir={isMobile? 'column' : 'row'}>
              <Box
                h={"100%"}
                w={isMobile? "100%" : "20%"}
                bg={"white"}
                borderRadius={"md"}
                boxShadow={"sm"}
                p={4}
                justifyItems={"center"}
                alignContent={"center"}
              >
                <Text textAlign={"center"}>Total de ventas</Text>
                <Text fontWeight={"bold"} fontSize={"x-large"}>
                  {formatMonto(Number(totalVentas))}
                </Text>
              </Box>
              <Box
                h={"100%"}
                w={isMobile? "100%" : "20%"}
                bg={"white"}
                borderRadius={"md"}
                boxShadow={"sm"}
                p={4}
                justifyItems={"center"}
                alignContent={"center"}
              >
                <Text textAlign={"center"}>Cantidad de tickets</Text>
                <Text fontWeight={"bold"} fontSize={"x-large"}>
                  {cantidadVentas}
                </Text>
              </Box>
              <Box
                h={"100%"}
                w={isMobile? "100%" : "20%"}
                bg={"white"}
                borderRadius={"md"}
                boxShadow={"sm"}
                p={4}
                justifyItems={"center"}
                alignContent={"center"}
              >
                <Text textAlign={"center"}>Items vendidos</Text>
                <Text fontWeight={"bold"} fontSize={"x-large"}>
                  {redondear(Number(cantidadProductosVendidos))}
                </Text>
              </Box>
            </Flex>
            {isMobile? <Box h={"20%"} w={"100%"}></Box> : null}
            <Flex
              h={ "60%"}
              w={isMobile? "100%" : "61.5%"}
              bg={"white"}
              borderRadius={"md"}
              boxShadow={"sm"}
              p={4}
              justifyItems={"center"}
              alignContent={"center"}
              alignItems={'center'}
              border={"1px solid #3cab73"}
            >
              <GraficoVentas />
            </Flex>
          </Box>
          <Box h={"100%"} w={"20%"}></Box>
          <Box h={"100%"} w={"20%"}></Box>
        </Flex>
      </Box>
    </>
  );
}
