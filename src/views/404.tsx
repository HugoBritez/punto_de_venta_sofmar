import { Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";




const NoExiste = () => {
const navigate = useNavigate();

    const handleBack = () => {
        navigate('/home');
    }
  return (
    <Flex justifyContent="center" alignItems="center" h="100vh" flexDir={'column'} gap={8}>
        <Heading size="2xl">No tienes los permisos para acceder a este módulo</Heading>
        <Button colorScheme="blue" onClick={handleBack}>Volver atrás</Button>
    </Flex>
  )
}
export default NoExiste;
