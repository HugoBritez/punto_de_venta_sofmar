import {
  Box,
  Flex,
  VStack,
  Text,
  Divider,
  Button,
  useToast,
} from "@chakra-ui/react";
import HeaderComponent from "../../modules/Header";
import {  Route, RouteOff, Truck } from "lucide-react";
import { Grid } from "@chakra-ui/react";
import { Agenda, Cliente } from "@/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/AuthContext";
import RuteamientoCard from "./RuteamientoCard";
import RutaActualCard from "./RutaActualCard";
import Auditar from "@/services/AuditoriaHook";

const fechaDesde = new Date().toISOString().split("T")[0];
const fechaHasta = new Date().toISOString().split("T")[0];

const Rutas = () => {
  const operadorActual = Number(sessionStorage.getItem("user_id"));
  const operadorActualNombre = sessionStorage.getItem("user_name");
  const [rutas, setRutas] = useState<Agenda[]>([]);
  const [rutaActual, setRutaActual] = useState<Agenda | null>(null);
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { auth } = useAuth();
  const [, setError] = useState<string | null>(null);
  const [inicioRuta, setInicioRuta] = useState<boolean>(false);
  const operadorMovimiento = Number(sessionStorage.getItem('operador_movimiento'));

  const handleInicioRuta = () => {
    if (rutas.length === 0) {
      toast({
        title: "Error",
        description: "No hay rutas agendadas hoy.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    Auditar(125, 1, operadorActual, Number(sessionStorage.getItem('user_id')), `Se inicio una nueva ruta de visitas por ${operadorActualNombre}`);
    setInicioRuta(true);
    sessionStorage.setItem("inicioRuta", "true");
  };

  const handlePararRuta = () => {
    Auditar(125, 1, operadorActual, Number(sessionStorage.getItem('user_id')), `Se detvo la ruta de visitas por ${operadorActualNombre}`);
    setInicioRuta(false);
    sessionStorage.setItem("inicioRuta", "false");
  };

  const fetchRuteamientos = async (vendedor: number) => {
    try {
      const response = await axios.post(`${api_url}agendas/`, {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        cliente: 0,
        vendedor: vendedor,
        visitado: 0,
        estado: 1,
        planificacion: -1,
        orden: "2",
      });
      setRutas(response.data.body);
      setRutaActual(response.data.body[0]);
      if (response.data.body){
        const rutaEnCurso = response.data.body.find((ruta: Agenda) => ruta.visitado === 'Sí');
        if (rutaEnCurso) {
          setInicioRuta(true);
          sessionStorage.setItem("inicioRuta", "true");
          setRutaActual(rutaEnCurso);
        }
      }
    } catch (error) {
      console.error("Error al traer las rutas:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al traer las rutas.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchClientes = async () => {
    if (!auth) {
      setError("No estás autentificado");
      return;
    }
    try {
      const response = await axios.get(operadorMovimiento ===1 ? `${api_url}clientes?vendedor=${operadorActual}` : `${api_url}clientes`);
      setClientes(response.data.body);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
      toast({
        title: "Error",
        description: "Hubo un problema al traer los artículos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchRuteamientos(operadorActual);
    fetchClientes();
  }, []);

  const handleFinalizarVisita = () => {
    if (rutas.length > 0) {
      const updatedRutas = rutas.filter(ruta => ruta.a_codigo !== rutaActual?.a_codigo)
      setRutas(updatedRutas)
    
      if (updatedRutas.length > 0) {
        setRutaActual(updatedRutas[0])
      } else {
        setRutaActual(null)
        setInicioRuta(false)
        sessionStorage.setItem("inicioRuta", "false")
        toast({
          title: "Ruta finalizada",
          description: "Has completado todas las visitas programadas.",
          status: "info",
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }



  const clienteId = (cliente: string) => {
    const clienteEncontrado = clientes.find((c) => c.cli_razon === cliente);
    return clienteEncontrado?.cli_codigo;
  };

  return (
    <>
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
          <HeaderComponent titulo={"Rutas"} Icono={Truck} />
          {inicioRuta ? (
            <Text
              fontSize="md"
              fontWeight="bold"
              color="red.500"
              align={"center"}
            >
              Ruta en curso
            </Text>
          ) : (
            <Flex
              bg={"green.500"}
              h={20}
              borderRadius={"md"}
              p={4}
              alignItems={"center"}
              justify={"center"}
            >
              <Text fontSize={20} color={"white"} fontWeight={"bold"}>
                Bienvenido, {operadorActualNombre}
              </Text>
            </Flex>
          )}
          <Flex justify={"space-between"} alignItems={"center"} gap={4}>
            <Divider colorScheme="blue"></Divider>
            <Text fontSize={"medium"} fontWeight={"bold"}>
              Visitas:
            </Text>
            <Divider></Divider>
          </Flex>
          {inicioRuta ? (
            <RutaActualCard
              clienteNombre={rutaActual?.cliente}
              clienteId={rutaActual?.cliente_id}
              vendedorId={
                rutaActual?.vendcod ? Number(rutaActual.vendcod) : undefined
              }
              clienteTelefono={rutaActual?.cli_tel}
              observacion={rutaActual?.a_obs}
              fecha={rutaActual?.fecha}
              hora={rutaActual?.a_hora}
              dia={rutaActual?.a_dias}
              vendedor={rutaActual?.vendedor}
              prioridad={rutaActual?.a_prioridad}
              visitado={rutaActual?.a_visitado}
              estado={rutaActual?.a_estado}
              planificacion={rutaActual?.a_planificacion}
              ruteamientoId={rutaActual?.a_codigo}
              latitud={rutaActual?.a_latitud}
              longitud={rutaActual?.a_longitud}
              fetchRuteamientos={() => fetchRuteamientos(operadorActual)}
              onFinalizarVisita={handleFinalizarVisita}
              visita_en_curso={rutaActual?.visita_en_curso}
            />
          ) : (
            <Grid
              width={"100%"}
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={4}
            >
              {rutas.map((ruteamiento) => (
                <RuteamientoCard
                  key={ruteamiento.a_codigo}
                  clienteNombre={ruteamiento.cliente}
                  observacion={ruteamiento.a_obs}
                  vendedor={ruteamiento.vendedor}
                  prioridad={ruteamiento.a_prioridad}
                  ruteamientoId={ruteamiento.a_codigo}
                  fecha={ruteamiento.fecha}
                  hora={ruteamiento.a_hora}
                  dia={ruteamiento.a_dias}
                  latitud={ruteamiento.a_latitud}
                  longitud={ruteamiento.a_longitud}
                  clienteTelefono={ruteamiento.cli_tel}
                  misVisitas={ruteamiento.mis_visitas}
                  misVisitasCliente={ruteamiento.mis_visitas_cliente}
                  visitado={ruteamiento.a_visitado}
                  planificacion={ruteamiento.a_planificacion}
                  estado={ruteamiento.a_estado}
                  l_longitud={ruteamiento.l_longitud}
                  l_latitud={ruteamiento.l_latitud}
                  fetchRuteamientos={() => fetchRuteamientos(operadorActual)}
                  clienteId={clienteId(ruteamiento.cliente) ?? 0}
                />
              ))}
            </Grid>
          )}
        </VStack>
        {/* FAB Button */}
        <Button
          position="fixed"
          bottom="60px"
          left="20px"
          borderRadius="md"
          h="3rem"
          p={4}
          colorScheme={
            rutas.length === 0 ? "gray" : inicioRuta ? "red" : "green"
          }
          boxShadow="lg"
          onClick={inicioRuta ? handlePararRuta : handleInicioRuta}
        >
          <Flex justify="center" align="center" gap={2}>
            {inicioRuta ? (
              <>
                <Text fontSize="md" fontWeight="bold">
                  Parar Ruta
                </Text>
                <RouteOff size={24} />
              </>
            ) : (
              <>
                <Text fontSize="md" fontWeight="bold">
                  Iniciar
                </Text>
                <Route size={24} />
              </>
            )}
          </Flex>
        </Button>
      </Box>
    </>
  );
};

export default Rutas;