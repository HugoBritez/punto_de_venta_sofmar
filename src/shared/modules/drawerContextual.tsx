import { api_url } from "@/utils";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { WalletCards } from "lucide-react";
import { useEffect, useState } from "react";

interface DrawerContextualProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  verificarCajaAbierta: () => void;
  sucursal: number;
  deposito: number;
}

function DrawerContextual({ isOpen, onClose, verificarCajaAbierta, sucursal, deposito }: DrawerContextualProps) {
  const [fecha, setFecha] = useState(new Date());
  const operador = sessionStorage.getItem("userName");
  const operadorId = Number(sessionStorage.getItem("user_id"));
  const [moneda, setMoneda] = useState(2);
  const [area, setArea] = useState(1);
  const [turno, setTurno] = useState(1);
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const toast = useToast();
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [cajaId, setCajaId] = useState<number>(0);
  const fechaActual = new Date().toISOString().split("T")[0];
  const horaActual = new Date().toLocaleTimeString();
  const [saldoFinal, setSaldoFinal] = useState<number>(0);

  async function verificarCaja() {
    try {
      const response = await axios.get(
        `${api_url}caja/verificar/${operadorId}`
      );
      console.log(response.data);
      if (
        response.data.body.length > 0 &&
        response.data.body[0].ca_fecha_cierre === null
      ) {
        setCajaAbierta(true);
        setCajaId(response.data.body[0].ca_codigo);
      } else {
        setCajaAbierta(false);
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

  async function iniciarCaja() {
    try {
      const response = await axios.post(
        `${api_url}caja/iniciar`,
        {
          caja: {
            fecha: fechaActual,
            operador: operadorId,
            definicion: 4,
            saldo_inicial: montoInicial,
            hora_inicio: horaActual,
            sucursal: sucursal,
            area: area,
            moneda: moneda,
            tipo_caja: 0,
            prioridad: 0,
            turno: turno,
          },
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMontoInicial(0);
      verificarCaja();
      verificarCajaAbierta();
      console.log(response.data);
      toast({
        title: "Caja iniciada",
        description: "La caja se inició correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar la caja",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function cerrarCaja() {
    try {
      await axios.post(
        `${api_url}caja/cerrar`,
        {
          ca_codigo: cajaId,
          ca_fecha_cierre: fechaActual,
          ca_hora_cierre: horaActual,
          ca_saldo_final: saldoFinal,
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSaldoFinal(0);
      verificarCaja();
      verificarCajaAbierta();
      toast({
        title: "Caja cerrada",
        description: "La caja se cerró correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar cerrar la caja",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    setFecha(new Date());
    verificarCaja();
    console.log('datos del drawer', operador, operadorId, sucursal, deposito, moneda);
  }, []);

  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Menú administrativo</DrawerHeader>

        <DrawerBody>
          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                    {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
                  </Box>
                  <WalletCards />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Flex
                  direction="column"
                  justifyContent="center"
                  alignItems="end"
                  w="100%"
                  h="100%"
                >
                  {cajaAbierta ? (
                    <Flex
                    direction="column"
                    justifyContent="center"
                    alignItems="end"
                    w="100%"
                    h="100%"
                    py={4}
                    pr={24}
                    gap={4}
                    >
                    <Flex alignItems={"center"}>
                      <FormLabel fontWeight={"bold"}>Saldo final</FormLabel>
                      <Input
                        type="number"
                        placeholder="Saldo final"
                        variant={"filled"}
                        w={"200px"}
                        onChange={(e) => {
                          setSaldoFinal(parseInt(e.target.value));
                        }}
                      ></Input>
                    </Flex>
                    </Flex>
                  ) : (
                    <Flex
                      direction="column"
                      justifyContent="center"
                      alignItems="end"
                      w="100%"
                      h="100%"
                      py={4}
                      pr={24}
                      gap={4}
                    >
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <FormLabel fontWeight={"bold"}>Fecha</FormLabel>
                        <Input
                          type="date"
                          placeholder="Fecha"
                          variant={"filled"}
                          w={"200px"}
                          isDisabled={true}
                          value={fecha.toISOString().split("T")[0]}
                        ></Input>
                      </Flex>
                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Operador</FormLabel>
                        <Input
                          type="text"
                          placeholder="Operador"
                          variant={"filled"}
                          w={"200px"}
                          isDisabled={true}
                          value={operador || ""}
                        ></Input>
                      </Flex>

                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Caja</FormLabel>
                        <Input
                          type="text"
                          placeholder="Caja"
                          variant={"filled"}
                          w={"200px"}
                        ></Input>
                      </Flex>
                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Moneda</FormLabel>
                        <Select
                          placeholder="Seleccione una moneda"
                          variant={"filled"}
                          defaultValue={"2"}
                          w={"200px"}
                          onChange={(e) => {
                            setMoneda(parseInt(e.target.value));
                          }}
                        >
                          <option value="1">Dólares</option>
                          <option value="2">Guaranies</option>
                        </Select>
                      </Flex>
                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Area</FormLabel>
                        <Select
                          placeholder="Seleccione un area"
                          variant={"filled"}
                          defaultValue={"1"}
                          w={"200px"}
                          onChange={(e) => {
                            setArea(parseInt(e.target.value));
                          }}
                        >
                          <option value="1">CAJA</option>
                        </Select>
                      </Flex>
                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Turno</FormLabel>
                        <Select
                          placeholder="Seleccione un turno"
                          variant={"filled"}
                          w={"200px"}
                          onChange={(e) => {
                            setTurno(parseInt(e.target.value));
                          }}
                        >
                          <option value="1">Mañana</option>
                          <option value="2">Tarde</option>
                          <option value="3">Noche</option>
                        </Select>
                      </Flex>
                      <Flex alignItems={"center"}>
                        <FormLabel fontWeight={"bold"}>Monto inicial</FormLabel>
                        <Input
                          type="number"
                          placeholder="Monto inicial"
                          variant={"filled"}
                          w={"200px"}
                          value={montoInicial}
                          onChange={(e) => {
                            setMontoInicial(parseInt(e.target.value));
                          }}
                        ></Input>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
                <Box display={"flex"} w={"100%"} justifyContent={"end"}>
                  <Button
                    colorScheme={cajaAbierta ? "red" : "green"}
                    onClick={cajaAbierta ? cerrarCaja : iniciarCaja}
                  >
                    {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
                  </Button>
                </Box>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        Ingresar Cotización
                      </Box>
                      {isExpanded ? (
                        <MinusIcon fontSize="12px" />
                      ) : (
                        <AddIcon fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}></AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
        </DrawerBody>

        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerContextual;
