import { Flex } from "@chakra-ui/react";
import ConfiguracionesMenu from "./Configuraciones";

function Configuraciones() {
  return (
    <>
      <Flex h={"100vh"} w={"100%"} bg={"black"}>
        <ConfiguracionesMenu />
      </Flex>
    </>
  );
}

export default Configuraciones;
