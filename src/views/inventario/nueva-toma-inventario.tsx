import HeaderComponent from "@/modules/Header";
import { Flex } from "@chakra-ui/react";
import { ArchiveRestore } from "lucide-react";

const NuevaTomaInventario = () => {
  return (
    <Flex bg={'gray.100'} h={'100vh'} display={'flex'} flexDirection={'column'} p={2} gap={2}>
        <HeaderComponent Icono={ArchiveRestore} titulo="Inventario de articulos" />
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 bg-white">
            
        </div>


    </Flex>


  )
}

export default NuevaTomaInventario;
