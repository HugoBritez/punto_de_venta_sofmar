import { api_url } from "@/utils";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

interface AutorizacionModalProps {
  isOpen?: boolean;
  onOpen: () => void;
  onClose?: () => void;
  pedidoId: number | null;
  fetchPedidos: () => void;
}

const AutorizacionModal = ({
  isOpen = false,
  onClose = () => {},
  pedidoId,
  fetchPedidos,
}: AutorizacionModalProps) => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleAuthorize = async () => {
    try {
      const response = await axios.post(`${api_url}usuarios/login`, {
        user: usuario,
        pass: password,
      });
      console.log(response.data.body.usuario[0].op_autorizar);
  
      if (response.data.body.usuario[0].op_autorizar === 1) {
        const authResponse = await axios.post(`${api_url}pedidos/autorizar`, {
          pedido: pedidoId, // Asegúrate de pasar el ID del pedido correcto
          user: usuario
        });

        console.log(authResponse.data);
        onClose();
        toast({
          title: "Pedido autorizado",
          description: "El pedido ha sido autorizado y actualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchPedidos();
      } else {
        toast({
          title: "Permiso denegado",
          description: "No tienes permisos para autorizar pedidos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    console.log("Pedido ID:", pedidoId);
    }, [pedidoId]);

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Por favor autentifíquese</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            w={"100%"}
            gap={4}
          >
            <Box w={"100%"}>
              <FormLabel>Usuario</FormLabel>
              <Input
                placeholder="Ingrese su usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </Box>
            <Box w={"100%"}>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter gap={4}>
          <Button colorScheme="red" variant={"ghost"} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="green" mr={3} onClick={handleAuthorize}>
            Autorizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AutorizacionModal;
