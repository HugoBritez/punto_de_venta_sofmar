import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Flex,
  Box,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react"; // Añadir esta importación

interface ModalMultiselectorProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  onSearch: (searchTerm: string) => void;
  onSelect: (item: T) => void;
  searchPlaceholder?: string;
  idField: keyof T;
  displayField: keyof T;
  selectedItems: T[];
  onConfirm?: () => void;
}

export const ModalMultiselector = <T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  items,
  onSearch,
  onSelect,
  searchPlaceholder = "Buscar...",
  idField,
  displayField,
  selectedItems = [],
  onConfirm,
}: ModalMultiselectorProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    String(item[displayField]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size={"md"}>{title}</Heading>
        </ModalHeader>
        <ModalBody gap={4}>
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
            mb={4}
          />
          <Flex flexDirection={"column"} gap={2} overflowY={"auto"} h={"500px"}>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(
                (selectedItem) =>
                  String(selectedItem[idField]) === String(item[idField])
              );
              return (
                <Box
                  key={item[idField]}
                  p={2}
                  rounded={"md"}
                  bg={isSelected ? "blue.100" : "gray.100"}
                  cursor={"pointer"}
                  _hover={{ bg: isSelected ? "blue.200" : "gray.200" }}
                  onClick={() => {
                    onSelect(item);
                  }}
                >
                  <Text>{item[displayField]}</Text>
                </Box>
              );
            })}
          </Flex>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button colorScheme="blue" onClick={onConfirm}>
            Confirmar
          </Button>
          <Button colorScheme="red" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
